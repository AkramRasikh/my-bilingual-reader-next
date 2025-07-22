import fs from 'fs/promises';
import path from 'path';

const FILE_PATH = path.resolve(
  '/Users/akramrasikh/projects/my-bilingual-reader-next',
  './mock-data.json',
);

export async function saveJsonToFile(data: any) {
  try {
    const json = JSON.stringify(data, null, 2);
    await fs.writeFile(FILE_PATH, json);
    console.log('Data saved successfully to mock-data.json');
  } catch (error) {
    console.error('Failed to write file:', error);
  }
}

const FILE_PATH_READ = path.resolve('./mock-data.json');

export async function readJsonFromFile() {
  try {
    const content = await fs.readFile(FILE_PATH_READ, 'utf-8');
    const data = JSON.parse(content);
    return data;
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return null;
  }
}
