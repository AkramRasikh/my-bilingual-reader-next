import { db } from './firebase-admin-init';

const addContentLogic = async ({ language, id, content }) => {
  try {
    const refPath = `${language}/content/${id}`;
    const contentRef = db.ref(refPath);

    // Check if ID already exists
    const snapshot = await contentRef.once('value');
    if (snapshot.exists()) {
      throw new Error(`## Content with id "${id}" already exists`);
    }

    // Write the object under the ID
    await contentRef.set(content);

    return id;
  } catch (error) {
    throw new Error(`Error adding ${id} to DB: ${error.message}`);
  }
};

export { addContentLogic };
