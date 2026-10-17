#!/usr/bin/env bash
#
# End-to-end smoke test for ThinkStack.
#
# Brings up the full docker-compose stack (postgres + backend + frontend), waits for the
# backend to become healthy, then exercises the core decision flow over HTTP:
#   register -> login -> categories -> start session -> submit answers ->
#   run recommendations -> fetch summary -> price history.
#
# Usage:   ./scripts/smoke-test.sh
# Requires: docker (with compose), curl, jq
set -euo pipefail

API="http://localhost:8080/api/v1"
COMPOSE="docker compose"
WORKDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STACK_UP=0

say() { printf '\n\033[1;36m== %s\033[0m\n' "$*"; }
fail() { printf '\033[1;31mSMOKE TEST FAILED:\033[0m %s\n' "$*" >&2; exit 1; }
pass() { printf '\033[1;32mok\033[0m %s\n' "$*"; }

cleanup() {
  if [[ $STACK_UP -eq 1 ]]; then
    say "Tearing down stack"
    $COMPOSE -f "$WORKDIR/docker-compose.yml" down -v --remove-orphans || true
  fi
}
trap cleanup EXIT

wait_for_api() {
  say "Waiting for backend to become ready"
  for i in $(seq 1 60); do
    if curl -fs "$API/categories" >/dev/null 2>&1; then
      pass "backend is ready"
      return 0
    fi
    sleep 2
  done
  fail "backend did not become ready in time"
}

json_field() { # json_field <json> <dotted.path>
  echo "$1" | jq -er "$2"
}

main() {
  cd "$WORKDIR"
  say "Starting stack"
  $COMPOSE -f docker-compose.yml up -d --build
  STACK_UP=1
  wait_for_api

  EMAIL="smoke-$(date +%s)@example.com"
  PASSWORD="SmokeTest!123"
  USERNAME="smoke-$(date +%s)"

  say "Register user"
  REG=$(curl -fs -X POST "$API/auth/register" \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"$USERNAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"displayName\":\"Smoke Tester\"}")
  json_field "$REG" '.success == true' >/dev/null || fail "register did not succeed: $REG"
  pass "registered $USERNAME"

  say "Login"
  LOGIN=$(curl -fs -X POST "$API/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"usernameOrEmail\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
  TOKEN=$(json_field "$LOGIN" '.data.accessToken')
  [[ -n "$TOKEN" ]] || fail "no access token returned: $LOGIN"
  pass "obtained token"
  AUTH=(-H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json')

  say "List categories"
  CATS=$(curl -fs "${AUTH[@]}" "$API/categories")
  SLUG=$(json_field "$CATS" '.data[0].slug')
  [[ -n "$SLUG" ]] || fail "no category returned"
  pass "picked category $SLUG"

  say "Start decision session"
  SESSION=$(curl -fs -X POST "${AUTH[@]}" "$API/decisions" \
    -d "{\"categorySlug\":\"$SLUG\",\"title\":\"Smoke Test Laptop\"}")
  SID=$(json_field "$SESSION" '.data.id')
  [[ -n "$SID" ]] || fail "no session id: $SESSION"
  pass "session $SID"

  say "Submit wizard answers"
  ANSWERS=$(curl -fs -X POST "${AUTH[@]}" "$API/decisions/$SID/answers" \
    -d '[
      {"questionKey":"budget_max","answerValue":"120000"},
      {"questionKey":"performance","answerValue":"4"},
      {"questionKey":"battery","answerValue":"3"},
      {"questionKey":"portability","answerValue":"4"},
      {"questionKey":"display","answerValue":"3"},
      {"questionKey":"gaming","answerValue":"1"},
      {"questionKey":"purpose","answerValue":"programming"},
      {"questionKey":"ram_min","answerValue":"16"},
      {"questionKey":"storage_min","answerValue":"512"}
    ]')
  json_field "$ANSWERS" '.success == true' >/dev/null || fail "answers rejected: $ANSWERS"
  pass "answers stored"

  say "Run recommendations"
  RECS=$(curl -fs -X POST "${AUTH[@]}" "$API/decisions/$SID/recommendations")
  COUNT=$(json_field "$RECS" '.data | length')
  [[ "$COUNT" -gt 0 ]] || fail "no recommendations returned"
  pass "$COUNT recommendations generated"

  say "Fetch decision summary"
  SUMMARY=$(curl -fs "${AUTH[@]}" "$API/decisions/$SID/summary")
  json_field "$SUMMARY" '.success == true' >/dev/null || fail "summary failed: $SUMMARY"
  pass "summary returned"

  say "Price history (first category product)"
  PRODUCT=$(json_field "$(curl -fs "${AUTH[@]}" "$API/products?category=$SLUG")" '.data.content[0].slug // .data[0].slug')
  if [[ -n "${PRODUCT:-}" ]]; then
    curl -fs "${AUTH[@]}" "$API/products/$PRODUCT/price-history" >/dev/null
    pass "price history reachable for $PRODUCT"
  else
    say "no products in category; skipping price history"
  fi

  say "SMOKE TEST PASSED"
}

main "$@"
