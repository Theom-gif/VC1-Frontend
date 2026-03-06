const DB_NAME = 'authorStudio';
const STORE_NAME = 'manuscripts';
const DB_VERSION = 1;

const openDatabase = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error || new Error('Could not open IndexedDB.'));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });

const runTransaction = async (mode, runner) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);

    let settled = false;
    const done = (fn) => (value) => {
      if (settled) return;
      settled = true;
      fn(value);
    };

    tx.oncomplete = () => {
      db.close();
    };
    tx.onerror = done((error) => {
      db.close();
      reject(tx.error || error || new Error('IndexedDB transaction failed.'));
    });
    tx.onabort = done(() => {
      db.close();
      reject(tx.error || new Error('IndexedDB transaction aborted.'));
    });

    runner(store, done(resolve), done(reject));
  });
};

export const saveManuscriptFile = async (bookId, file) => {
  if (!bookId || !file) return;
  await runTransaction('readwrite', (store, resolve, reject) => {
    const request = store.put(file, String(bookId));
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

export const getManuscriptFile = async (bookId) => {
  if (!bookId) return null;
  return runTransaction('readonly', (store, resolve, reject) => {
    const request = store.get(String(bookId));
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

export const deleteManuscriptFile = async (bookId) => {
  if (!bookId) return;
  await runTransaction('readwrite', (store, resolve, reject) => {
    const request = store.delete(String(bookId));
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};
