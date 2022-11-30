import { derived, get, type Readable } from 'svelte/store';
import type { Field } from './field';

type FieldListToRecord<List extends Field<any, any>[], O extends {} = {}> = List extends [
	infer F extends Field<any, any>,
	...infer L extends Field<any, any>[]
]
	? FieldListToRecord<L, O & (F extends Field<infer K, infer V> ? { [k in K]: V } : never)>
	: { [K in keyof O]: O[K] };

export interface Form<T extends Field<any, any>[]> {
	valid: boolean;
	dirty: boolean;
	errors: object;
	data: FieldListToRecord<T>;
}

export function form<T extends Field<any, any>[]>(
	...fields: T
): Readable<Form<T>> & {
	reset: () => void;
	revalidate: (dirty?: boolean) => void;
} {
	const store = derived(fields, ([_]) => {
		const _fields = fields.map((field) => get(field));
		const data = Object.fromEntries(_fields.map(({ name, value }) => [name, value]));
		const errors = Object.fromEntries(_fields.map(({ name, errors }) => [name, errors]));
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
