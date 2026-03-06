const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org';
const COVER_BASE_URL = 'https://covers.openlibrary.org';

const toJson = async (response) => {
  if (!response.ok) {
    throw new Error(`Open Library request failed with ${response.status}`);
  }
  return response.json();
};

const formatDescription = (description) => {
  if (!description) return '';
  if (typeof description === 'string') return description;
  if (typeof description?.value === 'string') return description.value;
  return '';
};

const buildCoverUrl = (coverI) => {
  if (!coverI) return '';
  return `${COVER_BASE_URL}/b/id/${coverI}-L.jpg`;
};

export const searchBooks = async (query, options = {}) => {
  const trimmedQuery = query?.trim();
  if (!trimmedQuery) return [];

  const limit = Number.isFinite(options.limit) ? options.limit : 10;
  const params = new URLSearchParams({
    q: trimmedQuery,
    limit: String(Math.max(1, Math.min(limit, 50))),
  });

  const response = await fetch(`${OPEN_LIBRARY_BASE_URL}/search.json?${params}`, {
    signal: options.signal,
  });
  const payload = await toJson(response);
  const docs = Array.isArray(payload?.docs) ? payload.docs : [];

  return docs.map((doc) => ({
    key: doc?.key || '',
    title: doc?.title || 'Untitled',
    authorName: Array.isArray(doc?.author_name) ? doc.author_name[0] : '',
    firstPublishYear: doc?.first_publish_year || null,
    subject: Array.isArray(doc?.subject) ? doc.subject[0] : '',
    coverUrl: buildCoverUrl(doc?.cover_i),
  }));
};

export const searchAuthors = async (query, options = {}) => {
  const trimmedQuery = query?.trim();
  if (!trimmedQuery) return [];

  const limit = Number.isFinite(options.limit) ? options.limit : 10;
  const params = new URLSearchParams({
    q: trimmedQuery,
    limit: String(Math.max(1, Math.min(limit, 50))),
  });

  const response = await fetch(`${OPEN_LIBRARY_BASE_URL}/search/authors.json?${params}`, {
    signal: options.signal,
  });
  const payload = await toJson(response);
  const docs = Array.isArray(payload?.docs) ? payload.docs : [];

  return docs.map((doc) => ({
    key: doc?.key || '',
    name: doc?.name || 'Unknown Author',
    topWork: doc?.top_work || '',
    workCount: doc?.work_count || 0,
  }));
};

export const getWorkDetails = async (workKey, options = {}) => {
  if (!workKey) return null;

  const normalizedKey = workKey.startsWith('/works/') ? workKey : `/works/${workKey}`;
  const response = await fetch(`${OPEN_LIBRARY_BASE_URL}${normalizedKey}.json`, {
    signal: options.signal,
  });
  const payload = await toJson(response);

  return {
    key: payload?.key || normalizedKey,
    title: payload?.title || '',
    description: formatDescription(payload?.description),
    firstPublishDate: payload?.first_publish_date || '',
  };
};
