# NovaGrid Protocol

NovaGrid v1 的公开、版本化协议源仓库。这里保存 OpenAI 兼容 OpenAPI、NodeChannel Protobuf、模型/更新/事件 JSON Schema、样例和兼容性规则，不保存 Control、Node 或部署实现。

## 当前范围

- `GET /v1/models`；
- 非流式 `POST /v1/chat/completions`；
- NodeChannel v1 注册、心跳、Offer、Lease、续租、完成和错误消息；
- 模型、更新、节点状态和用量事件 Schema；
- 合法、非法、边界和未知可选字段样例。

流式、tools、多模态、embedding、多模型、内部管理接口和反作弊字段不属于 v1 首版范围。

## 本地验证

要求 Node.js 20.17 或更高版本和 npm 10。首次运行：

```bash
npm ci
npm test
```

`npm test` 依次执行：

- OpenAPI 3.1 lint；
- Protobuf lint 和构建；
- JSON Schema 编译；
- 合法、非法、边界和兼容样例验证；
- 两次 Protobuf 描述符生成的可再现性比较；
- 公开仓库敏感字段和无编号标记检查。

## 目录

```text
openapi/          OpenAI 兼容 HTTP 契约
protobuf/         NodeChannel v1 契约
jsonschema/       模型、更新和事件契约
examples/         机器验证样例及预期结果清单
compatibility/    版本和兼容性政策
generated/        消费者生成代码策略
scripts/          本地与 CI 校验入口
```

## 版本和发布

- 未发布阶段使用 `0.x`；首个冻结兼容版本发布 `v1.0.0`；
- 新增可选字段和枚举值属于向前兼容变更，但消费者必须实现未知值降级；
- 删除字段、改变含义、单位、必选性或状态语义必须升级 major；
- 协议先评审并 Tag，Control 和 Node 只依赖固定 Tag；
- 自动生成代码不手工修改，生成器、输入 Tag 和命令必须可追溯。

详细规则见 `compatibility/POLICY.md` 和 `generated/README.md`。

## 工具依赖

所有依赖只用于开发校验并由 `package-lock.json` 锁定：OpenAPI Schema Validator（MIT）、Buf（Apache-2.0）、Ajv/Ajv Formats（MIT）、YAML（ISC）。选择原因和替代方案见 `compatibility/TOOLING.md`。

License：协议和项目自有脚本当前保留全部权利；工具依赖遵循各自许可证。本任务不复制第三方源码或许可证文本。
