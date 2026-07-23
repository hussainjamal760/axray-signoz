#!/bin/bash
SIGNOZ_URL="${SIGNOZ_URL:-http://localhost:8080}"

if [ -z "$SIGNOZ_API_KEY" ]; then
  echo "Set SIGNOZ_API_KEY env var first."
  exit 1
fi

jq -c '.[]' "$(dirname "$0")/axray-alert-rules.json" | while read -r rule; do
  clean_rule=$(echo "$rule" | jq 'del(.id, .createdAt, .updatedAt, .createBy, .updateBy, .state)')
  name=$(echo "$clean_rule" | jq -r '.alert // "unnamed"')
  echo "Creating alert: $name"
  curl -s -X POST "$SIGNOZ_URL/api/v1/rules" \
    -H "Content-Type: application/json" \
    -H "SIGNOZ-API-KEY: $SIGNOZ_API_KEY" \
    -d "$clean_rule"
  echo ""
done
