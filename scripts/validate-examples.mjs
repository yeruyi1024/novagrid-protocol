import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import YAML from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

function createAjv() {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  ajv.addFormat("int64", { type: "number", validate: Number.isSafeInteger });
  return ajv;
}

function convertOpenApiRefs(value) {
  if (Array.isArray(value)) {
    return value.map(convertOpenApiRefs);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, convertOpenApiRefs(item)]));
  }
  if (typeof value === "string") {
    return value.replaceAll("#/components/schemas/", "#/$defs/");
  }
  return value;
}

function assertSemanticRules(file, data) {
  if (file.endsWith("chat-response.valid.json")) {
    const usage = data.usage;
    if (usage.total_tokens !== usage.prompt_tokens + usage.completion_tokens) {
      throw new Error(`${file}: total_tokens 必须等于输入与输出 Token 之和`);
    }
  }
  if (file.endsWith("usage-recorded.valid.json")) {
    if (data.total_tokens !== data.prompt_tokens + data.completion_tokens) {
      throw new Error(`${file}: total_tokens 必须等于输入与输出 Token 之和`);
    }
    if (data.successful_attempt > data.attempts) {
      throw new Error(`${file}: successful_attempt 不能大于 attempts`);
    }
  }
}

const manifest = await readJson("examples/manifest.json");
const openapi = YAML.parse(await readFile(path.join(root, "openapi/novagrid-v1.yaml"), "utf8"));
const openApiSchemas = convertOpenApiRefs(openapi.components.schemas);
const validators = new Map();
let passed = 0;

for (const entry of manifest.openapi) {
  if (!validators.has(entry.schema)) {
    const ajv = createAjv();
    const schema = { ...openApiSchemas[entry.schema], $defs: openApiSchemas };
    validators.set(entry.schema, ajv.compile(schema));
  }
  const data = await readJson(`examples/${entry.file}`);
  const validate = validators.get(entry.schema);
  const actual = validate(data);
  if (actual !== entry.valid) {
    throw new Error(`${entry.file}: 预期 valid=${entry.valid}，实际 valid=${actual}\n${JSON.stringify(validate.errors, null, 2)}`);
  }
  if (actual) {
    assertSemanticRules(entry.file, data);
  }
  passed += 1;
}

for (const entry of manifest.jsonschema) {
  const schema = await readJson(entry.schema);
  const ajv = createAjv();
  if (!ajv.validateSchema(schema)) {
    throw new Error(`${entry.schema}: Schema 自校验失败\n${JSON.stringify(ajv.errors, null, 2)}`);
  }
  const validate = ajv.compile(schema);
  const data = await readJson(`examples/${entry.file}`);
  const actual = validate(data);
  if (actual !== entry.valid) {
    throw new Error(`${entry.file}: 预期 valid=${entry.valid}，实际 valid=${actual}\n${JSON.stringify(validate.errors, null, 2)}`);
  }
  if (actual) {
    assertSemanticRules(entry.file, data);
  }
  passed += 1;
}

console.log(`样例验证通过：${passed} 个场景`);
