"use client";

import { Note } from "@/lib/types";
import { Plus, Search } from "lucide-react";

export default function NoteList({
  notes,
  search,
  onSearchChange,
  onSelectNote,
  onCreateNote,
  selectedNoteId,
}: any) {
  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3.5 border-b border-line">
        <div className="relative flex items-center bg-bg rounded-md px-3 py-2 border border-line">
          <Search size={14} className="text-ink-3 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes..."
            className="w-full bg-transparent focus:outline-none text-sm text-ink placeholder:text-ink-3"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {notes.map((note: Note) => (
          <button
            key={note.id}
            onClick={() => onSelectNote(note)}
            className={`w-full text-left p-3 mb-1 rounded-md transition-all border ${
              selectedNoteId === note.id
                ? "bg-surface border-line shadow-sm"
                : "border-transparent hover:bg-bg"
            }`}
          >
            <h3 className="text-sm font-medium text-ink mb-1 truncate">
              {note.title}
            </h3>
            <p className="text-xs text-ink-3 truncate mb-2">
              {note.summary || note.content?.slice(0, 50) || "No content"}
            </p>
            <div className="flex gap-1 flex-wrap">
              {note.tags?.map(({ tag }: any) => (
                <span
                  key={tag.id}
                  className="text-[10px] px-1.5 py-0.5 bg-bg text-ink-3 rounded border border-line"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </button>
        ))}
        {notes.length === 0 && (
          <div className="p-8 text-center text-ink-3 text-sm">
            No notes found
          </div>
        )}
      </div>

      {/* New Note */}
      <div className="p-3 border-t border-line">
        <button
          onClick={onCreateNote}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-ink-2 border border-dashed border-line hover:border-accent hover:text-accent rounded-md transition-colors"
        >
          <Plus size={15} /> New Note
        </button>
      </div>
    </div>
  );
}
