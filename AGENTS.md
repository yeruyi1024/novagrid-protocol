# AGENTS.md

- Treat API, event, error, and state semantics as compatibility contracts.
- Every external field needs type, unit, sensitivity, and compatibility behavior.
- Writes and events require stable idempotency semantics.
- Unknown optional fields should remain forward-compatible.
- Breaking changes require a major version and coordinated migration plan.
- Do not publish internal management, security, or anti-abuse fields.
