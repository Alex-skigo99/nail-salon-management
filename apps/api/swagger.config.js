module.exports = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "API (apps/api)",
      version: "1.0.0",
      description: "OpenAPI spec for apps/api",
    },
    // set an appropriate server URL for your deployed Lambda/API Gateway
    servers: [{ url: "https://osc2zjnl43.execute-api.us-east-1.amazonaws.com" }],
  },
  // Read JSDoc comments from TypeScript source files
  apis: ["./src/controllers/**/*.ts", "./src/routes/**/*.ts"],
};
