import { get } from 'svelte/store';
import { field, form, err, required } from '../src';

describe('form', () => {
	it('returns values of fields', () => {
		const value = 'bar';
		const foo = field('foo', [], { value });
		const sut = form(foo);
		expect(get(sut).data.foo).toEqual(value);
	});

	it('returns errors of fields', () => {
		const error = 'bar';
		const foo = field('foo', [() => err(error)]);
		const sut = form(foo);
		expect(get(sut).errors).toEqual({ foo: [error] });
	});

	it('reflects validity of fields', () => {
		const invalid = field('', [required()]);
		const valid = field('');
		const sut = form(invalid, valid);

		expect(get(sut).valid).toEqual(false);

		invalid.set('foo');

		expect(get(sut).valid).toEqual(true);

		sut.revalidate();

		expect(get(sut).valid).toEqual(true);
	});

	it('reflects state of fields', () => {
		const foo = field('');
		const sut = form(foo);

		expect(get(sut).dirty).toEqual(false);

		foo.set('foo');

		expect(get(sut).dirty).toEqual(true);

		sut.reset();

		expect(get(sut).dirty).toEqual(false);
	});
});
