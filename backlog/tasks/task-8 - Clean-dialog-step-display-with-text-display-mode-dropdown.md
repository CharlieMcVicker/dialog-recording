---
id: TASK-8
title: Clean dialog step display with text display mode dropdown
status: Done
assignee:
  - '@antigravity'
created_date: '2026-07-24 16:55'
updated_date: '2026-07-24 16:56'
labels: []
dependencies: []
ordinal: 8000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Remove step numbers and user/npc label lines from dialog steps, showing only the spoken words and relying on alignment for speaker identity. Add a dropdown control to switch between displaying Syllabary, Phonetic, or Both, defaulting to Syllabary.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Step numbers and speaker label headers are removed from dialog cards
- [x] #2 Dropdown allows selecting display mode (Syllabary, Phonetics, Both) defaulting to Syllabary
- [x] #3 Dialog cards conditionally render text based on selected display mode
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add textDisplayMode state ('syllabary' | 'phonetic' | 'both') to App.tsx defaulting to 'syllabary'.\n2. Add a dropdown select element in the Extracted Conversation Steps card header to switch text display mode.\n3. Remove step number and speaker header lines from dialog step cards, leaving pure spoken text.\n4. Conditionally render syllabary and/or phonetic text based on textDisplayMode state.\n5. Verify build and tests pass.
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Removed step numbers and user/npc text labels from dialog step cards in App.tsx. Added a display mode select dropdown (Syllabary Only, Phonetics Only, Both) defaulting to Syllabary Only. Verified with vitest and vite build.
<!-- SECTION:FINAL_SUMMARY:END -->
