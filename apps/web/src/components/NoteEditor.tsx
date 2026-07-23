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

  // URL State
  const [urls, setUrls] = useState<any[]>(note.urls || []);

  // Attachment State
  const [tempAttachments, setTempAttachments] = useState<any[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<any[]>([]);

  // Zoom Modal State
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

  return (
    <div className="p-10 max-w-3xl mx-auto bg-white m-6 rounded-lg border border-stone-200 shadow-sm relative">
      {/* Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8 cursor-zoom-out"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            alt="Zoomed"
            className="max-w-full max-h-full object-contain rounded shadow-2xl"
          />
          <button className="absolute top-6 right-6 text-white text-3xl hover:text-stone-300">
            ×
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-8 pb-4 border-b border-stone-100">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          disabled={!isEditing}
          className="text-xs bg-stone-100 border border-stone-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-600 capitalize"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <div className="flex gap-4">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="text-xs text-stone-500 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="text-xs text-white bg-stone-800 hover:bg-stone-700 px-3 py-1 rounded-md"
              >
                Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-stone-600 hover:text-stone-900 border border-stone-200 px-3 py-1 rounded-md hover:bg-stone-50"
            >
              Edit
            </button>
          )}
          <button
            onClick={handleDelete}
            className="text-xs text-stone-400 hover:text-red-500 flex items-center gap-1 px-2"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-semibold bg-transparent border-none focus:outline-none mb-4 text-stone-900"
        />
      ) : (
        <h1 className="text-2xl font-semibold mb-4 text-stone-900">
          {note.title}
        </h1>
      )}

      <div className="text-xs text-stone-400 mb-8 flex items-center gap-2">
        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
        <span>•</span>
        <span>by {note.user.username}</span>
      </div>

      {isEditing ? (
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Summary..."
          className="w-full p-0 bg-transparent border-none focus:outline-none text-sm text-stone-500 mb-4 resize-none italic"
          rows={2}
        />
      ) : (
        note.summary && (
          <p className="text-sm text-stone-500 mb-4 italic border-l-2 border-stone-200 pl-4">
            {note.summary}
          </p>
        )
      )}

      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 bg-stone-50 border border-stone-100 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-300 text-sm text-stone-800 mb-8 resize-none min-h-[200px]"
        />
      ) : (
        <div className="text-sm text-stone-700 whitespace-pre-wrap mb-8 leading-relaxed">
          {note.content}
        </div>
      )}

      {/* Categories & Tags */}
      <div className="flex flex-wrap gap-6 mb-8 text-xs">
        {/* Categories */}
        <div className="flex items-center gap-2">
          <span className="text-stone-400 uppercase tracking-wider">
            Categories:
          </span>
          {isEditing ? (
            <select
              multiple
              value={categoryIds}
              onChange={(e) =>
                setCategoryIds(
                  Array.from(e.target.selectedOptions).map((o) => o.value),
                )
              }
              className="bg-stone-50 border border-stone-200 p-1 rounded-md text-stone-700"
            >
              {categories.map((c: Category) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {note.categories?.map(({ category }: any) => (
                <span
                  key={category.id}
                  className="text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200"
                >
                  {category.name}
                </span>
              ))}
              {note.categories?.length === 0 && (
                <span className="text-stone-400">None</span>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2">
          <span className="text-stone-400 uppercase tracking-wider">Tags:</span>
          {isEditing ? (
            <select
              multiple
              value={tagIds}
              onChange={(e) =>
                setTagIds(
                  Array.from(e.target.selectedOptions).map((o) => o.value),
                )
              }
              className="bg-stone-50 border border-stone-200 p-1 rounded-md text-stone-700"
            >
              {tags.map((t: Tag) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {note.tags?.map(({ tag }: any) => (
                <span
                  key={tag.id}
                  className="text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200"
                >
                  {tag.name}
                </span>
              ))}
              {note.tags?.length === 0 && (
                <span className="text-stone-400">None</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Attachments */}
      <div className="mb-8">
        <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-3">
          Attachments
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {/* Existing Attachments */}
          {(note.attachments || []).map((att: any) => (
            <div
              key={att.id}
              className="relative group border border-stone-200 rounded-md overflow-hidden bg-stone-50"
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
                <div className="w-full h-24 flex flex-col items-center justify-center text-stone-400">
                  <FileText size={24} />
                  <span className="text-[10px] mt-1 uppercase">
                    {att.mimetype.split("/")[1]}
                  </span>
                </div>
              )}
              <p className="text-[10px] text-stone-500 truncate p-1 bg-white border-t border-stone-100">
                {att.originalName}
              </p>
              {isEditing && (
                <button
                  onClick={() => handleDeleteAttachment(att.id)}
                  className="absolute top-1 right-1 bg-stone-900/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
              className="relative group border border-blue-200 rounded-md overflow-hidden bg-blue-50"
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
                <div className="w-full h-24 flex flex-col items-center justify-center text-stone-400">
                  <FileText size={24} />
                </div>
              )}
              <p className="text-[10px] text-stone-500 truncate p-1 bg-white border-t border-stone-100">
                {att.name}
              </p>
              <button
                onClick={() => handleRemoveTempAttachment(i)}
                className="absolute top-1 right-1 bg-red-500/70 text-white p-1 rounded-full"
              >
                <X size={10} />
              </button>
            </div>
          ))}

          {isEditing && (
            <label className="w-full h-[120px] border border-dashed border-stone-300 flex items-center justify-center cursor-pointer hover:bg-stone-50 rounded-md text-stone-400 hover:text-stone-500">
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

      {/* URLs */}
      <div className="mb-8">
        <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-3">
          Links
        </h3>

        {isEditing ? (
          <div className="space-y-3">
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
                  className="w-1/3 px-2 py-1 bg-stone-50 border border-stone-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-stone-300"
                />
                <input
                  value={url.url}
                  onChange={(e) => {
                    const newUrls = [...urls];
                    newUrls[index].url = e.target.value;
                    setUrls(newUrls);
                  }}
                  placeholder="https://..."
                  className="flex-1 px-2 py-1 bg-stone-50 border border-stone-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-stone-300"
                />
                <button
                  onClick={() => setUrls(urls.filter((_, i) => i !== index))}
                  className="text-stone-400 hover:text-red-500 p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                setUrls([...urls, { title: "", url: "", description: "" }])
              }
              className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 mt-2"
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
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                <LinkIcon size={14} /> {url.title || url.url}
              </a>
            ))}
            {(!note.urls || note.urls.length === 0) && (
              <p className="text-xs text-stone-400">No links added.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
