import { writable, type Updater, type Writable, get } from 'svelte/store';
import { getErrors, validateAll, type Validator } from './validator';

export interface FieldState<K extends string, V> {
	name: K;
	value: V;
	valid: boolean;
	dirty: boolean;
	errors: string[];
}

function isFieldState<K extends string, V>(value: FieldState<K, V> | V): value is FieldState<K, V> {
	return typeof (<FieldState<K, V>>value).name === 'string';
}

export type Field<K extends string, V> = Omit<Writable<FieldState<K, V>>, 'set' | 'update'> & {
	update(this: void, updater: Updater<FieldState<K, V>>, dirty?: boolean): void;
	set(this: void, value: FieldState<K, V> | V, dirty?: boolean): void;
	setValid(valid: boolean, dirty?: boolean): void;
	reset: () => void;
	revalidate: (dirty?: boolean) => void;
};

export interface FieldOptions<V> {
	value: V;
	optional: boolean;
}

const defaultFieldOptions = {
	value: null,
	optional: false,
};

function getNewState<K extends string, V>(
	state: Omit<FieldState<K, V>, 'errors' | 'valid'>,
	validators: Validator[],
	options: FieldOptions<V>
): FieldState<K, V> {
	const results = validateAll(state.value, ...validators);
	const allValid = results.every((result) => result.valid);
	return {
		...state,
		errors: getErrors(results),
		valid: allValid || (options.optional && (state.value === '' || !state.value)),
	};
}

export function field<K extends string, V>(
	name: K,
	validators: Validator[] = [],
	options: Partial<FieldOptions<V>> = {}
): Field<K, V> {
	const opts: FieldOptions<V> = { ...defaultFieldOptions, ...options };
	const store = writable(
		getNewState({ name, value: opts.value, dirty: false }, validators, opts)
	);

	return {
		subscribe: store.subscribe,
		update: (updater: Updater<FieldState<K, V>>, dirty: boolean = true) => {
			store.update(updater);
			store.update((state) => {
				return getNewState({ ...state, dirty }, validators, opts);
			});
		},
		set: (state: FieldState<K, V> | V, dirty: boolean = true) => {
			if (isFieldState(state)) {
				store.set(getNewState({ ...state, dirty }, validators, opts));
			} else {
				store.set(getNewState({ ...get(store), value: <V>state, dirty }, validators, opts));
			}
		},
		setValid: (valid: boolean, dirty?: boolean) => {
			const state = get(store);
			store.set({ ...state, valid, dirty: dirty || state.dirty });
		},
		reset: () => {
			store.set(
				getNewState({ ...get(store), value: opts.value, dirty: false }, validators, opts)
			);
		},
		revalidate: (dirty?: boolean) => {
			const state = get(store);
			store.set(getNewState({ ...state, dirty: dirty || state.dirty }, validators, opts));
		},
	};
}
