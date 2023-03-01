import { field, err, min, not } from '../src';
import { get } from 'svelte/store';

describe('field', () => {
	it('is created as expected', () => {
		const name = 'sute';
		const sut = field(name);

		expect(get(sut).name).toEqual(name);
		expect(get(sut).valid).toEqual(true);
		expect(get(sut).dirty).toEqual(false);
		expect(get(sut).errors).toStrictEqual([]);
	});

	it('can have a initial value', () => {
		const value = 'alice';
		const sut = field('sut', [], { value });

		expect(get(sut).value).toEqual(value);
	});

	it('can have a number as value', () => {
		const value = 5;
		const sut = field('sut', [], { value });

		expect(get(sut).value).toStrictEqual(value);
	});

	it('can have a object as value', () => {
		const value = { bar: 'baz', i: 3 };
		const sut = field('sut', [], { value });

		expect(get(sut).value).toStrictEqual(value);
	});

	it('gets marked as dirty on update', () => {
		const sut = field('sut', [], { value: '' });
		sut.update((state) => {
			return { ...state, value: 'bob' };
		});

		expect(get(sut).dirty).toEqual(true);
	});

	it('gets marked as dirty on set', () => {
		const sut = field('sut', [], { value: '' });
		sut.set('bob');

		expect(get(sut).dirty).toEqual(true);
	});

	it('gets marked as not dirty on reset', () => {
		const sut = field('sut', [], { value: 'alice' });
		sut.set('bob');
		sut.reset();

		expect(get(sut).dirty).toEqual(false);
		expect(get(sut).value).toEqual('alice');
	});

	it('can have new initial value on reset', () => {
		const sut = field('sut', [], { value: 'alice' });
		sut.reset('bob');

		expect(get(sut).value).toEqual('bob');
	});

	it('is validated on init', () => {
		const sut = field('sut', [min(2)], { value: 1 });

		expect(get(sut).valid).toEqual(false);
	});

	it('can be forced to be (in)valid without getting marked as dirty', () => {
		const sut = field('sut', [min(2)], { value: 1 });
		sut.setValid(true);

		expect(get(sut).valid).toEqual(true);
		expect(get(sut).dirty).toEqual(false);

		sut.setValid(false);

		expect(get(sut).valid).toEqual(false);
		expect(get(sut).dirty).toEqual(false);
	});

	it('can be forced to revalidate without getting marked as dirty', () => {
		const sut = field('sut');
		sut.revalidate();

		expect(get(sut).dirty).toEqual(false);
	});

	it('returns errors passed to validator', () => {
		const error = 'test';
		const sut = field('sut', [() => err(error)]);

		expect(get(sut).errors).toStrictEqual([error]);
	});

	it('returns errors as flat array', () => {
		const error = 'notch';
		const sut = field('sut', [not(not(() => err(error)))]);

		expect(get(sut).errors).toStrictEqual([error]);
	});

	it('returns error but remains valid if optional', () => {
		const error = 'test';
		const sut = field('sut', [() => err(error)], { optional: true });

		expect(get(sut).valid).toEqual(true);
		expect(get(sut).errors).toStrictEqual([error]);
	});
});
