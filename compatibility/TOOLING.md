# 协议工具链

| 工具 | 锁定版本 | 许可证 | 必要性 | 替代方案 |
|---|---:|---|---|---|
| OpenAPI Schema Validator | 2.9.1 | MIT | 校验 OpenAPI 3.1 文档及内部引用 | Spectral、Redocly 或其他 OpenAPI 3.1 validator |
| Buf CLI | 1.72.0 | Apache-2.0 | Protobuf lint、构建和破坏性检查 | 固定版本 `protoc` 加自有规则 |
| Ajv | 8.20.0 | MIT | 严格编译并验证 JSON Schema 2020-12 | 其他通过 Draft 2020-12 测试的 validator |
| Ajv Formats | 3.0.1 | MIT | 校验 RFC3339、URI、UUID 等格式 | 项目自有格式校验，不推荐 |
| YAML | 2.9.0 | ISC | 读取 OpenAPI YAML 并验证外部样例 | 将 OpenAPI 改为 JSON 或其他 YAML parser |

依赖均为开发依赖，不进入 Control、Node 或 Runtime。OpenAPI 的项目约束由 `scripts/check-openapi.mjs` 补充检查，避免引入带已知高危传递依赖的旧版 CLI。`package-lock.json` 是可再现安装的权威锁文件；升级必须通过全部协议测试、安全审计和许可证复核。
