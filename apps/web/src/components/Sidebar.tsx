"use client";

import { useState } from "react";
import { Category, Tag } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import Modal from "./Modal";

export default function Sidebar({
  categories,
  tags,
  selectedCategoryIds,
  selectedTagIds,
  onCategoryToggle,
  onTagToggle,
  onDataChange,
}: any) {
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  return (
    <div className="p-6 space-y-8">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs uppercase tracking-wider text-stone-400">
            Categories
          </h3>
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="text-stone-400 hover:text-ink text-xs"
          >
            +
          </button>
        </div>
        <div className="space-y-2">
          {categories.map((cat: Category) => (
            <div key={cat.id} className="flex items-center">
              <input
                type="checkbox"
                id={`cat-${cat.id}`}
                checked={selectedCategoryIds.includes(cat.id)}
                onChange={() => onCategoryToggle(cat.id)}
                className="mr-2 accent-stone-800"
              />
              <label
                htmlFor={`cat-${cat.id}`}
                className="text-sm cursor-pointer text-stone-600 hover:text-ink"
              >
                {cat.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs uppercase tracking-wider text-stone-400">
            Tags
          </h3>
          <button
            onClick={() => setIsTagModalOpen(true)}
            className="text-stone-400 hover:text-ink text-xs"
          >
            +
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag: Tag) => (
            <button
              key={tag.id}
              onClick={() => onTagToggle(tag.id)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedTagIds.includes(tag.id)
                  ? "bg-stone-800 text-paper"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

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
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={editingId ? "New name" : `New ${type.slice(0, -1)} name`}
          className="flex-1 px-2 py-1 border-b border-stone-200 bg-transparent focus:outline-none focus:border-ink text-sm"
          required
        />
        <button
          type="submit"
          className="px-3 py-1 text-xs bg-stone-800 text-paper rounded"
        >
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button
            onClick={() => {
              setEditingId(null);
              setName("");
            }}
            className="text-xs text-stone-400"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {items.map((item: any) => (
          <div key={item.id} className="flex justify-between items-center py-1">
            <span className="text-sm text-stone-600">{item.name}</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingId(item.id);
                  setName(item.name);
                }}
                className="text-xs text-stone-400 hover:text-ink"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-xs text-stone-400 hover:text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
