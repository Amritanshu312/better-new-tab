export const openDB = async () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open("StudyTrackerDB", 11);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("chapters")) {
        db.createObjectStore("chapters", { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e);
  });

export const getAllFromDB = async () => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction("chapters", "readonly");
    const store = tx.objectStore("chapters");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
  });
};

export const saveToDB = async (chapter) => {
  const db = await openDB();
  const tx = db.transaction("chapters", "readwrite");
  tx.objectStore("chapters").put(chapter);
  return tx.done;
};

export const saveManyToDB = async (items) => {
  const db = await openDB();
  const tx = db.transaction("chapters", "readwrite");
  const store = tx.objectStore("chapters");
  items.forEach((i) => store.put(i));
  return tx.done;
};

export const deleteFromDB = async (id) => {
  const db = await openDB();
  const tx = db.transaction("chapters", "readwrite");
  tx.objectStore("chapters").delete(id);
  return tx.done;
};
