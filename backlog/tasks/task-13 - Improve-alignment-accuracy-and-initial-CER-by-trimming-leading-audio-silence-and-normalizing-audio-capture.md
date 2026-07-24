---
id: TASK-13
title: >-
  Improve alignment accuracy and initial CER by trimming leading audio silence
  and normalizing audio capture
status: Done
assignee:
  - '@antigravity'
created_date: '2026-07-24 17:10'
updated_date: '2026-07-24 17:11'
labels: []
dependencies: []
ordinal: 13000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Investigate and resolve high CER on the initial half of audio recordings by trimming leading silence/noise buffer prior to speech onset and normalizing PCM audio levels before passing to alignment.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Trim leading quiet PCM frames (silence/noise threshold) before encoding recorded audio
- [x] #2 Normalize audio amplitude levels before sending to align-cherokee
- [x] #3 Verify test suite and build pass clean
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Implement trimSilence helper function to detect initial speech onset and trim leading silence with safety pre-padding.\n2. Implement normalizeAudio helper function to scale low-volume microphone recordings to optimal peak amplitude.\n3. Integrate silence trimming and normalization into stopRecording WAV encoding pipeline in AudioRecorder.tsx.\n4. Add comprehensive unit tests in AudioRecorder.test.ts for trimSilence and normalizeAudio.\n5. Run test suite and build verification to ensure all checks pass clean.
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added trimSilence (with 100ms pre-speech onset padding) and normalizeAudio (scaling to 90% peak amplitude) functions to AudioRecorder.tsx to eliminate leading silence and audio level discrepancies causing high initial CER. Verified with 22 passing vitest tests and clean production build.
<!-- SECTION:FINAL_SUMMARY:END -->
