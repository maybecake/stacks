#!/bin/bash

set -ex 
pnpm add -g @anthropic-ai/claude-code @fission-ai/openspec@latest vercel

go install -v github.com/bazelbuild/buildtools/buildifier@latest
go install -v github.com/fullstorydev/grpcurl/cmd/grpcurl@latest

echo "3. Building and installing Bazel Gazelle..."
TEMP_GAZELLE=$(mktemp -d)
git clone https://github.com/bazelbuild/bazel-gazelle.git "$TEMP_GAZELLE"
cd "$TEMP_GAZELLE"
go install -v ./cmd/gazelle
rm -rf "$TEMP_GAZELLE"

cd /workspaces/stacks
pnpm install