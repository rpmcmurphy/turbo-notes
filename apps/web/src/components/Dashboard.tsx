"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { Note, Category, Tag } from "@/lib/types";
import Sidebar from "./Sidebar";
import NoteList from "./NoteList";
import NoteEditor from "./NoteEditor";

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const [search, setSearch] = useState("");
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
      [],
    );
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

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

  const loadNotes = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategoryIds.length)
        params.append("categoryIds", selectedCategoryIds.join(","));
      if (selectedTagIds.length)
        params.append("tagIds", selectedTagIds.join(","));

      const data = await fetchApi(`/notes?${params.toString()}`);
      setNotes(data);
    } catch (err) {
      console.error(err);
    }
  }, [search, selectedCategoryIds, selectedTagIds]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
  };

  const handleNoteUpdated = (updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)),
    );
    setSelectedNote(updatedNote);
  };

  const handleNoteDeleted = () => {
    loadNotes();
    setSelectedNote(null);
  };

  return (
    <div className="h-screen flex flex-col bg-paper">
      <header className="flex justify-between items-center py-4 px-8 border-b border-stone-100">
        <h1 className="text-sm font-medium tracking-wide">Notes</h1>
        <button
          onClick={onLogout}
          className="text-xs text-stone-400 hover:text-ink"
        >
          Logout
        </button>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-stone-100 overflow-y-auto">
          <Sidebar
            categories={categories}
            tags={tags}
            selectedCategoryIds={selectedCategoryIds}
            selectedTagIds={selectedTagIds}
            onCategoryToggle={(id: string) =>
              setSelectedCategoryIds((prev) =>
                prev.includes(id)
                  ? prev.filter((i) => i !== id)
                  : [...prev, id],
              )
            }
            onTagToggle={(id: string) =>
              setSelectedTagIds((prev) =>
                prev.includes(id)
                  ? prev.filter((i) => i !== id)
                  : [...prev, id],
              )
            }
            onDataChange={loadData}
          />
        </div>
        <div className="w-80 border-r border-stone-100 overflow-y-auto">
          <NoteList
            notes={notes}
            search={search}
            onSearchChange={setSearch}
            onSelectNote={handleSelectNote}
            selectedNoteId={selectedNote?.id}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {selectedNote ? (
            <NoteEditor
              note={selectedNote}
              categories={categories}
              tags={tags}
              onNoteUpdated={handleNoteUpdated}
              onNoteDeleted={handleNoteDeleted}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-stone-400 text-sm">
              Select a note to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
