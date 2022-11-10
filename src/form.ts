import { derived, get, type Readable } from 'svelte/store';
import type { Field } from './field';

export interface Form {
	valid: boolean;
	dirty: boolean;
	errors: string[];
	data: object;
}

export function form(...fields: Field<any>[]): Readable<Form> & {
	reset: () => void;
	revalidate: (dirty?: boolean) => void;
} {
	const store = derived(fields, ([_]) => {
		const data = {};
		fields
			.map((field) => get(field))
			.forEach((field) => {
				// @ts-ignore // error: ts(7053)
				data[field.name] = field.value;
			});
		return {
			valid: fields.every((field) => get(field).valid),
			dirty: fields.some((field) => get(field).dirty),
			errors: fields.map((field) => get(field).errors).flat(),
			data,
		};
	});
	return {
		...store,
		reset: () => {
			fields.forEach((field) => field.reset());
		},
		revalidate: (dirty?: boolean) => {
			fields.forEach((field) => field.revalidate(dirty));
		},
	};
}
