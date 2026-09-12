# Claude Code setup for this repo

**Status: APPLIED 2026-09-12.** `.claude/settings.json` exists and contains both the `SessionStart`
hook registration and the permission rules below. A new session receives the state-of-play block
before any input.

This file records *what* is configured and *why*, so it can be reviewed or changed deliberately
rather than being mysterious. **It is verification, not instruction** — nothing here needs applying.

One caveat worth knowing about editing it: **a malformed `settings.json` is worse than no file.**
Claude Code may ignore the hooks silently rather than erroring, which is precisely the failure this
setup exists to prevent. Validate after any edit:

```bash
python3 -c "import json; json.load(open('.claude/settings.json')); print('valid')"
```

An earlier attempt to create this file by pasting a long single-line command through the terminal
wrapper failed exactly this way — the line was wrapped and four literal newlines were inserted
*inside* a JSON string, producing `Invalid control character`. The command exited 0, so it looked
like success. Write the file with an editor, or verify it afterwards.

---

## 1. The `SessionStart` hook

`.claude/hooks/state-of-play.sh` already exists in this repo. It prints the current branch, the
active project, its next task, the gate command and the no-`.env.local` constraint — about ten
lines.

**Why a hook and not a document:** `SessionStart` is the only hook event where plain stdout enters
context. It is therefore the only way to inject *dynamic* text at turn one. A document can only
state what was true when it was written; the hook reads the branch and `state.md` live.

**Applied.** This is the `hooks` block currently in `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/state-of-play.sh",
            "timeout": 10
          }
        ]
      },
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/state-of-play.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

**The `compact` matcher is not optional.** Context added by hooks earlier in a session is
summarized away on compaction, and `compact` is the documented re-injection point. A hook
registered only for `startup` goes silent partway through any long session — which is exactly when
it is needed. (Also: `mcp_tool` hooks do not run on `SessionStart` at launch; use `type: "command"`.)

**The active project** is read from `.claude/active-project`, a one-line file. Change it when you
switch projects:

```bash
echo landing-redesign > .claude/active-project   # or: dashboard
```

---

## 2. Permissions (optional, for fewer interruptions)

These pre-approve the read-only commands this repo's workflow runs constantly. They are a
convenience, not a safety measure — every one is non-destructive.

```json
{
  "permissions": {
    "allow": [
      "Bash(npx tsc --noEmit:*)",
      "Bash(npm run lint:*)",
      "Bash(npm run test:*)",
      "Bash(npm run build:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git rev-parse:*)"
    ],
    "deny": [
      "Read(./.next/**)",
      "Read(./src/generated/**)",
      "Read(./node_modules/**)"
    ]
  }
}
```

**The deny rules earn their place.** `src/generated/prisma` is ~30 generated files and `.next` is
build output; both are noise that can flood context if a broad search wanders into them. Denying
them keeps searches focused on real source.

**One caveat worth knowing:** a *bare* tool-name deny rule (e.g. `"Bash"`) invalidates the prompt
cache prefix. Scoped rules like the above do not. Prefer scoped.

---

## 3. Verify it works

- `/context` lists what actually loaded, including memory files. This is the honest check that the
  design is working rather than an assumption that it is.
- `/memory` opens the auto-memory files for inspection and editing.
- `/doctor` proposes trims for an oversized `CLAUDE.md` (needs v2.1.206+).

The documented budgets, which `docs/KNOWLEDGE-BASE.md` is built around: `CLAUDE.md` under 200 lines
(the docs' own words — *"if your CLAUDE.md is too long, Claude ignores half of it because important
rules get lost in the noise"*), `SKILL.md` under 500 lines, and `MEMORY.md`'s first 200 lines or
25 KB loaded every session.
