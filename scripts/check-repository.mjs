import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const included = ["openapi", "protobuf", "jsonschema", "examples", "compatibility", "generated", "scripts"];
const textExtensions = new Set([".md", ".json", ".yaml", ".yml", ".proto", ".mjs"]);
const forbiddenPublicFields = /(^|["'\s])(?:customer_id|balance|price|risk_score|fraud_score|anti_cheat)(["'\s:]|$)/i;
const credentialPatterns = [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /\bsk-[A-Za-z0-9_-]{20,}\b/, /\bAIza[A-Za-z0-9_-]{30,}\b/];
const unnumberedMarker = /\b(?:TODO|FIXME|HACK)\b(?!\([A-Z0-9-]+\))/;

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collect(absolute));
    } else if (textExtensions.has(path.extname(entry.name))) {
      files.push(absolute);
    }
  }
  return files;
}

const failures = [];
for (const directory of included) {
  for (const file of await collect(path.join(root, directory))) {
    const content = await readFile(file, "utf8");
    const relative = path.relative(root, file);
    if (relative === "scripts/check-repository.mjs") {
      continue;
    }
    if (unnumberedMarker.test(content)) {
      failures.push(`${relative}: 存在无编号 TODO/FIXME/HACK`);
    }
    if (credentialPatterns.some((pattern) => pattern.test(content))) {
      failures.push(`${relative}: 疑似包含真实凭据或私钥`);
    }
    if (["openapi", "protobuf", "jsonschema"].includes(relative.split(path.sep)[0]) && forbiddenPublicFields.test(content)) {
      failures.push(`${relative}: 公开契约包含内部商业或风控字段`);
    }
  }
}

if (failures.length > 0) {
  throw new Error(failures.join("\n"));
}

console.log("仓库边界检查通过：无敏感凭据、内部商业字段或无编号标记");
