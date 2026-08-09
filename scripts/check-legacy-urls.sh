#!/usr/bin/env bash
# Checks HTTP status codes for legacy URL patterns that must redirect or 410,
# never bare 404. Run after deploy to confirm the fix landed.
#
# Usage: scripts/check-legacy-urls.sh [base_url]
# Defaults to https://addify.ae; pass a different base to test staging/local.

set -euo pipefail

BASE_URL="${1:-https://addify.ae}"

# path|expected_status|note
CHECKS=(
  "/candidate/nada-alisia/|410|Legacy candidate profile, privacy takedown"
  "/candidate/some-other-person/|410|Legacy candidate profile, privacy takedown"
  "/wp-content/uploads/jobsearch-resumes/some-file.pdf|410|Legacy CV PDF, privacy takedown"
)

fail=0

printf "%-55s %-8s %-8s %s\n" "PATH" "WANT" "GOT" "NOTE"
for check in "${CHECKS[@]}"; do
  IFS='|' read -r path expected note <<< "$check"
  url="${BASE_URL}${path}"
  # Follow redirects — we want the FINAL status a crawler would see, since a
  # 301/308 into the 410 handler is the expected, correct path here.
  got=$(curl -s -o /dev/null -w "%{http_code}" -L "$url" || echo "ERR")

  status_ok="no"
  if [ "$got" = "$expected" ]; then
    status_ok="yes"
  fi

  printf "%-55s %-8s %-8s %s\n" "$path" "$expected" "$got" "$note"

  if [ "$status_ok" = "no" ]; then
    fail=1
  fi
done

if [ "$fail" -eq 1 ]; then
  echo ""
  echo "FAIL: one or more legacy URLs did not return the expected status."
  exit 1
fi

echo ""
echo "OK: all legacy URLs returned their expected status."
