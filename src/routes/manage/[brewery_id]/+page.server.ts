/** @type {import('./$types').PageLoad} */
export async function load({ depends, locals: { supabase }, params }) {
	depends('supabase:db:brewery');
	const { data } = await supabase
		.from('brewery')
		.select('*, tags(key, value)')
		.match({ id: params.brewery_id })
		.maybeSingle();

	return { brewery: data };
}

/** @type {import('./$types').Actions} */
export const actions = {
	edit: async ({ params, request, locals: { supabase } }) => {
		// update the brewery
		const { brewery_id } = params;

		const data = await request.formData();
		const name = data.get('name');
		const address = data.get('address');
		const phone = data.get('phone');
		const lat = parseFloat(data.get('lat')?.toString() ?? '');
		if (isNaN(lat)) {
			throw new Error('Invalid latitude');
		}
		const lng = parseFloat(data.get('lng')?.toString() ?? '');
		if (isNaN(lng)) {
			throw new Error('Invalid longitude');
		}
		await supabase
			.from('brewery')
			.update({
				name,
				address,
				phone,
				lat,
				lng
			})
			.eq('id', brewery_id);
	},
	addMetadata: async ({ params, request, locals: { supabase } }) => {
		const { brewery_id } = params;

		const data = await request.formData();
		const key = data.get('key');
		const value = data.get('value');
		await supabase.from('tags').insert({ brewery_id, key, value });
	},
	deleteMetadata: async ({ params, request, locals: { supabase } }) => {
		const { brewery_id } = params;
		const data = await request.formData();
		const key = data.get('key');
		await supabase.from('tags').delete().match({ brewery_id, key });
	},
	editMetadata: async ({ params, request, locals: { supabase } }) => {
		const { brewery_id } = params;
		const data = await request.formData();
		const key = data.get('key');
		const value = data.get('value');
		await supabase.from('tags').update({ value }).match({ brewery_id, key });
	}
};
