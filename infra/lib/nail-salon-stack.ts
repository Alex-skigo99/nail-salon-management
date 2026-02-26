import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";

export class NailSalonStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const apiLambda = new lambda.Function(this, "nail-saloon-backend", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "src/handler.handler",
      code: lambda.Code.fromAsset("../apps/api/dist"),
      memorySize: 512,
      timeout: cdk.Duration.seconds(15),
      environment: {
        DATABASE_URL: process.env.DATABASE_URL!,
      },
    });

    const migrationLambda = new lambda.Function(this, "MigrationLambda", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "src/migrate.handler",
      code: lambda.Code.fromAsset("../apps/api/dist"),
      memorySize: 1024,
      timeout: cdk.Duration.minutes(5),
      environment: {
        DATABASE_URL: process.env.DATABASE_URL!,
      },
    });

    const httpApi = new apigateway.HttpApi(this, "HttpApi");

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
