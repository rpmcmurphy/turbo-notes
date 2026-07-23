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
      <div className="p-4 border-b border-stone-200">
        <div className="relative flex items-center bg-stone-100 rounded-md px-3 py-2">
          <Search size={14} className="text-stone-400 mr-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes..."
            className="w-full bg-transparent focus:outline-none text-sm text-stone-700 placeholder-stone-400"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {notes.map((note: Note) => (
          <button
            key={note.id}
            onClick={() => onSelectNote(note)}
            className={`w-full text-left p-3 mb-1 rounded-md transition-colors border ${
              selectedNoteId === note.id
                ? "bg-white border-stone-300 shadow-sm"
                : "bg-transparent border-transparent hover:bg-white hover:border-stone-200"
            }`}
          >
            <h3 className="text-sm font-medium text-stone-800 mb-1 truncate">
              {note.title}
            </h3>
            <p className="text-xs text-stone-500 truncate mb-2">
              {note.summary || note.content?.slice(0, 50) || "No content"}
            </p>
            <div className="flex gap-1 flex-wrap">
              {note.tags?.map(({ tag }: any) => (
                <span
                  key={tag.id}
                  className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded-sm border border-stone-200"
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
      <div className="p-3 border-t border-stone-200">
        <button
          onClick={onCreateNote}
          className="w-full py-2 text-left text-sm text-stone-600 hover:text-stone-900 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-stone-100 transition-colors"
        >
          <Plus size={16} /> New Note
        </button>
      </div>
    </div>
  );
}
