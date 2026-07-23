"use client";

import { Note } from "@/lib/types";
import { Plus, Search } from "lucide-react";

export default function NoteList({
  notes,
  search,
  onSearchChange,
  onSelectNote,
  selectedNoteId,
}: any) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-stone-100">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-5 pr-2 py-1 bg-transparent focus:outline-none text-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notes.map((note: Note) => (
          <button
            key={note.id}
            onClick={() => onSelectNote(note)}
            className={`w-full text-left p-4 border-b border-stone-50 hover:bg-stone-50 transition-colors ${
              selectedNoteId === note.id ? "bg-stone-100" : ""
            }`}
          >
            <h3 className="text-sm font-medium text-ink mb-1 truncate">
              {note.title}
            </h3>
            <p className="text-xs text-stone-400 truncate">
              {note.summary || note.content?.slice(0, 50) || "No content"}
            </p>
            <div className="flex gap-2 mt-2">
              {note.tags.map(({ tag }: any) => (
                <span
                  key={tag.id}
                  className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded-sm"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </button>
        ))}
        {notes.length === 0 && (
          <div className="p-4 text-center text-stone-400 text-sm">
            No notes found
          </div>
        )}
      </div>
      <button className="p-4 border-t border-stone-100 text-left text-sm text-stone-400 hover:text-ink flex items-center gap-2">
        <Plus size={14} /> New Note
      </button>
    </div>
  );
}
