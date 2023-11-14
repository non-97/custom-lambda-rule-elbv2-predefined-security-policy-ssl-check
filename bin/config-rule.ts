#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ConfigRuleStack } from "../lib/config-rule-stack";

const app = new cdk.App();
new ConfigRuleStack(app, "ConfigRuleStack");
