import { field as _field, Field, fieldState, min } from '../src';
import { NodeMock } from './classListMock';

describe('fieldState', () => {
	let node: NodeMock;
	let field: Field<string, string>;

	beforeEach(() => {
		node = new NodeMock();
		field = _field('foo', [min(3)], { value: 'bar' });
	});

	it('adds and removes default class names', () => {
		const valid = 'valid';
		const invalid = 'invalid';
		const dirty = 'dirty';
		const { destroy } = fieldState(node, { field });

		expect(node.classList.contains(valid)).toEqual(true);
		expect(node.classList.contains(invalid)).toEqual(false);
		expect(node.classList.contains(dirty)).toEqual(false);

		field.setValue('x');

		expect(node.classList.contains(valid)).toEqual(false);
		expect(node.classList.contains(invalid)).toEqual(true);
		expect(node.classList.contains(dirty)).toEqual(true);

		destroy();
	});

	it('adds and removes custom class names', () => {
		const valid = 'alice';
		const invalid = 'bob';
		const dirty = 'carl';
		const { destroy } = fieldState(node, { field, valid, invalid, dirty });

		expect(node.classList.contains(valid)).toEqual(true);
		expect(node.classList.contains(invalid)).toEqual(false);
		expect(node.classList.contains(dirty)).toEqual(false);

		field.setValue('x');

		expect(node.classList.contains(valid)).toEqual(false);
		expect(node.classList.contains(invalid)).toEqual(true);
		expect(node.classList.contains(dirty)).toEqual(true);

		destroy();
	});
});
