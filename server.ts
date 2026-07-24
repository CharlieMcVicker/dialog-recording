import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const app = express();
const port = process.env.PORT || 3001;

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.post('/api/align', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'chunkList', maxCount: 1 }
]), async (req, res) => {
  try {
    // Ensure uploads directory exists
    if (!existsSync('uploads')) {
      await fs.mkdir('uploads');
    }
    if (!existsSync('temp')) {
      await fs.mkdir('temp');
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const audioFile = files?.['audio']?.[0];
    let chunkListContent;
    let chunkListPath = '';

    // Handle chunkList as either a file or a JSON string in body
    if (files?.['chunkList']?.[0]) {
      chunkListPath = files['chunkList'][0].path;
      chunkListContent = await fs.readFile(chunkListPath, 'utf8');
    } else if (req.body.chunkList) {
      chunkListContent = req.body.chunkList;
      chunkListPath = `temp/chunk_list_${Date.now()}.json`;
      await fs.writeFile(chunkListPath, chunkListContent);
    } else {
      return res.status(400).json({ error: 'Missing chunkList' });
    }

    if (!audioFile) {
      return res.status(400).json({ error: 'Missing audio file' });
    }

    const outputDir = `temp/out_${Date.now()}`;
    await fs.mkdir(outputDir, { recursive: true });

    // Execute align-cherokee CLI command
    const cmd = `align-cherokee --audio ${audioFile.path} --chunk-list ${chunkListPath} --output-dir ${outputDir} --export-praat`;
    
    exec(cmd, async (error, stdout, stderr) => {
      if (error) {
        console.error('align-cherokee command failed:', stderr || error.message);
        return res.status(500).json({
          error: 'Alignment failed: align-cherokee CLI executable failed or was not found in $PATH.',
          details: stderr || error.message
        });
      }

      // Read output
      try {
        const manifestContent = await fs.readFile(path.join(outputDir, 'alignment_manifest.json'), 'utf8');
        const textGridPath = path.join(outputDir, 'output.TextGrid');
        let textGridMetadata = null;
        if (existsSync(textGridPath)) {
          const stats = await fs.stat(textGridPath);
          textGridMetadata = {
            fileName: 'output.TextGrid',
            size: stats.size,
            path: textGridPath
          };
        }

        res.json({
          status: 'success',
          manifest: JSON.parse(manifestContent),
          textGrid: textGridMetadata
        });
      } catch (readError) {
        res.status(500).json({ error: 'Failed to read alignment output', details: String(readError) });
      }
    });

  } catch (error) {
    console.error('Error in /api/align:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/download', (req, res) => {
  const filePath = req.query.path as string;
  if (!filePath) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }
  
  // In a real app we'd want to validate the path to prevent directory traversal
  const absolutePath = path.resolve(filePath);
  res.download(absolutePath, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).json({ error: 'Failed to download file' });
    }
  });
});


app.listen(port, () => {
  console.log(`Backend bridge server running at http://localhost:${port}`);
});
