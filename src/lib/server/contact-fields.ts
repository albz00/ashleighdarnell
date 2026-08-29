import {
	defaultPageContent,
	normalizePageContent,
	type ContactCustomField,
	type PageContent
} from '$lib/content/page-content';

const CONTENT_DOCUMENT =
	'https://firestore.googleapis.com/v1/projects/ashleighdarnell/databases/(default)/documents/site/content?key=AIzaSyAHDC1UF9pWyI8sxiPQQ6MMSRvQY61sW8A';

type FirestoreValue = {
	nullValue?: null;
	booleanValue?: boolean;
	integerValue?: string;
	doubleValue?: number;
	stringValue?: string;
	arrayValue?: { values?: FirestoreValue[] };
	mapValue?: { fields?: Record<string, FirestoreValue> };
};

function decodeValue(value: FirestoreValue): unknown {
	if ('nullValue' in value) return null;
	if ('booleanValue' in value) return value.booleanValue;
	if ('integerValue' in value) return Number(value.integerValue);
	if ('doubleValue' in value) return value.doubleValue;
	if ('stringValue' in value) return value.stringValue;
	if ('arrayValue' in value) return (value.arrayValue?.values ?? []).map(decodeValue);
	if ('mapValue' in value) {
		return Object.fromEntries(
			Object.entries(value.mapValue?.fields ?? {}).map(([key, child]) => [
				key,
				decodeValue(child)
			])
		);
	}
	return undefined;
}

export async function loadContactFields(): Promise<ContactCustomField[]> {
	try {
		const response = await fetch(CONTENT_DOCUMENT);
		if (!response.ok) throw new Error(`Firestore returned ${response.status}.`);
		const document = (await response.json()) as {
			fields?: Record<string, FirestoreValue>;
		};
		const contentValue = document.fields?.value;
		if (!contentValue) throw new Error('The content document has no value.');
		const content = decodeValue(contentValue) as PageContent;
		return normalizePageContent(content).contact.fields;
	} catch (error) {
		console.error('Contact field configuration could not be loaded.', error);
		return structuredClone(defaultPageContent.contact.fields);
	}
}
