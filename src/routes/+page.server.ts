import { supabase } from '$lib/supabaseClient';

export async function load() {
	const { data } = await supabase.from('brewries').select();
	return {
		breweries: data ?? []
	};
}
