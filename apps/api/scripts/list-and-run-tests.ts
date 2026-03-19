import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";

async function findTestFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findTestFiles(full)));
    } else if (/\.test\.ts$|\.spec\.ts$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function extractTestNames(filePath: string): Promise<string[]> {
  const content = await fs.readFile(filePath, "utf8");
  const regex = /\b(?:it|test|describe)\s*\(\s*(['\"])([^'\"]+)\1/g;
  const names: string[] = [];
  let m;
  while ((m = regex.exec(content)) !== null) {
    names.push(m[2]);
  }
  return names;
}

async function main() {
  const srcDir = path.resolve(__dirname, "..", "src");
  let files: string[] = [];
  try {
    files = await findTestFiles(srcDir);
  } catch (e) {
    console.error("Failed to read test files:", e);
    process.exit(1);
  }

  const allTests: string[] = [];
  for (const f of files) {
    const rel = path.relative(process.cwd(), f);
    const names = await extractTestNames(f);
    if (names.length === 0) {
      allTests.push(`${rel} -- (no discovered test names)`);
    } else {
      for (const n of names) allTests.push(`${rel} :: ${n}`);
    }
  }

  console.log("\nDiscovered tests (count:", allTests.length + "):\n");
  for (const t of allTests) console.log(t);
  console.log("\n--- End test list ---\n");

  // Run the normal test runner afterwards
  const runner = spawn("npx", ["vitest", "run"], {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
    shell: true,
  });

  runner.on("exit", (code) => process.exit(code ?? 0));
}

main();
