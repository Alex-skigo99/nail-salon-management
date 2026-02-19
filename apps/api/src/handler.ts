// Import your Express app
import app from "./index";

// Wrap Express for Lambda
import serverless from "serverless-http";

export const handler = serverless(app);
