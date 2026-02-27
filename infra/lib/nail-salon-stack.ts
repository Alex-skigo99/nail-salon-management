import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
// import * as ec2 from "aws-cdk-lib/aws-ec2";

export class NailSalonStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL must be set when deploying the NailSalonStack");
    }

    // const vpcId = this.node.tryGetContext("vpcId") ?? process.env.VPC_ID;
    // if (!vpcId) {
    //   throw new Error("VPC ID is required (provide via context key 'vpcId' or env var VPC_ID)");
    // }

    // const dbSecurityGroupId = this.node.tryGetContext("dbSecurityGroupId") ?? process.env.DB_SECURITY_GROUP_ID;
    // if (!dbSecurityGroupId) {
    //   throw new Error(
    //     "Database security group ID is required (provide via context key 'dbSecurityGroupId' or env var DB_SECURITY_GROUP_ID)"
    //   );
    // }

    // const rawDbPort = this.node.tryGetContext("dbPort") ?? process.env.DB_PORT;
    // const dbPort = Number(rawDbPort ?? "5432");
    // if (!Number.isFinite(dbPort) || dbPort <= 0) {
    //   throw new Error("dbPort must be a valid port number (default 5432)");
    // }

    // const vpc = ec2.Vpc.fromLookup(this, "ExistingVpc", { vpcId });
    // const databaseSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
    //   this,
    //   "DatabaseSecurityGroup",
    //   dbSecurityGroupId,
    //   {
    //     mutable: true,
    //   }
    // );
    // const lambdaSecurityGroup = new ec2.SecurityGroup(this, "LambdaSecurityGroup", {
    //   vpc,
    //   allowAllOutbound: true,
    //   description: "Allow backend Lambdas to reach the RDS instance",
    // });

    // lambdaSecurityGroup.connections.allowTo(
    //   databaseSecurityGroup,
    //   ec2.Port.tcp(dbPort),
    //   "Allow API Lambda outbound traffic to the database"
    // );
    // databaseSecurityGroup.connections.allowFrom(
    //   lambdaSecurityGroup,
    //   ec2.Port.tcp(dbPort),
    //   "Allow database ingress from the API Lambda"
    // );

    const lambdaCommonProps = {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("../apps/api/dist"),
      environment: {
        DATABASE_URL: databaseUrl,
      },
      // vpc,
      // securityGroups: [lambdaSecurityGroup],
      // vpcSubnets: {
      //   subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      // },
    };

    const apiLambda = new lambda.Function(this, "nail-saloon-backend", {
      ...lambdaCommonProps,
      handler: "src/handler.handler",
      memorySize: 512,
      timeout: cdk.Duration.seconds(15),
    });

    const migrationLambda = new lambda.Function(this, "MigrationLambda", {
      ...lambdaCommonProps,
      handler: "src/migrate.handler",
      memorySize: 1024,
      timeout: cdk.Duration.minutes(5),
    });

    const frontendUrl = process.env.FRONTEND_URL?.trim().replace(/\/+$/, "");
    if (!frontendUrl) {
      throw new Error("FRONTEND_URL must be set for the API CORS configuration");
    }

    const httpApi = new apigateway.HttpApi(this, "HttpApi", {
      corsPreflight: {
        allowOrigins: [frontendUrl],
        allowHeaders: ["*"],
        allowMethods: [
          apigateway.CorsHttpMethod.GET,
          apigateway.CorsHttpMethod.POST,
          apigateway.CorsHttpMethod.PUT,
          apigateway.CorsHttpMethod.DELETE,
          apigateway.CorsHttpMethod.PATCH,
          apigateway.CorsHttpMethod.OPTIONS,
        ],
        allowCredentials: true,
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
