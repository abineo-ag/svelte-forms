import { field } from '../src';
import { get } from 'svelte/store';

describe('field', () => {
	it('is created as expected', () => {
		const name = 'foo';
		const sut = field(name);

		expect(get(sut).name).toEqual(name);
		expect(get(sut).valid).toEqual(true);
		expect(get(sut).dirty).toEqual(false);
		expect(get(sut).errors).toStrictEqual([]);
	});

	it.todo('is awesome');
});
