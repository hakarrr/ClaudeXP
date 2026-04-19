# Contributing to ClaudeXP

Thanks for the interest. ClaudeXP is small on purpose — three runtime dependencies, a single `cli.js`, a Stop hook that runs in under a second. Keeping it that way is the goal.

## Setting up a dev copy

```bash
git clone https://github.com/EvanPaules/ClaudeXP
cd ClaudeXP
npm install
npm link          # puts `claudexp` on your PATH
claudexp setup    # first-run flow
```

`npm link` points the global `claudexp` at your working copy, so edits to `cli.js` / `hook.js` take effect on the next session without reinstalling.

### Testing the hook without closing Claude Code

The hook reads a Stop-event JSON payload from stdin. You can replay any past session:

```bash
# List recent transcripts
ls ~/.claude/projects/*/

# Pipe a fake Stop payload into the hook
echo '{"session_id":"dev","transcript_path":"/path/to/transcript.jsonl"}' | node hook.js
```

The framed overlay prints to **stderr**. If it doesn't appear, run with `CLAUDEXP_DEBUG=1` for verbose logs.

## What we're looking for

The **Contributing** section of the README lists the priorities. In short:

- **More achievements** — the more ridiculous the trigger, the better. Add to `achievements.js` and make sure the check is cheap (the hook budget is ~1s total).
- **Better keyword detection** — the transcript parser in `hook.js` is deliberately simple. Smarter bug/feature/refactor detection without blowing up the runtime is welcome.
- **Cross-platform bug reports** — especially Windows quirks around paths, SQLite, and ANSI overlay rendering.
- **Plugin form** — if/when Claude Code ships a proper plugin surface, replacing the raw Stop-hook install path is a priority.

## What to avoid

- **New runtime dependencies.** Three is the budget. If you need a utility, inline it.
- **Scope creep.** A PR should do one thing. Don't bundle a refactor with a feature.
- **Backend changes without discussion.** The shared Supabase instance is public — schema/RLS changes need an issue first so we don't break existing installs.
- **Hook latency regressions.** The overlay has to render before the user closes the terminal. If your change adds non-trivial I/O, defer it behind the overlay print or drop it.

## Pull request flow

1. **Open an issue first** for anything non-trivial. Saves both sides a wasted PR.
2. Branch off `main`. Keep commits tidy — we don't squash automatically.
3. Test on at least one platform you have. Call out untested platforms in the PR body.
4. Update the README if user-facing behavior changes.
5. PR title: `[area] short verb phrase` — e.g. `[engine] cap tool-use XP at 100`.

## Reporting bugs

Use the issue templates. The most useful bug reports include:

- OS + Node version (`node --version`)
- `claudexp cloud status` output (redact the token)
- A snippet of `~/.claudexp/data.db` row if the XP number is wrong — `sqlite3 ~/.claudexp/data.db "select * from sessions order by id desc limit 3"`

## Security

If you find something that lets a user write to another player's leaderboard row, or read another player's owner token — **email evanmpaules@gmail.com**, don't open a public issue. Everything else can go in the tracker.

## License

By contributing, you agree your code ships under the MIT license.
