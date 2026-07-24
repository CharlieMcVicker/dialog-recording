---
id: TASK-9
title: Integrate audio capture tools inside Dialog Recording view
status: Done
assignee:
  - '@antigravity'
created_date: '2026-07-24 16:58'
updated_date: '2026-07-24 16:58'
labels: []
dependencies: []
ordinal: 9000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Rename 'Extracted Conversation Steps' view to 'Dialog recording' and integrate the Audio Capture & Alignment tools inside it.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Main view title is renamed to 'Dialog recording'
- [x] #2 Audio Capture & Alignment tool controls are rendered inside the Dialog recording card view
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Rename card title from 'Extracted Conversation Steps' to 'Dialog recording'.\n2. Embed AudioRecorder component directly within the 'Dialog recording' card view alongside the conversation steps preview.\n3. Remove standalone bottom AudioRecorder rendering in App.tsx.\n4. Build and test.
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Renamed Extracted Conversation Steps to 'Dialog recording'. Integrated AudioRecorder component directly into the bottom section of the Dialog recording card view with an embedded prop toggle. Verified with vitest and vite build.
<!-- SECTION:FINAL_SUMMARY:END -->
