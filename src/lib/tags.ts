// Define the type for tag details
type TagDetails = {
	icon: string;
	name: string;
};
/**
 * Map of display tags used in the brewery route planner
 * Icons are sourced from:
 * - MDI (Material Design Icons)
 * - Iconoir
 * - HugeIcons
 * - Material Symbols
 */

export const displayTags: Readonly<Map<string, TagDetails>> = Object.freeze(
	new Map([
		['food', { icon: 'mdi:food', name: 'Food' }],
		['beer', { icon: 'mdi:beer', name: 'Beer' }],
		['wifi', { icon: 'mdi:wifi', name: 'Wifi' }],
		['dog', { icon: 'mdi:dog', name: 'Dog' }],
		['vegan', { icon: 'iconoir:vegan', name: 'Vegan' }],
		['vegetarian', { icon: 'hugeicons:vegetarian-food', name: 'Vegetarian' }],
		['music', { icon: 'material-symbols:artist', name: 'Music' }]
	])
);
