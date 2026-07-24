---
id: TASK-14
title: Preserve and enforce proper audio file extensions during upload process
status: Done
assignee:
  - '@agent'
created_date: '2026-07-24 17:22'
updated_date: '2026-07-24 17:23'
labels: []
dependencies: []
ordinal: 14000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The server upload process currently saves uploaded files using Multer default random hash filename without preserving or appending proper file extensions (e.g. .wav). This causes align-cherokee CLI or downstream tools to misdecode or fail reading uploaded audio files.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Uploaded audio files in server.ts are saved with their proper file extension based on original filename or mime type
- [x] #2 The /api/align endpoint uses the extension-preserved audio file path when calling align-cherokee CLI
- [x] #3 AudioRecorder sends audio uploads with explicit filenames and extensions matching the recorded/selected audio format
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Configure multer diskStorage in server.ts to preserve original file extensions (or derive from mime type/mimetype fallback to .wav) for saved upload files in uploads/\n2. Update AudioRecorder.tsx to pass the original file name and extension when audioBlob is a user-uploaded File object, or fallback to recording.wav for recorded PCM audio\n3. Verify file uploads are saved with proper extension and passed to align-cherokee CLI
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Configured Multer diskStorage in server.ts to preserve original file extensions (or infer based on mimetype), updated AudioRecorder.tsx to pass original filenames for uploaded audio files, and verified build and unit tests pass.
<!-- SECTION:FINAL_SUMMARY:END -->
