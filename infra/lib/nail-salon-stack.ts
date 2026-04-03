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
