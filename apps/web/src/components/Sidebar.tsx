"use client";

import { useState } from "react";
import { Category, Tag } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import Modal from "./Modal";
import { Settings } from "lucide-react";

export default function Sidebar({
  categories,
  tags,
  selectedCategoryIds,
  selectedTagIds,
  onCategoryToggle,
  onTagToggle,
  onDataChange,
  onManageClick,
}: any) {
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  return (
    <div className="p-5 space-y-7 flex flex-col h-full">
      <div className="flex-1">
        {/* Categories */}
        <div className="mb-7">
          {/* ... existing categories code ... */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[11px] uppercase tracking-wider text-ink-3 font-medium">
              Categories
            </h3>
            <button
              onClick={() => setIsCatModalOpen(true)}
              className="w-5 h-5 flex items-center justify-center rounded text-ink-3 hover:text-accent hover:bg-accent-soft transition-colors text-sm"
            >
              +
            </button>
          </div>
          <div className="space-y-1">
            {categories.map((cat: Category) => (
              <label
                key={cat.id}
                htmlFor={`cat-${cat.id}`}
                className="flex items-center gap-2.5 px-1.5 py-1 rounded-md cursor-pointer hover:bg-bg transition-colors"
              >
                <input
                  type="checkbox"
                  id={`cat-${cat.id}`}
                  checked={selectedCategoryIds.includes(cat.id)}
                  onChange={() => onCategoryToggle(cat.id)}
                  className="custom-checkbox"
                />
                <span className="text-sm text-ink-2 select-none">
                  {cat.name}
                </span>
              </label>
            ))}
            {categories.length === 0 && (
              <p className="text-xs text-ink-3 px-1.5">No categories</p>
            )}
          </div>
        </div>

        {/* Tags */}
        <div>
          {/* ... existing tags code ... */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[11px] uppercase tracking-wider text-ink-3 font-medium">
              Tags
            </h3>
            <button
              onClick={() => setIsTagModalOpen(true)}
              className="w-5 h-5 flex items-center justify-center rounded text-ink-3 hover:text-accent hover:bg-accent-soft transition-colors text-sm"
            >
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag: Tag) => (
              <button
                key={tag.id}
                onClick={() => onTagToggle(tag.id)}
                className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                  selectedTagIds.includes(tag.id)
                    ? "bg-accent-soft text-accent border border-accent/20"
                    : "bg-bg text-ink-2 border border-line hover:bg-sidebar-hover"
                }`}
              >
                {tag.name}
              </button>
            ))}
            {tags.length === 0 && <p className="text-xs text-ink-3">No tags</p>}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-line">
        <button
          onClick={onManageClick}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-ink-2 hover:bg-bg hover:text-ink transition-colors"
        >
          <Settings size={15} className="text-ink-3" />
          Category & tags
        </button>
      </div>

      {/* ... existing modals ... */}
      {isCatModalOpen && (
        <Modal
          title="Manage Categories"
          onClose={() => setIsCatModalOpen(false)}
        >
          <CrudManager
            type="categories"
            items={categories}
            onClose={() => setIsCatModalOpen(false)}
            onDataChange={onDataChange}
          />
        </Modal>
      )}

      {isTagModalOpen && (
        <Modal title="Manage Tags" onClose={() => setIsTagModalOpen(false)}>
          <CrudManager
            type="tags"
            items={tags}
            onClose={() => setIsTagModalOpen(false)}
            onDataChange={onDataChange}
          />
        </Modal>
      )}
    </div>
  );
}

function CrudManager({ type, items, onClose, onDataChange }: any) {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetchApi(`/${type}/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify({ name }),
        });
      } else {
        await fetchApi(`/${type}`, {
          method: "POST",
          body: JSON.stringify({ name }),
        });
      }
      setName("");
      setEditingId(null);
      onDataChange();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchApi(`/${type}/${id}`, { method: "DELETE" });
      onDataChange();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={editingId ? "New name" : `New ${type.slice(0, -1)} name`}
          className="flex-1 px-3 py-2 bg-bg border border-line rounded-xs text-sm text-ink placeholder:text-ink-3 focus-input transition-all"
          required
        />
        <button
          type="submit"
          className="px-7 py-2 text-xs font-medium bg-accent text-white rounded-xs hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setName("");
            }}
            className="px-2 text-xs text-ink-3 hover:text-ink transition-colors"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="space-y-1 max-h-64 overflow-y-auto -mx-1 px-1">
        {items.map((item: any) => (
          <div
            key={item.id}
            className="flex justify-between items-center py-1.5 px-2 rounded-md hover:bg-bg transition-colors"
          >
            <span className="text-sm text-ink-2">{item.name}</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingId(item.id);
                  setName(item.name);
                }}
                className="text-xs text-ink-3 hover:text-accent transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-xs text-ink-3 hover:text-red transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-ink-3 text-center py-4">No {type} yet</p>
        )}
      </div>
    </div>
  );
}
