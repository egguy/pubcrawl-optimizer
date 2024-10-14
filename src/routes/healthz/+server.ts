import { text } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	return text('OK');
}