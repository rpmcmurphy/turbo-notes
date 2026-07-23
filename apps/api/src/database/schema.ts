import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  pgEnum,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Users & Auth ---
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 50 }).default('local'),
  providerId: varchar('provider_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Notes ---
export const noteStatusEnum = pgEnum('note_status', [
  'draft',
  'published',
  'archived',
]);

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }),
  summary: text('summary'),
  content: text('content'),
  status: noteStatusEnum('status').default('draft').notNull(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Categories ---
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const noteCategories = pgTable(
  'note_categories',
  {
    noteId: uuid('note_id')
      .references(() => notes.id, { onDelete: 'cascade' })
      .notNull(),
    categoryId: uuid('category_id')
      .references(() => categories.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.noteId, t.categoryId] }),
  }),
);

// --- Tags ---
export const tags = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const noteTags = pgTable(
  'note_tags',
  {
    noteId: uuid('note_id')
      .references(() => notes.id, { onDelete: 'cascade' })
      .notNull(),
    tagId: uuid('tag_id')
      .references(() => tags.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.noteId, t.tagId] }),
  }),
);

// --- Attachments ---
export const attachments = pgTable('attachments', {
  id: uuid('id').defaultRandom().primaryKey(),
  noteId: uuid('note_id')
    .references(() => notes.id, { onDelete: 'cascade' })
    .notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimetype: varchar('mimetype', { length: 100 }).notNull(),
  path: varchar('path', { length: 500 }).notNull(),
  size: integer('size').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- URLs ---
export const noteUrls = pgTable('note_urls', {
  id: uuid('id').defaultRandom().primaryKey(),
  noteId: uuid('note_id')
    .references(() => notes.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 255 }),
  url: text('url').notNull(),
  description: text('description'),
});

// --- Relations ---
export const usersRelations = relations(users, ({ many }) => ({
  notes: many(notes),
}));

export const notesRelations = relations(notes, ({ one, many }) => ({
  user: one(users, { fields: [notes.userId], references: [users.id] }),
  updatedByUser: one(users, {
    fields: [notes.updatedBy],
    references: [users.id],
  }),
  categories: many(noteCategories),
  tags: many(noteTags),
  urls: many(noteUrls),
  attachments: many(attachments),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  notes: many(noteCategories),
}));

export const noteCategoriesRelations = relations(noteCategories, ({ one }) => ({
  note: one(notes, { fields: [noteCategories.noteId], references: [notes.id] }),
  category: one(categories, {
    fields: [noteCategories.categoryId],
    references: [categories.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  notes: many(noteTags),
}));

export const noteTagsRelations = relations(noteTags, ({ one }) => ({
  note: one(notes, { fields: [noteTags.noteId], references: [notes.id] }),
  tag: one(tags, { fields: [noteTags.tagId], references: [tags.id] }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  note: one(notes, { fields: [attachments.noteId], references: [notes.id] }),
}));

export const noteUrlsRelations = relations(noteUrls, ({ one }) => ({
  note: one(notes, { fields: [noteUrls.noteId], references: [notes.id] }),
}));
