# Dialog Alignment & Auto-Transcription Interface

An interactive web workspace for Cherokee language educators and revitalizers to extract, record, and auto-align dialogue audio directly from **Sgwehyohvga** lesson exports.

This tool parses incoming lesson JSON files, extracts embedded conversation steps, generates an alignment chunk list, and invokes the `align-cherokee` CLI pipeline to compute precise word and line timestamps using VAD pre-segmentation and CTC emissions with Dynamic Time Warping (DTW).

> **Note for Developers:** This specification outlines the workspace flow, JSON translation layers, and backend execution using the `align-cherokee` CLI.

## Demo



https://github.com/user-attachments/assets/628c7c80-64af-454b-b5ce-7314fe7abfb4

> A user uploads a lesson JSON, records dialog, and aligns it. The user then shows the karaoke follow along modes, as well as the words that were not automatically extracted, shown with Xs at the bottom




---

## Workspace Architecture

```
[ Lesson JSON Drop ]
        │
        ▼
[ Extract Steps ] ──> Formats array into `--chunk-list` JSON
        │
        ▼
[ Audio Capture ] ──> Records or receives input WAV/audio file
        │
        ▼
[ Backend / Service ] ──> Executes `align-cherokee` CLI
        │
        ▼
[ Manifest Parser ] ──> Reads `alignment_manifest.json` & updates UI

```

---

## Technical Integration & Workflow

### 1. Ingestion & Pre-processing

* **Lesson Parsing:** Drag and drop a `LessonRecord` or `InnerLessonJson`. The app filters `modules` for `type === "conversation"`.


* **Chunk List Generation:** The backend (or API wrapper) maps `module.data.steps` to the `--chunk-list` JSON format expected by `align-cherokee`:



```json
[
  {
    "line_id": "88f32118-3abc-4b22-a468-5d3394f07643",
    "raw_phonetic": "do yv-da \"I am hungry\" tsa-la-gi gvh-di?",
    "cherokee_syllabary": "Ꮩ ᏴᏓ \"I am hungry\" ᏣᎳᎩ ᎬᏗ?"
  }
]

```

(Note: `line_id` maps directly to the step's `id` from the lesson JSON.)

### 2. Audio Capture

* **Recording/Upload:** Accept input audio for the full conversation (or step-by-step) as `.wav` or standard audio formats.

### 3. Execution (`align-cherokee`)

When the user clicks **"Align"**, the backend executes the alignment pipeline:

```bash
align-cherokee \
  --audio 'uploads/lesson_dialog.wav' \
  --chunk-list 'temp/dialog_chunk_list.json' \
  --output-dir 'output/dialog_01' \
  --export-praat

```

**Under the hood, `align-cherokee` handles:**

1. Voice Activity Detection (VAD) pre-segmentation.
2. Wav2Vec2 CTC emissions extraction.
3. Dynamic Time Warping (DTW) character/token alignment with Needleman-Wunsch fusion.
4. Generation of `alignment_manifest.json` and Praat `.TextGrid` files.

### 4. Continuous Playback & Review

The UI parses `alignment_manifest.json` to populate timing state:

* **Line-Level Playback:** Play individual step audio using start/end boundary offsets.
* **Karaoke Mode:** Real-time character/word highlighting synchronized to continuous playback.
* **Praat Export:** Download `alignment.TextGrid` for advanced phonetic analysis or manual annotation in Praat.

### 5. Vocabulary Audit

* Cross-reference word timestamps in `alignment_manifest.json` against target items in `lesson_json.vocab`.


* Flag any vocabulary items from the lesson that were missed or had high Character Error Rate (CER) during alignment.



---

## Data Schema Reference

### Lesson Input (Source)

```json
{
  "id": "b4352bc6-0437-402a-bedc-c5cf30ee4112",
  "modules": [
    {
      "id": "bb63948f-a84b-4f02-bc87-e8744ab1940f",
      "type": "conversation",
      "data": {
        "steps": [
          {
            "id": "88f32118-3abc-4b22-a468-5d3394f07643",
            "speaker": "npc",
            "prompt": {
              "english": "How do you say \"I am hungry\" in Cherokee?",
              "cherokee": "Ꮩ ᏴᏓ \"I am hungry\" ᏣᎳᎩ ᎬᏗ?",
              "phonetic": "do yv-da \"I am hungry\" tsa-la-gi gvh-di?"
            }
          }
        ]
      }
    }
  ]
}

```

### Parsed Manifest Output (`alignment_manifest.json`)

```json
{
  "segments": [
    {
      "line_id": "88f32118-3abc-4b22-a468-5d3394f07643",
      "start": 0.42,
      "end": 3.15,
      "words": [
        {
          "word": "Ꮩ",
          "start": 0.42,
          "end": 0.85
        },
        {
          "word": "ᏴᏓ",
          "start": 0.90,
          "end": 1.40
        },
        {
          "word": "ᏣᎳᎩ",
          "start": 2.10,
          "end": 2.65
        },
        {
          "word": "ᎬᏗ",
          "start": 2.70,
          "end": 3.15
        }
      ]
    }
  ],
  "metrics": {
    "matched_gt_verses_ratio": 1.0,
    "matched_verse_cer": 0.02
  }
}

```

---

## Local Development & Environment Setup

### Prerequisites

* **Node.js:** `v18+`
* **Python Environment:** Python 3.10+ with `align-cherokee` CLI installed and available in `$PATH`.

### Setup Steps

1. **Install Frontend Dependencies:**
```bash
npm install

```


2. **Verify Alignment Tooling:**
Ensure the ASR alignment tool is callable locally:
```bash
align-cherokee --help

```


3. **Start Development Workspace:**
```bash
npm run dev

```
