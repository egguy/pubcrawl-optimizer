import { supabase } from "$lib/supabaseClient";



export async function load() {
	console.log("Loading breweries");
	const { data } = await supabase.from("brewries").select();
	console.log("Breweries loaded", data);
	return {
		breweries: data ?? [],
};
}