import { apiClient, API_BASE_URL } from '../../lib/apiClient';

const BOOKS_ENDPOINT = '/api/auth/books';
const UPLOAD_BOOK_ENDPOINT = '/api/auth/book';
const IMPORT_BOOKS_ENDPOINT = '/api/auth/books/import-local';

const toNumberId = (value, fallback = Date.now()) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getFileName = (value = '') => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  const normalized = trimmed.split('?')[0];
  const segments = normalized.split('/');
  return segments[segments.length - 1] || '';
};

const inferFileType = (fileName = '') => {
  const lower = String(fileName).toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.epub')) return 'application/epub+zip';
  if (lower.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (lower.endsWith('.doc')) return 'application/msword';
  return '';
};

const isLoopbackHost = (host = '') =>
  host === '127.0.0.1' || host === 'localhost' || host === '::1';

const normalizeAssetUrl = (value = '') => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  try {
    const url = new URL(raw);
    if (typeof window !== 'undefined' && window.location?.hostname) {
      const currentHost = window.location.hostname;
      if (!isLoopbackHost(currentHost) && isLoopbackHost(url.hostname)) {
        url.hostname = currentHost;
      }
    }
    return url.toString();
  } catch {
    return raw;
  }
};

export const mapApiBookToUiBook = (book) => ({
  bookId: toNumberId(book?.id),
  id: toNumberId(book?.id),
  title: book?.title || 'Untitled',
  author: book?.author || 'Unknown Author',
  status: 'Published',
  rating: 0,
  reads: '0',
  sales: '$0',
  img:
    (book?.cover_image_path ? `${API_BASE_URL}/storage/${book.cover_image_path}` : '') ||
    normalizeAssetUrl(book?.cover_image_url) ||
    'https://picsum.photos/seed/new-book/300/450',
  description: book?.description || '',
  genre: book?.category || '',
  manuscriptUrl:
    (book?.book_file_path ? `${API_BASE_URL}/storage/${book.book_file_path}` : '') ||
    normalizeAssetUrl(book?.book_file_url),
  manuscriptName: getFileName(book?.book_file_url || book?.book_file_path || ''),
  manuscriptType: inferFileType(getFileName(book?.book_file_url || book?.book_file_path || '')),
  manuscriptSizeBytes: 0,
  source: 'database',
});

export const getBooksRequest = async () => {
  const response = await apiClient.get(BOOKS_ENDPOINT);
  const rows = Array.isArray(response?.data?.data) ? response.data.data : [];
  return rows.map(mapApiBookToUiBook);
};

export const uploadBookRequest = (formData) =>
  apiClient.post(UPLOAD_BOOK_ENDPOINT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const importLocalBooksRequest = async (books = []) => {
  const response = await apiClient.post(IMPORT_BOOKS_ENDPOINT, { books });
  return response?.data?.data || {};
};

export const updateBookRequest = (id, formData) =>
  apiClient.post(`${BOOKS_ENDPOINT}/${id}`, (() => {
    const payload = formData instanceof FormData ? formData : new FormData();
    if (!payload.has('_method')) {
      payload.append('_method', 'PATCH');
    }
    return payload;
  })(), {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const deleteBookRequest = (id) => apiClient.delete(`${BOOKS_ENDPOINT}/${id}`);
