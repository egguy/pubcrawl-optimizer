import { supabase } from '$lib/supabaseClient';

export async function load() {
	const { data } = await supabase.from('brewery').select().eq('active', true).order('name');
	return {
		breweries: data ?? []
	};
}
