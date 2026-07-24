---
id: TASK-7
title: Chat alignment for dialog steps and collapsible CLI chunk-list payload
status: Done
assignee:
  - '@antigravity'
created_date: '2026-07-24 16:52'
updated_date: '2026-07-24 16:52'
labels: []
dependencies: []
ordinal: 7000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Align conversation step cards left vs right based on speaker side instead of using badge tags. Move the debug CLI --chunk-list payload into a collapsible details view above extracted steps.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Left/Right speaker steps are visually aligned left and right in chat bubble style
- [x] #2 CLI chunk list payload is collapsible/expandable and located above extracted steps
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Update App.tsx to place the CLI --chunk-list payload in a collapsible panel above the Extracted Conversation Steps.\n2. Update step item structure in App.tsx to remove explicit speaker badges and apply left/right layout alignment classes.\n3. Add CSS styling in index.css for chat-bubble style left (user, max-width ~80%, left-aligned) and right (npc/other, max-width ~80%, right-aligned/margin-left auto) step cards.\n4. Build and test.
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Updated App.tsx and index.css to format conversation steps as left/right chat bubbles aligned to opposing sides based on speaker. Moved CLI --chunk-list JSON debug payload into a collapsible details disclosure above extracted steps. Verified with vitest and vite build.
<!-- SECTION:FINAL_SUMMARY:END -->
