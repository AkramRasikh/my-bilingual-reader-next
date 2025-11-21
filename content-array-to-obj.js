import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Load your content array JSON
const contentArray = JSON.parse(
  fs.readFileSync('./content-array.json', 'utf8'),
);

/**
 * Convert array → object keyed by id, and build title→id index
 * If an item has no id, generate one using uuidv4()
 */
const convertContentArrayToObject = (contentArray) => {
  const contentById = {};
  const indexByTitle = {};

  for (const item of contentArray) {
    // Generate id if missing
    if (!item.id) {
      item.id = uuidv4();
    }

    // Store in content object
    contentById[item.id] = item;

    // Index by title
    indexByTitle[item.title] = item.id;
  }

  return { contentById, indexByTitle };
};

const { contentById, indexByTitle } = convertContentArrayToObject(contentArray);

// Write output files
fs.writeFileSync(
  './updated-content.json',
  JSON.stringify(contentById, null, 2),
  'utf8',
);
fs.writeFileSync(
  './indexByContentTitle.json',
  JSON.stringify(indexByTitle, null, 2),
  'utf8',
);

console.log('✔️ updated-content.json and indexByContentTitle.json created!');
