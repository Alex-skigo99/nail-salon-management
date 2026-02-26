// Import your Express app
import app from "./index";
import serverless from "serverless-http";

const handlerProxy = serverless(app);

export const handler = async (event: any, context: any) => {
  try {
    console.log("Lambda handler invoked with event:", JSON.stringify(event));
    return await handlerProxy(event, context);
  } catch (error) {
    console.error("Handler execution failed:", error);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
