import admin from 'firebase-admin';

const firebaseDBUrl = process.env.NEXT_PUBLIC_FIREBASE_DB_URL;
const googleServiceAccount = process.env
  .NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT as string;

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(googleServiceAccount)),
  databaseURL: firebaseDBUrl,
});

const db = admin.database();

const contentRef = 'content';

const getRefPath = ({ language, ref }) => `${language}/${ref}`;

const getContentTypeSnapshot = async ({ language, ref, db }) => {
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
        db: db,
      })) || [];

    const entryTitle = content.title;
    const isDuplicate = snapshotArr.some((item) => item.title === entryTitle);

    if (!isDuplicate) {
      snapshotArr.push({ ...content, createdAt: new Date() });
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
