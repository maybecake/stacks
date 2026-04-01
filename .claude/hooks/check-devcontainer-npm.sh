#!/usr/bin/env bash
# Blocks npm usage in devcontainer.json and Dockerfile edits — use pnpm instead.
input=$(cat)

file=$(echo "$input" | jq -r '.tool_input.file_path // ""')
echo "$file" | grep -qE '(devcontainer\.json|Dockerfile)' || exit 0

content=$(echo "$input" | jq -r '.tool_input.new_string // .tool_input.content // ""')

# Allow npm install -g npm@latest (bootstrapping npm itself is legitimate)
stripped=$(echo "$content" | grep -vE 'npm install -g npm(@[a-z0-9.]+)?')
if echo "$stripped" | grep -qE '(^|[^p])npm'; then
  echo "Use pnpm instead of npm in devcontainer/Dockerfile configs (e.g. 'pnpm add -g' not 'npm install -g')." >&2
  exit 2
fi
