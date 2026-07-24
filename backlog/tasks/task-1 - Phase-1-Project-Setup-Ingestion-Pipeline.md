---
id: TASK-1
title: 'Phase 1: Project Setup & Ingestion Pipeline'
status: Done
assignee:
  - '@subagent'
created_date: '2026-07-24 15:29'
updated_date: '2026-07-24 15:31'
labels: []
dependencies: []
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Initialize Vite + React TypeScript app structure with CSS theme system, build LessonIngestionModule to parse Sgwehyohvga lesson JSONs and extract conversation modules, and construct helpers for converting ConversationStep items into --chunk-list JSON format.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Initialize React + Vite + TypeScript project structure with package.json scripts
- [x] #2 Build LessonIngestionModule to parse LessonRecord / InnerLessonJson files
- [x] #3 Extract conversation steps into --chunk-list JSON structure
- [x] #4 Add unit tests / verification scripts for lesson parsing and chunk list generation
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Initialized Vite + React TS structure, created LessonIngestion module and extractChunkList function, and added test cases. All tests passing.
<!-- SECTION:FINAL_SUMMARY:END -->
