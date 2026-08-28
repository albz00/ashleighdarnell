import type { MediaContent } from './page-content';

export function photoFilters(photo: MediaContent, categories: string[]) {
	if (photo.metadata?.filters?.length) return photo.metadata.filters;

	const searchable = `${photo.alt} ${photo.caption ?? ''} ${photo.metadata?.setName ?? ''}`.toLowerCase();
	return categories.filter((category) => {
		if (category === 'All') return false;
		const normalized = category.toLowerCase().replace(/s$/, '');
		if (searchable.includes(normalized)) return true;
		if (normalized === 'landscape') {
			return /(mountain|lake|forest|desert|appalachia|water|woods)/.test(searchable);
		}
		if (normalized === 'lifestyle') return /(editorial|road|travel|lifestyle)/.test(searchable);
		return false;
	});
}
