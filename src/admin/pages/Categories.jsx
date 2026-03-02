import {
  BookOpenText,
  Briefcase,
  Cpu,
  Edit3,
  GraduationCap,
  Landmark,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BOOKS } from "../data/mockData";
import {
  DEFAULT_BOOK_CATEGORIES,
  getBookCategories,
  saveBookCategories,
} from "../../shared/bookCategories";

const ICON_MAP = {
  Technology: Cpu,
  Novel: BookOpenText,
  Education: GraduationCap,
  Business: Briefcase,
  History: Landmark,
};

const Categories = () => {
  const [categories, setCategories] = useState(() => getBookCategories());
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setCategories(getBookCategories());
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = {};
    BOOKS.forEach((book) => {
      counts[book.category] = (counts[book.category] || 0) + 1;
    });
    return counts;
  }, []);

  const persistCategories = (nextCategories) => {
    const saved = saveBookCategories(nextCategories);
    setCategories(saved);
    return saved;
  };

  const handleCreateCategory = () => {
    const name = newCategory.trim();
    if (!name) {
      setError("Category name is required.");
      return;
    }

    const exists = categories.some(
      (categoryName) => categoryName.toLowerCase() === name.toLowerCase(),
    );
    if (exists) {
      setError("Category already exists.");
      return;
    }

    persistCategories([...categories, name]);
    setNewCategory("");
    setError("");
  };

  const handleUpdateCategory = (oldName) => {
    const nextName = window.prompt("Update category name:", oldName);
    if (!nextName) {
      return;
    }

    const trimmed = nextName.trim();
    if (!trimmed) {
      setError("Category name is required.");
      return;
    }

    const exists = categories.some(
      (categoryName) =>
        categoryName.toLowerCase() === trimmed.toLowerCase() &&
        categoryName.toLowerCase() !== oldName.toLowerCase(),
    );

    if (exists) {
      setError("Category already exists.");
      return;
    }

    const nextCategories = categories.map((categoryName) =>
      categoryName === oldName ? trimmed : categoryName,
    );
    persistCategories(nextCategories);
    setError("");
  };

  const handleDeleteCategory = (name) => {
    if (categories.length <= 1) {
      setError("At least one category is required.");
      return;
    }

    const isUsedByBooks = BOOKS.some((book) => book.category === name);
    if (isUsedByBooks) {
      setError("Cannot delete a category already used by books.");
      return;
    }

    const confirmed = window.confirm(`Delete "${name}" category?`);
    if (!confirmed) {
      return;
    }

    persistCategories(categories.filter((categoryName) => categoryName !== name));
    setError("");
  };

  return (
    <section className="space-y-9 rounded-3xl border border-white/5 bg-gradient-to-b from-[#0d1f3f] via-[#081838] to-[#06122d] p-8 shadow-[0_24px_80px_rgba(2,8,24,0.45)]">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Book Categories
          </h2>
          <p className="text-slate-400">
            Books must belong to one category. Admin can create, update, or
            delete categories.
          </p>
          <p className="text-xs text-slate-500">
            Default: {DEFAULT_BOOK_CATEGORIES.join(", ")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="New category name"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-cyan-400/70"
          />
          <button
            onClick={handleCreateCategory}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#8f4cf6] to-[#e5459e] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(180,69,228,0.45)] transition-all hover:-translate-y-0.5 hover:brightness-110"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((name) => {
          const CategoryIcon = ICON_MAP[name] ?? BookOpenText;
          return (
            <article
              key={name}
              className="group rounded-[28px] border border-[#2a4164] bg-[linear-gradient(180deg,#122746_0%,#101f3e_100%)] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#3f5f89]"
            >
              <div className="mb-7 inline-flex h-[72px] w-[72px] items-center justify-center rounded-3xl border border-[#5f4084] bg-[linear-gradient(180deg,#4d3279_0%,#3f2b6f_100%)] shadow-[0_10px_28px_rgba(52,22,91,0.35)]">
                <CategoryIcon size={34} className="text-slate-100" aria-hidden />
              </div>
              <h3 className="mb-2 text-2xl font-bold tracking-tight text-white">
                {name}
              </h3>
              <p className="flex items-center gap-2 text-lg text-slate-400">
                <BookOpenText size={18} className="text-slate-400" />
                {categoryCounts[name] || 0} books
              </p>
              <div className="mt-6 flex items-center gap-2">
                <button
                  onClick={() => handleUpdateCategory(name)}
                  className="inline-flex items-center gap-1 rounded-lg border border-sky-400/40 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-200 transition-colors hover:bg-sky-500/20"
                >
                  <Edit3 size={14} />
                  Update
                </button>
                <button
                  onClick={() => handleDeleteCategory(name)}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/20"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default Categories;
