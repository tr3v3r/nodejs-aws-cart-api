#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NestServerlessStack } from '../lib/nets-serverless-stack';

const app = new cdk.App();
new NestServerlessStack(app, 'NestServerlessStack', {

});