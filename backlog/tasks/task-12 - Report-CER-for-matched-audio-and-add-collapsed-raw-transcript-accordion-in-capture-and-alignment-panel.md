---
id: TASK-12
title: >-
  Report CER for matched audio and add collapsed raw transcript accordion in
  capture and alignment panel
status: Done
assignee:
  - '@antigravity'
created_date: '2026-07-24 17:05'
updated_date: '2026-07-24 17:07'
labels: []
dependencies: []
ordinal: 12000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update the Audio Capture & Alignment panel to display Character Error Rate (CER) for matched audio against the target dialog text, and include a collapsed-by-default accordion to review the raw transcript.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Display CER for matched audio in the capture and alignment panel
- [x] #2 Provide a collapsed-by-default raw transcript accordion in the capture and alignment panel
- [x] #3 Build and test suite pass clean
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Compute CER for matched audio from alignment result metrics (matched_verse_cer, overall_cer, or line CER averages) in AudioRecorder.\n2. Render CER metric indicator badge in the Audio Capture & Alignment panel upon alignment completion.\n3. Add a collapsed-by-default accordion UI section for reviewing raw transcript text.\n4. Write/update unit tests to verify CER reporting and accordion behavior.\n5. Execute npm test and npm run build to confirm all checks pass clean.
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Updated Audio Capture & Alignment panel (AudioRecorder.tsx) to calculate and render CER metric badge for matched audio, and added a collapsed-by-default accordion section to review raw transcript text. Verified with 18 passing vitest tests and clean Vite production build.
<!-- SECTION:FINAL_SUMMARY:END -->
