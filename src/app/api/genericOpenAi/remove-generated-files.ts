import fs from 'fs/promises';
import path from 'path';

export async function deleteVoiceVoxFiles(folderPath: string) {
  try {
    const files = await fs.readdir(folderPath);
    for (const file of files) {
      if (file.includes('voicevox')) {
        const filePath = path.join(folderPath, file);
        await fs.unlink(filePath);
        console.log(`Deleted: ${filePath}`);
      }
    }
  } catch (err) {
    console.error('## Error deleting voicevox files:', err);
  }
}
