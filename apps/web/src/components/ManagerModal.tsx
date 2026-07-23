"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { Category, Tag } from "@/lib/types";
import { Search, Plus, Trash2, Edit3, Check, X } from "lucide-react";

export default function ManagerModal({
  onClose,
  onDataChange,
}: {
  onClose: () => void;
  onDataChange: () => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [catSearch, setCatSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  const [newCatName, setNewCatName] = useState("");
  const [newTagName, setNewTagName] = useState("");

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");

  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [cats, tgs] = await Promise.all([
        fetchApi("/categories"),
        fetchApi("/tags"),
      ]);
      setCategories(cats);
      setTags(tgs);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Category Handlers
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await fetchApi(`/categories`, {
        method: "POST",
        body: JSON.stringify({ name: newCatName }),
      });
      setNewCatName("");
      loadData();
      onDataChange();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    try {
      await fetchApi(`/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: editingCatName }),
      });
      setEditingCatId(null);
      loadData();
      onDataChange();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Delete this category? It will be removed from all notes.")) {
      try {
        await fetchApi(`/categories/${id}`, { method: "DELETE" });
        loadData();
        onDataChange();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Tag Handlers
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      await fetchApi(`/tags`, {
        method: "POST",
        body: JSON.stringify({ name: newTagName }),
      });
      setNewTagName("");
      loadData();
      onDataChange();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTag = async (id: string) => {
    try {
      await fetchApi(`/tags/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: editingTagName }),
      });
      setEditingTagId(null);
      loadData();
      onDataChange();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (confirm("Delete this tag? It will be removed from all notes.")) {
      try {
        await fetchApi(`/tags/${id}`, { method: "DELETE" });
        loadData();
        onDataChange();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(catSearch.toLowerCase()),
  );

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 bg-bg z-50 flex flex-col p-8 overflow-auto">
      <div className="w-full mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-semibold text-ink">Manage Taxonomy</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-sm text-ink-3 hover:text-ink hover:bg-surface transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
          {/* Categories Section */}
          <div className="bg-surface rounded-sm border border-line p-6 flex flex-col">
            <h3 className="text-sm font-medium text-ink mb-4">Categories</h3>

            {/* Add Form */}
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="New category name..."
                className="flex-1 px-3 py-2 bg-bg border border-line rounded-sm text-sm text-ink placeholder:text-ink-3 focus-input transition-all"
              />
              <button
                type="submit"
                className="p-2 px-7 bg-accent text-white rounded-sm hover:opacity-90 transition-opacity"
              >
                <Plus size={16} />
              </button>
            </form>

            {/* Search Filter */}
            <div className="relative flex items-center bg-bg rounded-sm px-3 py-2 border border-line mb-4">
              <Search size={14} className="text-ink-3 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                placeholder="Filter categories..."
                className="w-full bg-transparent focus:outline-none text-sm text-ink placeholder:text-ink-3"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-1">
              {filteredCategories.length === 0 && (
                <p className="text-sm text-ink-3 text-center py-8">
                  No categories found
                </p>
              )}
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between py-2 px-3 rounded-sm hover:bg-bg transition-colors group"
                >
                  {editingCatId === cat.id ? (
                    <div className="flex flex-1 gap-2 items-center">
                      <input
                        type="text"
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        className="flex-1 px-2 py-1 bg-bg border border-accent rounded-sm text-sm text-ink focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateCategory(cat.id)}
                        className="text-accent hover:text-accent/80"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingCatId(null)}
                        className="text-ink-3 hover:text-ink"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm text-ink-2">{cat.name}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingCatId(cat.id);
                            setEditingCatName(cat.name);
                          }}
                          className="p-1.5 text-ink-3 hover:text-accent rounded-sm hover:bg-surface transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 text-ink-3 hover:text-red rounded-sm hover:bg-surface transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tags Section */}
          <div className="bg-surface rounded-sm border border-line p-6 flex flex-col">
            <h3 className="text-sm font-medium text-ink mb-4">Tags</h3>

            {/* Add Form */}
            <form onSubmit={handleAddTag} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="New tag name..."
                className="flex-1 px-3 py-2 bg-bg border border-line rounded-sm text-sm text-ink placeholder:text-ink-3 focus-input transition-all"
              />
              <button
                type="submit"
                className="p-2 px-7 bg-accent text-white rounded-sm hover:opacity-90 transition-opacity"
              >
                <Plus size={16} />
              </button>
            </form>

            {/* Search Filter */}
            <div className="relative flex items-center bg-bg rounded-sm px-3 py-2 border border-line mb-4">
              <Search size={14} className="text-ink-3 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Filter tags..."
                className="w-full bg-transparent focus:outline-none text-sm text-ink placeholder:text-ink-3"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-1">
              {filteredTags.length === 0 && (
                <p className="text-sm text-ink-3 text-center py-8">
                  No tags found
                </p>
              )}
              {filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between py-2 px-3 rounded-sm hover:bg-bg transition-colors group"
                >
                  {editingTagId === tag.id ? (
                    <div className="flex flex-1 gap-2 items-center">
                      <input
                        type="text"
                        value={editingTagName}
                        onChange={(e) => setEditingTagName(e.target.value)}
                        className="flex-1 px-2 py-1 bg-bg border border-accent rounded-sm text-sm text-ink focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateTag(tag.id)}
                        className="text-accent hover:text-accent/80"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingTagId(null)}
                        className="text-ink-3 hover:text-ink"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm text-ink-2">{tag.name}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingTagId(tag.id);
                            setEditingTagName(tag.name);
                          }}
                          className="p-1.5 text-ink-3 hover:text-accent rounded-sm hover:bg-surface transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className="p-1.5 text-ink-3 hover:text-red rounded-sm hover:bg-surface transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
