# AI Telemetry Dashboards, Alerts, and Runbook

This runbook covers telemetry for public agent execution using `ai_telemetry_events`.

## Event schema

Key standardized fields emitted by `public_agent_response` events:

- `model`
- `mode`
- `tokens_used`
- `fallback_reason`
- `latency_ms`
- `latency_bucket`
- `success`
- `lead_detected`
- `credit_cost`
- `session_id`

## Dashboard queries

### 1) Fallback rate

```sql
SELECT
  date_trunc('hour', created_at) AS ts,
  COUNT(*) AS total_events,
  COUNT(*) FILTER (WHERE fallback_reason IS NOT NULL) AS fallback_events,
  ROUND(
    COUNT(*) FILTER (WHERE fallback_reason IS NOT NULL)::numeric / NULLIF(COUNT(*), 0),
    4
  ) AS fallback_rate
FROM ai_telemetry_events
WHERE event_type = 'public_agent_response'
  AND created_at >= now() - interval '7 days'
GROUP BY 1
ORDER BY 1;
```

### 2) Lead detection rate by strategy mode

```sql
SELECT
  mode,
  COUNT(*) AS total_sessions,
  COUNT(*) FILTER (WHERE lead_detected = true) AS leads_detected,
  ROUND(
    COUNT(*) FILTER (WHERE lead_detected = true)::numeric / NULLIF(COUNT(*), 0),
    4
  ) AS lead_detection_rate
FROM ai_telemetry_events
WHERE event_type = 'public_agent_response'
  AND created_at >= now() - interval '30 days'
GROUP BY mode
ORDER BY lead_detection_rate DESC;
```

### 3) Chat drop-off after first response

```sql
WITH session_stats AS (
  SELECT
    session_id,
    COUNT(*) FILTER (WHERE event_type = 'public_agent_response') AS responses
  FROM ai_telemetry_events
  WHERE created_at >= now() - interval '30 days'
    AND session_id IS NOT NULL
  GROUP BY session_id
)
SELECT
  COUNT(*) AS sessions,
  COUNT(*) FILTER (WHERE responses = 1) AS dropped_after_first_response,
  ROUND(
    COUNT(*) FILTER (WHERE responses = 1)::numeric / NULLIF(COUNT(*), 0),
    4
  ) AS dropoff_rate
FROM session_stats;
```

### 4) Credit spend per successful session

```sql
WITH session_cost AS (
  SELECT
    session_id,
    SUM(credit_cost) AS credits_spent,
    BOOL_AND(success) AS all_success
  FROM ai_telemetry_events
  WHERE event_type = 'public_agent_response'
    AND created_at >= now() - interval '30 days'
    AND session_id IS NOT NULL
  GROUP BY session_id
)
SELECT
  ROUND(AVG(credits_spent)::numeric, 3) AS avg_credits_per_successful_session,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY credits_spent) AS p95_credits_per_successful_session
FROM session_cost
WHERE all_success = true;
```

## Alert thresholds

These are starter thresholds and should be tuned with baseline traffic:

1. **Failure spike alert**
   - Condition: `failure_rate >= 0.25` in a rolling 15 minute window
   - Guard: at least 20 events in the window

2. **Model misconfiguration alert**
   - Condition: fallback reason in `('AgentModelMisconfigured', 'AgentTemperatureMisconfigured', 'UnsupportedModel')`
     exceeds `10%` in rolling 30 minutes
   - Guard: at least 10 events

## Triage runbook

### Failure class: fallback spike

1. Check dashboard split by `fallback_reason`.
2. If dominated by transient API errors, inspect provider status + network errors.
3. If dominated by parser failures, inspect prompt changes and recent deploy diff.
4. Roll back recent prompt/model setting changes if the spike started immediately after release.

### Failure class: model misconfiguration

1. Query recent events grouped by `model`, `mode`, and `fallback_reason`.
2. Validate model value against allowed model list.
3. Validate temperature bounds (`0.2` to `0.8`).
4. Patch invalid agent records and re-run health checks.

### Failure class: high latency bucket (`gte_7s`)

1. Compare latency by model.
2. Check provider response times.
3. Check prompt/context size growth and token usage.
4. If needed, reduce context size or max output tokens.

### Failure class: drop-off after first response

1. Segment by `mode` and `fallback_reason`.
2. Confirm first assistant replies are not fallback-heavy.
3. Validate lead capture CTA quality in first response prompt.
4. Run A/B on first-turn response style for affected modes.
