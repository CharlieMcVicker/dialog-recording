---
id: TASK-6
title: Display left/right speaker indicator in dialog preview
status: Done
assignee:
  - '@antigravity'
created_date: '2026-07-24 16:50'
updated_date: '2026-07-24 16:51'
labels: []
dependencies: []
ordinal: 6000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update the dialog preview (extracted conversation steps) to explicitly show if the left or right speaker is talking, making elicitation easier.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Dialog preview items display left/right speaker indicator clearly
- [x] #2 Preview reflects updated speaker channel/side metadata accurately
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Update ChunkItem interface in LessonIngestion.ts to include speaker ('npc' | 'user' | string) and channel/side ('left' | 'right'). Map user -> left, npc/other -> right.\n2. Update extractChunkList in LessonIngestion.ts to extract step.speaker and compute side ('left' for user, 'right' for npc/other).\n3. Update App.tsx Extracted Conversation Steps preview list to display speaker indicators (Left / Right badges or tags with speaker role).\n4. Update unit tests in LessonIngestion.test.ts.\n5. Run tests and verify.
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Updated extractChunkList in LessonIngestion.ts to extract speaker info ('user' vs 'npc'/'other') and assign audio channels/sides ('left' for user, 'right' for npc). Updated App.tsx Extracted Conversation Steps UI to prominently display styled LEFT/RIGHT speaker badges for each step. Updated unit tests and confirmed build succeeds clean.
<!-- SECTION:FINAL_SUMMARY:END -->
