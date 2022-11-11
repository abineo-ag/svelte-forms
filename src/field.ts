import { writable, type Updater, type Writable, get } from 'svelte/store';
import { getErrors, validateAll, type Validator } from './validator';

export interface FieldState<T> {
	name: string;
	value: T;
	valid: boolean;
	dirty: boolean;
	errors: string[];
}

function isFieldState<T>(value: FieldState<T> | T): value is FieldState<T> {
	return typeof (<FieldState<T>>value).name === 'string';
}

export type Field<T> = Omit<Writable<FieldState<T>>, 'set' | 'update'> & {
	update(this: void, updater: Updater<FieldState<T>>, dirty?: boolean): void;
	set(this: void, value: FieldState<T> | T, dirty?: boolean): void;
	setValid(valid: boolean, dirty?: boolean): void;
	reset: () => void;
	revalidate: (dirty?: boolean) => void;
};

export interface FieldOptions {
	value: any;
	optional: boolean;
}

const defaultFieldOptions = {
	value: null,
	optional: false,
};

function getNewState<T>(
	state: Omit<FieldState<T>, 'errors' | 'valid'>,
	validators: Validator[],
	options: FieldOptions
): FieldState<T> {
	const results = validateAll(state.value, ...validators);
	const allValid = results.every((result) => result.valid);
	return {
		...state,
		errors: getErrors(results),
		valid: allValid || (options.optional && (state.value === '' || !state.value)),
	};
}

export function field<T>(
	name: string,
	validators: Validator[] = [],
	options: Partial<FieldOptions> = {}
): Field<T> {
	const opts: FieldOptions = { ...defaultFieldOptions, ...options };
	const store = writable(
		getNewState({ name, value: opts.value, dirty: false }, validators, opts)
	);

	return {
		subscribe: store.subscribe,
		update: (updater: Updater<FieldState<T>>, dirty: boolean = true) => {
			store.update(updater);
			store.update((state) => {
				return getNewState({ ...state, dirty }, validators, opts);
			});
		},
		set: (state: FieldState<T> | T, dirty: boolean = true) => {
			if (isFieldState(state)) {
				store.set(getNewState({ ...state, dirty }, validators, opts));
			} else {
				store.set(getNewState({ ...get(store), value: <T>state, dirty }, validators, opts));
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
