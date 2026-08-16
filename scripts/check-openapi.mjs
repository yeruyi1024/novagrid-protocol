import path from "node:path";
import { fileURLToPath } from "node:url";
import { Validator } from "@seriousme/openapi-schema-validator";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const validator = new Validator({ allErrors: true });
const result = await validator.validate(path.join(root, "openapi/novagrid-v1.yaml"));
if (!result.valid) {
  throw new Error(`OpenAPI 3.1 结构校验失败\n${JSON.stringify(result.errors, null, 2)}`);
}
const document = validator.specification;

if (document.openapi !== "3.1.0") {
  throw new Error("OpenAPI 版本必须固定为 3.1.0");
}

const allowedPaths = new Set(["/v1/models", "/v1/chat/completions"]);
for (const [apiPath, pathItem] of Object.entries(document.paths)) {
  if (!allowedPaths.has(apiPath)) {
    throw new Error(`公开 OpenAPI 包含未批准路径：${apiPath}`);
  }
  for (const method of ["get", "post", "put", "patch", "delete"]) {
    const operation = pathItem[method];
    if (!operation) {
      continue;
    }
    for (const field of ["operationId", "summary", "description", "responses"]) {
      if (!operation[field]) {
        throw new Error(`${method.toUpperCase()} ${apiPath} 缺少 ${field}`);
      }
    }
  }
}

const requestSchema = document.components.schemas.ChatCompletionRequest;
if (requestSchema.additionalProperties !== false || requestSchema.properties.stream.const !== false) {
  throw new Error("ChatCompletionRequest 必须拒绝未知字段，并固定 stream=false");
}

console.log("OpenAPI 3.1 结构和项目约束检查通过");
