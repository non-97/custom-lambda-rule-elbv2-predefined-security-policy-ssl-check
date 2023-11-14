import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import * as path from "path";

export class ConfigRuleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda function role
    const functionRole = new cdk.aws_iam.Role(this, "FunctionRole", {
      assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        new cdk.aws_iam.ManagedPolicy(this, "FunctionPolicy", {
          statements: [
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              resources: ["*"],
              actions: ["elasticloadbalancing:DescribeSSLPolicies"],
            }),
          ],
        }),
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    // Lambda function
    const lambdaFunction = new PythonFunction(this, "Function", {
      runtime: cdk.aws_lambda.Runtime.PYTHON_3_11,
      entry: path.join(__dirname, "../lib/lambda/check_elbv2_ssl_policy/"),
      handler: "lambda_handler",
      architecture: cdk.aws_lambda.Architecture.ARM_64,
      role: functionRole,
      logRetention: cdk.aws_logs.RetentionDays.TWO_WEEKS,
      timeout: cdk.Duration.seconds(15),
    });

    // Custom lambda rule
    new cdk.aws_config.CustomRule(this, "CustomRule", {
      configurationChanges: true,
      lambdaFunction,
      ruleScope: cdk.aws_config.RuleScope.fromResource(
        cdk.aws_config.ResourceType.ELBV2_LISTENER
      ),
      inputParameters: {
        sslPolicies:
          "ELBSecurityPolicy-TLS13-1-2-2021-06, ELBSecurityPolicy-TLS13-1-2-Res-2021-06",
      },
    });
  }
}
