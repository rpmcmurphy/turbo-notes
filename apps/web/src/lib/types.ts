export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  path: string;
}

export interface NoteUrl {
  id: string;
  title?: string;
  url: string;
  description?: string;
}

export interface Note {
  id: string;
  title: string;
  slug?: string;
  summary?: string;
  content?: string;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  user: User;
  categories: { category: Category }[];
  tags: { tag: Tag }[];
  attachments: Attachment[];
  urls: NoteUrl[];
}
