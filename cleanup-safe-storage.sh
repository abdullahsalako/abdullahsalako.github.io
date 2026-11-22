#!/usr/bin/env bash
set -euo pipefail

# Review this list before running. The scan found no safe-to-remove worktrees.
safe_worktrees=()

for worktree_path in "${safe_worktrees[@]}"; do
  git worktree remove -- "$worktree_path"
done

# Regenerable Codex cache.
codex_cache_path="/Users/remi/.codex/cache"
if [ -d "$codex_cache_path" ]; then
  rm -rf -- "$codex_cache_path"
fi

# Regenerable project dependencies; restore with `npm ci --prefix tools`.
project_dependencies_path="/Users/remi/Documents/Codex/2026-10-26/d/work/portfolio/tools/node_modules"
if [ -d "$project_dependencies_path" ]; then
  rm -rf -- "$project_dependencies_path"
fi
