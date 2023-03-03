import { writable, type Updater, type Writable, get } from 'svelte/store';
import { getErrors, validateAll, type Validator } from './validator';

export interface FieldState<K extends string, V> {
	name: K;
	value: V;
	initialValue: V;
	valid: boolean;
	dirty: boolean;
	errors: string[];
}

export type Field<K extends string, V> = Omit<Writable<FieldState<K, V>>, 'set' | 'update'> & {
	/**
	 * Update value using callback and inform subscribers.
	 * @param updater callback
	 * @param dirty defaults to `true`
	 */
	update(this: void, updater: Updater<FieldState<K, V>>, dirty?: boolean): void;

	/**
	 * Set value and inform subscribers.
	 * @param value to set
	 * @param dirty defaults to `true`
	 */
	set(this: void, state: FieldState<K, V>, dirty?: boolean): void;

	/**
	 * Set value and inform subscribers.
	 * @param value to set
	 * @param dirty defaults to `true`
	 */
	setValue(value: V, dirty?: boolean): void;

	/**
	 * Update the initial value, which will get used when the fields resets.
	 * @param initialValue to set
	 */
	setInitialValue(initialValue: V): void;

	setValid(valid: boolean): void;
	setDirty(dirty: boolean): void;
	revalidate: () => void;

	/**
	 * Sets `dirty` to `false` and `value` to the initial value or the value provided in `newValue`
	 * @param initialValue to set
	 */
	reset: (newValue?: V) => void;
};

export interface FieldOptions<V> {
	value: V;
	optional: boolean;
	dirty: boolean;
}

const defaultFieldOptions = {
	value: null,
	optional: false,
	dirty: false,
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
		getNewState(
			{ name, value: opts.value, initialValue: opts.value, dirty: opts.dirty },
			validators,
			opts
		)
	);

	return {
		subscribe: store.subscribe,
		update: (updater: Updater<FieldState<K, V>>, dirty: boolean = true) => {
			store.update(updater);
			store.update((state) => {
				return getNewState({ ...state, dirty }, validators, opts);
			});
		},
		set: (state: FieldState<K, V>, dirty: boolean = true) => {
			store.set(getNewState({ ...state, dirty }, validators, opts));
		},
		setValue: (value: V, dirty: boolean = true) => {
			store.set(getNewState({ ...get(store), value, dirty }, validators, opts));
		},
		setInitialValue: (initialValue: V) => {
			store.set(getNewState({ ...get(store), initialValue }, validators, opts));
		},
		setValid: (valid: boolean) => {
			const state = get(store);
			store.set({ ...state, valid });
		},
		setDirty: (dirty: boolean) => {
			const state = get(store);
			store.set({ ...state, dirty });
		},
		reset: (newValue?: V) => {
			const state = get(store);
			let initialValue = state.initialValue;
			if (newValue !== undefined) initialValue = newValue;
			store.set(
				getNewState(
					{ ...state, value: initialValue, initialValue, dirty: false },
					validators,
					opts
				)
			);
		},
		revalidate: () => {
			const state = get(store);
			store.set(getNewState({ ...state }, validators, opts));
		},
	};
}
