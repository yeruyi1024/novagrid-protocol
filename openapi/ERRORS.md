# HTTP 错误语义

| HTTP | 稳定 `code` | 是否可重试 | 说明 |
|---:|---|:---:|---|
| 400 | `invalid_request` | 否 | JSON、字段类型或参数边界非法 |
| 401 | `invalid_api_key` | 否 | 渠道密钥缺失、无效或已撤销 |
| 403 | `model_not_allowed` | 否 | 渠道无品牌模型权限 |
| 403 | `data_policy_rejected` | 否 | 数据不满足第一版低敏策略 |
| 409 | `idempotency_conflict` | 否 | 同一幂等键对应不同规范化请求 |
| 413 | `request_too_large` | 否 | 请求体、消息或上下文超过限制 |
| 422 | `unsupported_field` | 否 | `stream=true`、tools、结构化输出或多模态等未支持行为 |
| 429 | `rate_limit_exceeded` | 是 | 应遵守服务端退避提示；重试不得放大节点 Attempt |
| 503 | `capacity_unavailable` | 是 | 当前没有符合模型和安全策略的 READY 节点 |
| 503 | `temporarily_unavailable` | 是 | 暂时基础设施故障 |
| 504 | `deadline_exceeded` | 否 | 120000 毫秒绝对总 deadline 到期 |

调用方必须使用 `code` 判断行为，不得依赖可变的 `message`。重试只表示重新发起上游请求的建议，不改变 NovaGrid 内部最多两个 Attempt 和单次成功用量语义。
