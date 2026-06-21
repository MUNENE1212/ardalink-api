# 05 — Observability

[← Security](04-SECURITY.md) · [Next: Costs →](06-COSTS.md)

## Logging

Structured JSON via `pino`. Correlation ID via `X-Request-ID` header.

## Metrics

OpenTelemetry SDK → OTLP → backend.

Key gauges:

- `ardalink_api.http.requests.total{route,status}`
- `ardalink_api.http.request.duration_seconds{route}`
- `ardalink_api.voice.calls.active`
- `ardalink_api.openai.tokens.total{model,operation}`

## Tracing

Spans for every Express route + every Azure OpenAI call. W3C traceparent
header propagated from `ardalink-engine` and clients.
