export async function load({ depends, locals: { supabase } }) {
	depends('supabase:db:brewries');
	const { data } = await supabase.from('brewery').select('*').order('name');

	return { breweries: data };
}
