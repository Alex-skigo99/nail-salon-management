const swaggerJSDoc = require("swagger-jsdoc");
const fs = require("fs");
const path = require("path");

const configPath = path.resolve(__dirname, "..", "swagger.config.cjs");
if (!fs.existsSync(configPath)) {
  console.error("swagger.config.cjs not found at", configPath);
  process.exit(1);
}
const config = require(configPath);

// swagger-jsdoc only reads files (it doesn't execute them), so reading .ts files with JSDoc works.
const spec = swaggerJSDoc(config);

// Write openapi.json into the package root (apps/api/openapi.json)
const outPath = path.resolve(__dirname, "..", "openapi.json");
fs.writeFileSync(outPath, JSON.stringify(spec, null, 2));
console.log("Generated", outPath);
