
/** @type {import('./$types').PageLoad} */
export async function load({ depends, locals: { supabase }, params }) {
	depends('supabase:db:brewries');
	const { data, error } = await supabase
		.from('brewries')
		.select('*')
		.match({ id: params.brewery_id })
		.maybeSingle();
	// console.log(data);

	return { brewery: data };
}

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ params, request, locals: { supabase } }) => {
		// update the brewery
		const { brewery_id } = params;
		// console.log(event)
		const data = await request.formData();
		const name = data.get('name');
		const address = data.get('address');
		const phone = data.get('phone');
		const lat = parseFloat(data.get('lat')?.toString()??'');
		if (isNaN(lat)) {
			throw new Error("Invalid latitude");
		}
		const lng = parseFloat(data.get('lng')?.toString()??'');
		if (isNaN(lng)) {
			throw new Error("Invalid longitude");
		}
		// console.log()
		console.log(brewery_id, name)
		const result = await supabase
			.from('brewries')
			.update({
				name,
				address,
				phone,
				lat,
				lng
			})
			.eq("id", brewery_id);
		console.log(result);
	}
};
