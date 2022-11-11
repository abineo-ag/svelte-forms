import { field as _field, Field, fieldState, min } from '../src';
import { NodeMock } from './classListMock';

describe('fieldState', () => {
	let node: NodeMock;
	let field: Field<string>;

	beforeEach(() => {
		node = new NodeMock();
		field = _field('foo', [min(3)], { value: 'bar' });
	});

	it('adds and removes default class names', () => {
		const { destroy } = fieldState(node, { field });

		expect(node.classList.contains('valid')).toEqual(true);
		expect(node.classList.contains('invalid')).toEqual(false);
		expect(node.classList.contains('dirty')).toEqual(false);

		field.set('x');

		expect(node.classList.contains('valid')).toEqual(false);
		expect(node.classList.contains('invalid')).toEqual(true);
		expect(node.classList.contains('dirty')).toEqual(true);

		destroy();
	});
});
