import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";

export class NailSalonStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL must be set when deploying the NailSalonStack");
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET must be set when deploying the NailSalonStack");
    }

    const node_env = process.env.NODE_ENV || "development";
    const frontendUrl = process.env.FRONTEND_URL?.trim().replace(/\/+$/, "");
    if (!frontendUrl) {
      throw new Error("FRONTEND_URL must be set for the API CORS configuration");
    }
    console.log(
      `Deploying NailSalonStack in ${node_env} mode with DATABASE_URL=${databaseUrl} and FRONTEND_URL=${frontendUrl}`
    );
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@mail.com";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";
    const ADMIN_NAME = process.env.ADMIN_NAME || "admin";
    if (node_env === "production") {
      if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        throw new Error(
          "ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set in production for admin user creation"
        );
      }
      console.log(`Admin user will be created with email: ${ADMIN_EMAIL}`);
    }

    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;
    const TWILIO_CONTENT_SID = process.env.TWILIO_CONTENT_SID;
    if (node_env === "production") {
      if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM || !TWILIO_CONTENT_SID) {
        throw new Error(
          "TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, and TWILIO_CONTENT_SID must be set in production"
        );
      }
    }

    const ICLOUD_EMAIL = process.env.ICLOUD_EMAIL ?? "";
    const ICLOUD_APP_PASSWORD = process.env.ICLOUD_APP_PASSWORD ?? "";
    const ICLOUD_CALENDAR_NAME = process.env.ICLOUD_CALENDAR_NAME ?? "Work";
    const ICLOUD_DAYS_TO_SYNC = process.env.ICLOUD_DAYS_TO_SYNC ?? "60";
    const ICLOUD_DEFAULT_MASTER_ID = process.env.ICLOUD_DEFAULT_MASTER_ID ?? "1";

    // ── S3 bucket for image uploads ──
    const imagesBucket = new s3.Bucket(this, "ImagesBucket", {
      bucketName: `nail-salon-images-${node_env}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET],
          allowedOrigins: [frontendUrl],
          allowedHeaders: ["Content-Type", "x-amz-content-type"],
          maxAge: 3600,
        },
      ],
      lifecycleRules: [
        {
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
        },
      ],
    });

    const lambdaCommonProps = {
      runtime: lambda.Runtime.NODEJS_24_X,
      code: lambda.Code.fromAsset("../apps/api/dist"),
      environment: {
        DATABASE_URL: databaseUrl,
        FRONTEND_URL: frontendUrl,
        NODE_ENV: node_env,
        ADMIN_EMAIL: ADMIN_EMAIL,
        ADMIN_PASSWORD: ADMIN_PASSWORD,
        ADMIN_NAME: ADMIN_NAME,
        S3_BUCKET_NAME: imagesBucket.bucketName,
        SES_FROM_EMAIL: process.env.SES_FROM_EMAIL || "noreply@example.com",
        JWT_SECRET,
        JWT_EXPIRES_IN,
      },
    };

    const apiLambda = new lambda.Function(this, "nail-saloon-backend", {
      ...lambdaCommonProps,
      handler: "src/handler.handler",
      memorySize: 512,
      timeout: cdk.Duration.seconds(15),
    });

    imagesBucket.grantReadWrite(apiLambda);

    // ── SES permissions for sending emails ──
    apiLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        resources: ["*"],
      })
    );

    const migrationLambda = new lambda.Function(this, "MigrationLambda", {
      ...lambdaCommonProps,
      handler: "src/migrate.handler",
      memorySize: 1024,
      timeout: cdk.Duration.minutes(5),
    });

    // ── Reminder Lambda (triggered by EventBridge Scheduler) ──
    const reminderLambda = new lambda.Function(this, "ReminderLambda", {
      runtime: lambda.Runtime.NODEJS_24_X,
      code: lambda.Code.fromAsset("../apps/reminder/dist"),
      handler: "src/index.handler",
      memorySize: 256,
      timeout: cdk.Duration.minutes(2),
      environment: {
        DATABASE_URL: databaseUrl,
        NODE_ENV: node_env,
        TWILIO_ACCOUNT_SID: TWILIO_ACCOUNT_SID ?? "",
        TWILIO_AUTH_TOKEN: TWILIO_AUTH_TOKEN ?? "",
        TWILIO_WHATSAPP_FROM: TWILIO_WHATSAPP_FROM ?? "",
        TWILIO_CONTENT_SID: TWILIO_CONTENT_SID ?? "",
      },
    });

    // ── SyncCalendar Lambda (triggered by EventBridge Scheduler) ──
    const syncCalendarLambda = new lambda.Function(this, "SyncCalendarLambda", {
      runtime: lambda.Runtime.NODEJS_24_X,
      code: lambda.Code.fromAsset("../apps/syncCalendar/dist"),
      handler: "src/index.handler",
      memorySize: 256,
      timeout: cdk.Duration.minutes(3),
      environment: {
        DATABASE_URL: databaseUrl,
        NODE_ENV: node_env,
        ICLOUD_EMAIL,
        ICLOUD_APP_PASSWORD,
        ICLOUD_CALENDAR_NAME,
        ICLOUD_DAYS_TO_SYNC,
        ICLOUD_DEFAULT_MASTER_ID,
      },
    });

    // IAM role that EventBridge Scheduler can assume to invoke the reminder Lambda.
    // Admin uses the ReminderSchedulerRoleArn output when creating a schedule in the AWS console.
    const reminderSchedulerRole = new iam.Role(this, "ReminderSchedulerRole", {
      assumedBy: new iam.ServicePrincipal("scheduler.amazonaws.com"),
      description: "Allows EventBridge Scheduler to invoke the ReminderLambda",
    });
    reminderLambda.grantInvoke(reminderSchedulerRole);

    // IAM role that EventBridge Scheduler can assume to invoke the syncCalendar Lambda.
    const syncCalendarSchedulerRole = new iam.Role(this, "SyncCalendarSchedulerRole", {
      assumedBy: new iam.ServicePrincipal("scheduler.amazonaws.com"),
      description: "Allows EventBridge Scheduler to invoke the SyncCalendarLambda",
    });
    syncCalendarLambda.grantInvoke(syncCalendarSchedulerRole);

    const reminderScheduleName = `NailSalonReminderScheduler_${node_env}`;
    const reminderScheduleArn = this.formatArn({
      service: "scheduler",
      resource: "schedule",
      resourceName: `default/${reminderScheduleName}`,
    });
    const defaultScheduleGroupArn = this.formatArn({
      service: "scheduler",
      resource: "schedule-group",
      resourceName: "default",
    });

    const syncCalendarScheduleName = `NailSalonSyncCalendarScheduler_${node_env}`;
    const syncCalendarScheduleArn = this.formatArn({
      service: "scheduler",
      resource: "schedule",
      resourceName: `default/${syncCalendarScheduleName}`,
    });

    // Allows API Lambda settingsService to read/create/update the EventBridge reminder schedule.
    apiLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["scheduler:GetSchedule", "scheduler:CreateSchedule", "scheduler:UpdateSchedule"],
        resources: [reminderScheduleArn, defaultScheduleGroupArn],
      })
    );

    // Required by Scheduler Create/UpdateSchedule when setting Target.RoleArn.
    apiLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["iam:PassRole"],
        resources: [reminderSchedulerRole.roleArn],
      })
    );

    // Allows API Lambda settingsService to create/update/delete the iCloud sync schedule.
    apiLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "scheduler:GetSchedule",
          "scheduler:CreateSchedule",
          "scheduler:UpdateSchedule",
          "scheduler:DeleteSchedule",
        ],
        resources: [syncCalendarScheduleArn, defaultScheduleGroupArn],
      })
    );

    // Required for SyncCalendar Scheduler Create/UpdateSchedule when setting Target.RoleArn.
    apiLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["iam:PassRole"],
        resources: [syncCalendarSchedulerRole.roleArn],
      })
    );

    new cdk.CfnOutput(this, "ReminderLambdaArn", {
      value: reminderLambda.functionArn,
      description: "ARN of the Reminder Lambda — use as EventBridge Scheduler target",
    });
    new cdk.CfnOutput(this, "ReminderSchedulerRoleArn", {
      value: reminderSchedulerRole.roleArn,
      description: "IAM Role ARN for EventBridge Scheduler to invoke the Reminder Lambda",
    });

    new cdk.CfnOutput(this, "SyncCalendarLambdaArn", {
      value: syncCalendarLambda.functionArn,
      description: "ARN of the SyncCalendar Lambda — use as EventBridge Scheduler target",
    });
    new cdk.CfnOutput(this, "SyncCalendarSchedulerRoleArn", {
      value: syncCalendarSchedulerRole.roleArn,
      description: "IAM Role ARN for EventBridge Scheduler to invoke the SyncCalendar Lambda",
    });

    const httpApi = new apigateway.HttpApi(this, "HttpApi", {
      corsPreflight: {
        allowOrigins: [frontendUrl],
        allowHeaders: [
          "Content-Type",
          "Authorization",
          "X-Requested-With",
          "Accept",
          "Origin",
          "Referer",
          "Accept-Language",
          "X-Amz-Date",
          "X-Amz-Security-Token",
          "X-Api-Key",
        ],
        allowMethods: [
          apigateway.CorsHttpMethod.GET,
          apigateway.CorsHttpMethod.POST,
          apigateway.CorsHttpMethod.PUT,
          apigateway.CorsHttpMethod.DELETE,
          apigateway.CorsHttpMethod.PATCH,
          apigateway.CorsHttpMethod.OPTIONS,
        ],
        allowCredentials: true,
        maxAge: cdk.Duration.seconds(86400),
      },
    });

    httpApi.addRoutes({
      path: "/{proxy+}",
      methods: [apigateway.HttpMethod.ANY],
      integration: new integrations.HttpLambdaIntegration("LambdaIntegration", apiLambda),
    });

    new cdk.CfnOutput(this, "ApiUrl", {
      value: httpApi.url!,
    });
  }
}
