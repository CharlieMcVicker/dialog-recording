---
id: TASK-10
title: Side-by-side layout for dialog lines and audio capture tools
status: In Progress
assignee:
  - '@antigravity'
created_date: '2026-07-24 16:59'
updated_date: '2026-07-24 16:59'
labels: []
dependencies: []
ordinal: 10000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Layout the spoken dialog lines on the left side of the Dialog recording view and place the audio capture & alignment tools to the right side of the dialog lines, utilizing available container space.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Dialog lines and Audio Capture controls are laid out side-by-side in a 2-column grid or flex layout
- [ ] #2 Layout collapses cleanly on mobile or narrower viewports
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Update App.tsx layout inside the 'Dialog recording' card to use a 2-column grid/flex container (dialog-grid).\n2. Left column contains spoken dialogue steps (taking up ~50% width).\n3. Right column contains the embedded AudioRecorder capture and alignment controls.\n4. Add CSS in index.css for responsive grid behavior on small screens.\n5. Verify build and test.
<!-- SECTION:PLAN:END -->
