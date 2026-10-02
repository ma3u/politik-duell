#!/bin/bash
# Nur in Claude-Code-Sitzungen in der Cloud: Abhängigkeiten installieren und die
# Programme in den Zwischenspeicher .cache/ laden (nicht versioniert), damit
# programme:suche, programm:text und zitate:pruefen sofort ohne Download laufen.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
npm install --no-audit --no-fund

# Phase A (Ursachen festlegen, npm run phase-a -- start): keine Programme laden.
if [ -f .cache/phase-a ]; then
  echo "Phase A aktiv – Programme werden nicht geladen (Ende: npm run phase-a -- ende)."
  exit 0
fi

# Ein gesperrter Parteiserver soll den Start der Sitzung nicht verhindern.
npm run -s programme:laden || echo "Programme konnten nicht vollständig geladen werden – npm run programme:laden erneut versuchen."
