---
id: TASK-15
title: Fix audio encoding feedback noise and enforce server file extensions on upload
status: Done
assignee:
  - '@agent'
created_date: '2026-07-24 17:25'
updated_date: '2026-07-24 17:26'
labels: []
dependencies: []
ordinal: 15000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Fix microphone feedback noise during audio capture by disconnecting audio output routing, copy PCM input buffers cleanly, enforce .wav file extensions in server uploads, and restart backend server.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Audio recording captures clean PCM without speaker feedback loop noise
- [x] #2 Uploaded audio files in server uploads directory and align CLI arguments strictly retain .wav extension
- [x] #3 Backend dev script uses tsx watch for server auto-reloading
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. In AudioRecorder.tsx, route scriptNode through a zero-gain node (silence) to eliminate mic-to-speaker acoustic feedback loop noise during recording, and safely clone input PCM buffers.\n2. In server.ts, strictly rename uploaded file paths to append .wav (or original extension) if missing, ensuring uploads and align CLI parameters always have proper file extensions.\n3. Update package.json server scripts to use tsx watch server.ts.
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Fixed mic feedback noise in AudioRecorder.tsx by routing scriptNode through a zero-gain node, cloned PCM buffers cleanly, enforced .wav extensions strictly in server.ts disk paths and align CLI parameters, updated package.json server scripts to use tsx watch, and terminated stale server process PID 22900.
<!-- SECTION:FINAL_SUMMARY:END -->
