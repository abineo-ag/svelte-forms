import type { Field } from './field';

export function fieldState<K extends string, V>(
	node: Pick<HTMLElement, 'classList'>,
	params: { field: Field<K, V>; dirty?: string; valid?: string; invalid?: string }
) {
	let unsubscribe = () => {};
	const update = (params: {
		field: Field<K, V>;
		dirty?: string;
		valid?: string;
		invalid?: string;
	}) => {
		unsubscribe();
		unsubscribe = params.field.subscribe((state) => {
			if (state.dirty) node.classList.add(params.dirty || 'dirty');
			else node.classList.remove(params.dirty || 'dirty');
			if (state.valid) {
				node.classList.add(params.valid || 'valid');
				node.classList.remove(params.invalid || 'invalid');
			} else {
				node.classList.add(params.invalid || 'invalid');
				node.classList.remove(params.valid || 'valid');
			}
		});
	};
	update(params);
	return { update, destroy: unsubscribe };
}
