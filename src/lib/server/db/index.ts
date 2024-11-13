import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';

if (building) {
	env.DATABASE_URL = ':memory:';
}
if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
const client = createClient({ url: env.DATABASE_URL });
export const db = drizzle(client);
