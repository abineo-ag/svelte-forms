import { derived, get, type Readable } from 'svelte/store';
import type { Field } from './field';

export interface Form {
	valid: boolean;
	dirty: boolean;
	errors: object;
	data: object; // FIXME: i need a proper type
}

export function form(...fields: Field<any>[]): Readable<Form> & {
	reset: () => void;
	revalidate: (dirty?: boolean) => void;
} {
	const store = derived(fields, ([_]) => {
		const _fields = fields.map((field) => get(field));
		const data = {};
		const errors = {};
		_fields.forEach((field) => {
			data[field.name] = field.value;
			errors[field.name] = field.errors;
		});
		return {
			valid: _fields.every((field) => field.valid),
			dirty: _fields.some((field) => field.dirty),
			errors,
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
