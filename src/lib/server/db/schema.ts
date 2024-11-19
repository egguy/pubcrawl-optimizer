import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const brewery = sqliteTable('brewery', {
	id: integer('id').primaryKey(),
	createdAt: integer('created_at', { mode: 'timestamp' }),
	name: text('name').notNull(),
	address: text('address'),
	lng: real('lng').notNull(),
	lat: real('lat').notNull(),
	phone: text('phone'),
	active: integer('active', { mode: 'boolean' })
});

export type SelectBrewery = typeof brewery.$inferSelect;
export type InsertBrewery = typeof brewery.$inferInsert;

export const breweryRelations = relations(brewery, ({ many }) => ({
	tags: many(tags)
}));

export const tags = sqliteTable(
	'tags',
	{
		brewery: integer('brewery')
			.references(() => brewery.id)
			.notNull(),
		key: text('key').notNull(),
		value: text('value').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' })
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.brewery, table.key] })
		};
	}
);

export const tagRelations = relations(tags, ({ one }) => ({
	brewery: one(brewery, {
		fields: [tags.brewery],
		references: [brewery.id]
	})
}));

export type SelectTags = typeof tags.$inferSelect;
export type InsertTags = typeof tags.$inferInsert;
