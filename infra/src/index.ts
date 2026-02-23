import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { NailSalonStack } from "../lib/nail-salon-stack";

const app = new App();
new NailSalonStack(app, "NailSalonStack");
app.synth();
