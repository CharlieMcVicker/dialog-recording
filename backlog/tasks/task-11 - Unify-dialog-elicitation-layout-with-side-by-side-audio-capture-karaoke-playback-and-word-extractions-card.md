---
id: TASK-11
title: >-
  Unify dialog elicitation layout with side-by-side audio capture, karaoke
  playback, and word extractions card
status: Done
assignee:
  - '@antigravity'
created_date: '2026-07-24 17:00'
updated_date: '2026-07-24 17:01'
labels: []
dependencies: []
ordinal: 11000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Layout spoken dialog lines on the left side of the Dialog recording card with audio capture on the right side. When audio/alignment is ready, reuse the dialog lines display for synchronized karaoke playback (highlighting active lines/words). Move word-for-word extractions (Vocab Audit) into a dedicated card below.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Spoken dialog lines and audio capture tools are displayed side-by-side
- [x] #2 Spoken dialog lines function as interactive karaoke playback lines when audio alignment is available
- [x] #3 Word-for-word extractions view is displayed as a dedicated card below the Dialog recording view
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Refactor AudioRecorder.tsx to manage alignment state and playback time, passing audioURL, alignmentResult, currentTime, line playback handler, and active line/word indicators up to parent or rendering karaoke overlay on the dialog lines.\n2. In App.tsx / AudioRecorder.tsx, layout the spoken dialog lines on the left side of 'Dialog recording' card and audio capture/alignment controls on the right side.\n3. Integrate karaoke word/line highlighting into the left-side dialog cards when alignment audio is played.\n4. Render the Word-for-Word Extractions (Vocab Audit) as a new card below the Dialog recording view.\n5. Verify build and run tests.
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Re-used the left-side dialog steps display inside 'Dialog recording' as the interactive karaoke playback view whenever alignment audio is complete. Placed audio capture & alignment tools in the right column of the grid layout. Rendered word-for-word extractions (Vocab Audit) as a dedicated card below the Dialog recording view. Verified with vitest and vite build.
<!-- SECTION:FINAL_SUMMARY:END -->
