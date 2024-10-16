
export async function load({ depends, locals: { supabase } }) {
	depends('supabase:db:brewries');
	const {data}  = await supabase
		.from('brewries')
		.select('*')

	return { breweries: data };
}