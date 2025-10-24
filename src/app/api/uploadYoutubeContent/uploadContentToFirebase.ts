import { db } from './firebase-admin-init';

const contentRef = 'content';

const getRefPath = ({ language, ref }) => `${language}/${ref}`;

const getContentTypeSnapshot = async ({ language, ref }) => {
  try {
    const refPath = getRefPath({ language, ref });
    const refObj = db.ref(refPath);
    const snapshot = await refObj.once('value');
    const valSnapshotData = snapshot.val();
    return valSnapshotData;
  } catch (error) {
    throw new Error(`Error getting snapshot of ${ref} for ${language}`);
  }
};

const addContentLogic = async ({ language, content }) => {
  try {
    const refPath = getRefPath({ language, ref: contentRef });
    const snapshotArr =
      (await getContentTypeSnapshot({
        language,
        ref: contentRef,
      })) || [];

    const entryTitle = content.title;
    const isDuplicate = snapshotArr.some((item) => item.title === entryTitle);

    if (!isDuplicate) {
      snapshotArr.push(content);
      await db.ref(refPath).set(snapshotArr);
      return entryTitle;
    } else {
      throw new Error(`Error ${content.title} ${content} already exists in DB`);
    }
  } catch (error) {
    throw new Error(`Error adding ${content} to DB`);
  }
};

export { addContentLogic };
