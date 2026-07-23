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
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
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

  const handleCreateNote = async () => {
    try {
      const newNote = await fetchApi(`/notes`, {
        method: "POST",
        body: JSON.stringify({
          title: "Untitled Note",
          content: "",
          status: "draft",
        }),
      });
      setNotes((prev) => [newNote, ...prev]);
      setSelectedNote(newNote);
    } catch (err) {
      console.error(err);
    }
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
    <div className="h-screen flex flex-col bg-bg">
      {/* Header */}
      <header className="flex justify-between items-center h-14 px-6 bg-surface border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
          </div>
          <h1 className="text-sm font-semibold tracking-tight text-ink">
            Notes
          </h1>
        </div>
        <button
          onClick={onLogout}
          className="text-xs text-ink-3 hover:text-ink transition-colors px-3 py-1.5 rounded-md hover:bg-bg"
        >
          Logout
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-60 bg-surface border-r border-line overflow-y-auto">
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

        {/* Note List */}
        <div className="w-80 bg-surface border-r border-line overflow-y-auto">
          <NoteList
            notes={notes}
            search={search}
            onSearchChange={setSearch}
            onSelectNote={handleSelectNote}
            onCreateNote={handleCreateNote}
            selectedNoteId={selectedNote?.id}
          />
        </div>

        {/* Editor */}
        <div className="flex-1 bg-bg overflow-y-auto">
          {selectedNote ? (
            <NoteEditor
              note={selectedNote}
              categories={categories}
              tags={tags}
              onNoteUpdated={handleNoteUpdated}
              onNoteDeleted={handleNoteDeleted}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-ink-3">
              <div className="w-14 h-14 rounded-xl bg-surface border border-line flex items-center justify-center mb-3">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                  <path d="M10 9H8" />
                </svg>
              </div>
              <p className="text-sm">Select a note to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
