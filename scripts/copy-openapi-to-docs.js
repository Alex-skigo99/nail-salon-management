const fs = require("fs");
const path = require("path");

const src = path.resolve(__dirname, "..", "apps", "api", "openapi.json");
const destDir = path.resolve(__dirname, "..", "docs-site");
const dest = path.join(destDir, "openapi.json");

if (!fs.existsSync(src)) {
  console.error("Source openapi.json not found. Run apps/api generator first: cd apps/api && npm run gen:openapi");
  process.exit(1);
}

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log(`Copied ${src} -> ${dest}`);
