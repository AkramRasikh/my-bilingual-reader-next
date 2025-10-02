// utils/checkIfVideoExists.ts
const checkIfVideoExists = async (url: string): Promise<boolean> => {
  try {
    const res = await fetch('/api/checkVideoExists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    return data.exists;
  } catch (err) {
    console.error('Error calling checkVideoExists API:', err);
    return false;
  }
};

export default checkIfVideoExists;
