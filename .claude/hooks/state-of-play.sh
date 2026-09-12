#!/usr/bin/env bash
# SessionStart hook — prints a compact state of play.
#
# This is the ONLY documented way to inject dynamic text at turn one: for
# SessionStart (and UserPromptSubmit/UserPromptExpansion/PostModelSwitch) plain
# stdout enters context. Registered for both `startup` and `compact`, because
# hook-added context is summarized away on compaction — the compact matcher is
# what re-injects it.
#
# Budget: ~10 lines. If this grows, it has become a document and belongs in
# docs/. It must never fail loudly: a noisy hook is worse than no hook.

set -uo pipefail

root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cd "$root" 2>/dev/null || exit 0

branch="$(git branch --show-current 2>/dev/null || true)"
[ -z "$branch" ] && branch="(detached)"

echo "Educraft — branch ${branch}"
[ "$branch" = "main" ] && echo "  NOTE: on main. Branch before implementing."

# Active project marker. Written by hand when switching projects; the file is
# the one piece of mutable routing state in this setup.
marker=".claude/active-project"
if [ -f "$marker" ]; then
  project="$(tr -d '[:space:]' < "$marker")"
  state="docs/projects/${project}/state.md"
  if [ -f "$state" ]; then
    echo "Active project: ${project}"
    # Pull the "Immediate next action" section. Match on the semantic phrase,
    # not the section number, so reordering the four headings does not silently
    # blank this line — the contract is the phrase (see docs/KNOWLEDGE-BASE.md).
    awk '
      tolower($0) ~ /^#+[^a-z]*immediate next action/ { grab = 1; next }
      grab && /^#/ { exit }
      grab && NF { print "  " $0; n++ }
      n >= 3 { exit }
    ' "$state" 2>/dev/null || true
    echo "  Detail: ${state}"
  else
    echo "Active project marker points at '${project}' but ${state} is missing."
  fi
fi

echo "Gate: npx tsc --noEmit && npm run lint && npm run test && npm run build"
echo "No .env.local — the app cannot run locally; visual QA is the owner's."
echo "Map: docs/INDEX.md   Rules/architecture: docs/KNOWLEDGE-BASE.md"

exit 0
