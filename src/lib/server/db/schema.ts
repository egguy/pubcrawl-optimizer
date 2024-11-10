import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';

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
