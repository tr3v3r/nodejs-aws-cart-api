import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { aws_apigateway as apigateway, aws_secretsmanager as secretsmanager  } from 'aws-cdk-lib';
import * as path from 'path';

import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class NestServerlessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dbCredentialsSecret = new secretsmanager.Secret(this, 'MyDBCreds', {
      secretName: 'MyDBCredsName',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'postgres'
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password'
      }
    });




    const vpc = new ec2.Vpc(this, 'MyVPC', {
      maxAzs: 2, // Default is all AZs in the region
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DBSecurityGroup', {
      vpc,
      description: 'Allow access to RDS instance from any IP address',
      allowAllOutbound: true,
    });

    const dbInstance = new rds.DatabaseInstance(this, 'RDSInstance', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_13_15,
      }),
      databaseName: 'cart',
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
      vpc,
      credentials: rds.Credentials.fromSecret(dbCredentialsSecret),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      },
      securityGroups: [dbSecurityGroup],
      multiAz: false,
      allocatedStorage: 20,
      maxAllocatedStorage: 20,
      allowMajorVersionUpgrade: false,
      autoMinorVersionUpgrade: true,
      backupRetention: cdk.Duration.days(7),
      deleteAutomatedBackups: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false,
    });


    const lambdaFunction = new lambdaNodejs.NodejsFunction(this, 'LambdaFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'main.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../project/dist')),
      timeout: cdk.Duration.seconds(30),
      vpc,
      allowPublicSubnet: true,
      environment: {
        DATABASE_HOST: dbCredentialsSecret.secretValueFromJson('host').unsafeUnwrap(),
        DATABASE_PORT: dbCredentialsSecret.secretValueFromJson('port').unsafeUnwrap(),
        DATABASE_USERNAME: dbCredentialsSecret.secretValueFromJson('username').unsafeUnwrap(),
        DATABASE_PASSWORD: dbCredentialsSecret.secretValueFromJson('password').unsafeUnwrap(),
        DATABASE_NAME: dbCredentialsSecret.secretValueFromJson('dbname').unsafeUnwrap(),
      }
     
     })

     dbInstance.connections.allowDefaultPortFrom(lambdaFunction)
    //  dbCredentialsSecret.grantRead(lambdaFunction);

     const api = new apigateway.RestApi(this, 'NestApi', {
      restApiName: 'Nest Service',
      description: 'This service serves a Nest.js application.',
    });
   
    const getLambdaIntegration = new apigateway.LambdaIntegration(lambdaFunction);

    api.root.addProxy({
      defaultIntegration: getLambdaIntegration,     
    })
  }
}
