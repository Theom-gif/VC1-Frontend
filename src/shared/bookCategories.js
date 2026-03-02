export const CATEGORY_STORAGE_KEY = "admin_book_categories";

export const DEFAULT_BOOK_CATEGORIES = [
  "Technology",
  "Novel",
  "Education",
  "Business",
  "History",
];

const normalizeCategoryName = (name) => name.trim();

const dedupeCategories = (categories) => {
  const seen = new Set();
  return categories.filter((name) => {
    const key = name.toLowerCase();
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const getBookCategories = () => {
  if (typeof window === "undefined") {
    return DEFAULT_BOOK_CATEGORIES;
  }

  const raw = window.localStorage.getItem(CATEGORY_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_BOOK_CATEGORIES;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return DEFAULT_BOOK_CATEGORIES;
    }

    const normalized = dedupeCategories(
      parsed
        .filter((item) => typeof item === "string")
        .map(normalizeCategoryName),
    );

    return normalized.length > 0 ? normalized : DEFAULT_BOOK_CATEGORIES;
  } catch {
    return DEFAULT_BOOK_CATEGORIES;
  }
};

export const saveBookCategories = (categories) => {
  if (typeof window === "undefined") {
    return DEFAULT_BOOK_CATEGORIES;
  }

  const normalized = dedupeCategories(
    categories
      .filter((item) => typeof item === "string")
      .map(normalizeCategoryName),
  );

  const safeCategories =
    normalized.length > 0 ? normalized : [...DEFAULT_BOOK_CATEGORIES];

  window.localStorage.setItem(
    CATEGORY_STORAGE_KEY,
    JSON.stringify(safeCategories),
  );
  return safeCategories;
};

export const isValidBookCategory = (category, categories) =>
  categories.some((name) => name === category);
