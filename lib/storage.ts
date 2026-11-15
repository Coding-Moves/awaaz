// Tiny IndexedDB wrapper. Everything stays on the user's device.

export type SavedBook = {
  id: string;
  title: string;
  text: string;
  position: number;
  total: number;
  updatedAt: number;
};

const DB_NAME = "awaaz";
const STORE = "books";
const MAX_BOOKS = 12;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function listBooks(): Promise<SavedBook[]> {
  try {
    const all = await run<SavedBook[]>("readonly", (s) => s.getAll() as IDBRequest<SavedBook[]>);
    return all.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export async function getBook(id: string): Promise<SavedBook | undefined> {
  try {
    return await run<SavedBook | undefined>("readonly", (s) => s.get(id) as IDBRequest<SavedBook | undefined>);
  } catch {
    return undefined;
  }
}

export async function saveBook(book: SavedBook): Promise<void> {
  try {
    await run("readwrite", (s) => s.put(book));
    const all = await listBooks();
    for (const old of all.slice(MAX_BOOKS)) await deleteBook(old.id);
  } catch {
    /* storage can be unavailable (private mode); reading still works */
  }
}

export async function updatePosition(id: string, position: number): Promise<void> {
  const book = await getBook(id);
  if (!book) return;
  await saveBook({ ...book, position, updatedAt: Date.now() });
}

export async function deleteBook(id: string): Promise<void> {
  try {
    await run("readwrite", (s) => s.delete(id));
  } catch {
    /* ignore */
  }
}
