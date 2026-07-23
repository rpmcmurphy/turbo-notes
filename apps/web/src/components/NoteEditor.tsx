"use client";

import { useState, useEffect } from "react";
import { Note, Category, Tag } from "@/lib/types";
import { fetchApi, uploadFile } from "@/lib/api";
import {
  FileText,
  Image as ImageIcon,
  Trash2,
  Link as LinkIcon,
  X,
  Plus,
  ChevronDown,
} from "lucide-react";

export default function NoteEditor({
  note,
  categories,
  tags,
  onNoteUpdated,
  onNoteDeleted,
}: any) {
  const [title, setTitle] = useState(note.title);
  const [summary, setSummary] = useState(note.summary || "");
  const [content, setContent] = useState(note.content || "");
  const [status, setStatus] = useState(note.status);
  const [categoryIds, setCategoryIds] = useState(
    note.categories?.map((c: any) => c.category.id) || [],
  );
  const [tagIds, setTagIds] = useState(
    note.tags?.map((t: any) => t.tag.id) || [],
  );

  const [urls, setUrls] = useState<any[]>(note.urls || []);

  const [tempAttachments, setTempAttachments] = useState<any[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<any[]>([]);

  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(
    note.title === "Untitled Note" && !note.content,
  );

  useEffect(() => {
    setTitle(note.title);
    setSummary(note.summary || "");
    setContent(note.content || "");
    setStatus(note.status);
    setCategoryIds(note.categories?.map((c: any) => c.category.id) || []);
    setTagIds(note.tags?.map((t: any) => t.tag.id) || []);
    setUrls(note.urls || []);
    setTempAttachments([]);
    setAttachmentPreviews([]);
    setIsEditing(note.title === "Untitled Note" && !note.content);
  }, [note.id]);

  const handleSave = async () => {
    try {
      const payload: any = {
        title,
        summary,
        content,
        status,
        categoryIds,
        tagIds,
        urls: urls.map((u) => ({
          title: u.title,
          url: u.url,
          description: u.description || "",
        })),
      };

      if (tempAttachments.length > 0) {
        payload.attachments = tempAttachments;
      }

      const updated = await fetchApi(`/notes/${note.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      onNoteUpdated(updated);
      setIsEditing(false);
      setTempAttachments([]);
      setAttachmentPreviews([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setTitle(note.title);
    setSummary(note.summary || "");
    setContent(note.content || "");
    setUrls(note.urls || []);
    setTempAttachments([]);
    setAttachmentPreviews([]);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm("Delete this note?")) {
      await fetchApi(`/notes/${note.id}`, { method: "DELETE" });
      onNoteDeleted();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const newPreviews = [];
    const newMetas = [];

    try {
      for (const file of Array.from(e.target.files)) {
        const meta = await uploadFile(file);
        newMetas.push(meta);
        newPreviews.push({
          url: URL.createObjectURL(file),
          isImage: file.type.startsWith("image/"),
          name: file.name,
        });
      }

      setTempAttachments((prev) => [...prev, ...newMetas]);
      setAttachmentPreviews((prev) => [...prev, ...newPreviews]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveTempAttachment = (index: number) => {
    setTempAttachments((prev) => prev.filter((_, i) => i !== index));
    setAttachmentPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteAttachment = async (id: string) => {
    await fetchApi(`/attachments/${id}`, { method: "DELETE" });
    const updated = await fetchApi(`/notes/${note.id}`);
    onNoteUpdated(updated);
  };

  const statusColors: Record<string, string> = {
    draft: "#f59e0b",
    published: "#10b981",
    archived: "#9b9890",
  };

  return (
    <div className="p-8 mx-auto">
      {/* Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8 cursor-zoom-out"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            alt="Zoomed"
            className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
          />
          <button className="absolute top-6 right-6 text-white text-3xl hover:text-ink-3">
            ×
          </button>
        </div>
      )}

      <div className="bg-surface rounded-md border border-line shadow-sm p-8">
        {/* Header Row */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-line">
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: statusColors[status] || "#9b9890" }}
            />
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                disabled={!isEditing}
                className="appearance-none bg-bg border border-line rounded-md pl-2.5 pr-7 py-1 text-xs text-ink-2 focus-input cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed capitalize"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink-3"
              />
            </div>
          </div>
          <div className="flex gap-3 items-center">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="text-xs text-ink-3 hover:text-ink transition-colors px-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="text-xs text-white bg-accent hover:opacity-90 px-3.5 py-1.5 rounded-md font-medium transition-opacity"
                >
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-ink-2 hover:text-ink border border-line hover:bg-bg px-3.5 py-1.5 rounded-md transition-colors font-medium"
              >
                Edit
              </button>
            )}
            <button
              onClick={handleDelete}
              className="text-ink-3 hover:text-red p-1 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Title */}
        {isEditing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-semibold bg-transparent border-none focus:outline-none mb-2 text-ink placeholder:text-ink-3"
            placeholder="Note title..."
          />
        ) : (
          <h1 className="text-2xl font-semibold mb-2 text-ink">{note.title}</h1>
        )}

        {/* Metadata */}
        <div className="text-xs text-ink-3 mb-7 flex items-center gap-2">
          <span>{new Date(note.createdAt).toLocaleDateString()}</span>
          <span>·</span>
          <span>by {note.user.username}</span>
        </div>

        {/* Summary */}
        {isEditing ? (
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Summary..."
            className="w-full p-0 bg-transparent border-none focus:outline-none text-sm text-ink-2 mb-6 resize-none italic placeholder:text-ink-3"
            rows={2}
          />
        ) : (
          note.summary && (
            <p className="text-sm text-ink-2 mb-6 italic border-l-2 border-line pl-4">
              {note.summary}
            </p>
          )
        )}

        {/* Content */}
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3.5 bg-bg border border-line rounded-md focus-input text-sm text-ink mb-8 resize-none min-h-[200px] transition-all placeholder:text-ink-3"
            placeholder="Write your note..."
          />
        ) : (
          <div className="text-sm text-ink-2 whitespace-pre-wrap mb-8 leading-relaxed">
            {note.content}
          </div>
        )}

        {/* Categories & Tags */}
        <div className="flex flex-wrap gap-x-8 gap-y-4 mb-8">
          {/* Categories */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-ink-3 font-medium block">
              Categories
            </span>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((c: Category) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-md hover:bg-bg transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={categoryIds.includes(c.id)}
                      onChange={() =>
                        setCategoryIds((prev: string[]) =>
                          prev.includes(c.id)
                            ? prev.filter((i) => i !== c.id)
                            : [...prev, c.id],
                        )
                      }
                    />
                    <span className="text-xs text-ink-2 select-none">
                      {c.name}
                    </span>
                  </label>
                ))}
                {categories.length === 0 && (
                  <span className="text-xs text-ink-3">None</span>
                )}
              </div>
            ) : (
              <div className="flex gap-1.5 flex-wrap">
                {note.categories?.map(({ category }: any) => (
                  <span
                    key={category.id}
                    className="text-xs text-ink-2 bg-bg px-2 py-0.5 rounded-md border border-line"
                  >
                    {category.name}
                  </span>
                ))}
                {note.categories?.length === 0 && (
                  <span className="text-xs text-ink-3">None</span>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-ink-3 font-medium block">
              Tags
            </span>
            {isEditing ? (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t: Tag) => (
                  <button
                    key={t.id}
                    onClick={() =>
                      setTagIds((prev: string[]) =>
                        prev.includes(t.id)
                          ? prev.filter((i) => i !== t.id)
                          : [...prev, t.id],
                      )
                    }
                    className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                      tagIds.includes(t.id)
                        ? "bg-accent-soft text-accent border border-accent/20"
                        : "bg-bg text-ink-2 border border-line hover:bg-sidebar-hover"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
                {tags.length === 0 && (
                  <span className="text-xs text-ink-3">None</span>
                )}
              </div>
            ) : (
              <div className="flex gap-1.5 flex-wrap">
                {note.tags?.map(({ tag }: any) => (
                  <span
                    key={tag.id}
                    className="text-xs text-ink-2 bg-bg px-2 py-0.5 rounded-md border border-line"
                  >
                    {tag.name}
                  </span>
                ))}
                {note.tags?.length === 0 && (
                  <span className="text-xs text-ink-3">None</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Attachments */}
        <div className="mb-8">
          <h3 className="text-[11px] uppercase tracking-wider text-ink-3 font-medium mb-3">
            Attachments
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {/* Existing Attachments */}
            {(note.attachments || []).map((att: any) => (
              <div
                key={att.id}
                className="relative group border border-line rounded-md overflow-hidden bg-bg"
              >
                {att.mimetype.startsWith("image/") ? (
                  <div
                    onClick={() =>
                      setZoomImage(
                        `http://localhost:3000/storage/${att.filename}`,
                      )
                    }
                    className="cursor-zoom-in w-full h-24 overflow-hidden"
                  >
                    <img
                      src={`http://localhost:3000/storage/${att.filename}`}
                      alt={att.originalName}
                      className="w-full h-24 object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-24 flex flex-col items-center justify-center text-ink-3">
                    <FileText size={24} />
                    <span className="text-[10px] mt-1 uppercase">
                      {att.mimetype.split("/")[1]}
                    </span>
                  </div>
                )}
                <p className="text-[10px] text-ink-3 truncate px-1.5 py-1 bg-surface border-t border-line">
                  {att.originalName}
                </p>
                {isEditing && (
                  <button
                    onClick={() => handleDeleteAttachment(att.id)}
                    className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            ))}

            {/* Temp Attachments */}
            {attachmentPreviews.map((att, i) => (
              <div
                key={i}
                className="relative group border border-accent/30 rounded-md overflow-hidden bg-accent-soft"
              >
                {att.isImage ? (
                  <div
                    onClick={() => setZoomImage(att.url)}
                    className="cursor-zoom-in w-full h-24 overflow-hidden"
                  >
                    <img
                      src={att.url}
                      alt={att.name}
                      className="w-full h-24 object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-24 flex flex-col items-center justify-center text-ink-3">
                    <FileText size={24} />
                  </div>
                )}
                <p className="text-[10px] text-ink-3 truncate px-1.5 py-1 bg-surface border-t border-line">
                  {att.name}
                </p>
                <button
                  onClick={() => handleRemoveTempAttachment(i)}
                  className="absolute top-1.5 right-1.5 bg-red text-white p-1 rounded-full"
                >
                  <X size={10} />
                </button>
              </div>
            ))}

            {isEditing && (
              <label className="w-full h-[120px] border border-dashed border-line flex items-center justify-center cursor-pointer hover:bg-bg hover:border-accent rounded-md text-ink-3 hover:text-accent transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <ImageIcon size={20} />
              </label>
            )}
          </div>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-[11px] uppercase tracking-wider text-ink-3 font-medium mb-3">
            Links
          </h3>

          {isEditing ? (
            <div className="space-y-2.5">
              {urls.map((url, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    value={url.title || ""}
                    onChange={(e) => {
                      const newUrls = [...urls];
                      newUrls[index].title = e.target.value;
                      setUrls(newUrls);
                    }}
                    placeholder="Title"
                    className="w-1/3 px-2.5 py-1.5 bg-bg border border-line rounded-md text-xs text-ink placeholder:text-ink-3 focus-input transition-all"
                  />
                  <input
                    value={url.url}
                    onChange={(e) => {
                      const newUrls = [...urls];
                      newUrls[index].url = e.target.value;
                      setUrls(newUrls);
                    }}
                    placeholder="https://..."
                    className="flex-1 px-2.5 py-1.5 bg-bg border border-line rounded-md text-xs text-ink placeholder:text-ink-3 focus-input transition-all"
                  />
                  <button
                    onClick={() => setUrls(urls.filter((_, i) => i !== index))}
                    className="text-ink-3 hover:text-red p-1 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setUrls([...urls, { title: "", url: "", description: "" }])
                }
                className="text-xs text-ink-2 hover:text-accent flex items-center gap-1 mt-2 transition-colors"
              >
                <Plus size={12} /> Add Link
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {(note.urls || []).map((url: any) => (
                <a
                  key={url.id}
                  href={url.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-accent hover:underline"
                >
                  <LinkIcon size={14} /> {url.title || url.url}
                </a>
              ))}
              {(!note.urls || note.urls.length === 0) && (
                <p className="text-xs text-ink-3">No links added.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
