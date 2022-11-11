import {
	ok,
	err,
	validateAll,
	getErrors,
	required,
	min,
	max,
	range,
	size,
	eq,
	field,
	eqField,
	email,
	regex,
	not,
	all,
	any,
	none,
	either,
	ValidationType,
} from '../src';

describe('validator', () => {
	it('can call ok with no args', () => {
		const sut = ok();
		expect(sut.type).toEqual('error');
		expect(sut.valid).toEqual(true);
		expect(sut.inner).toStrictEqual([]);
		expect(sut.inv().valid).toEqual(false);
	});

	it('can call err with no args', () => {
		const sut = err();
		expect(sut.type).toEqual('error');
		expect(sut.valid).toEqual(false);
		expect(sut.inner).toStrictEqual([]);
		expect(sut.inv().valid).toEqual(true);
	});

	it('can call err and ok args', () => {
		const sutOk = ok('foo', [ok('inner')]);
		const sutErr = err('bar', [err('inner')]);
		expect(sutOk.type).toEqual('foo');
		expect(sutOk.inner[0].type).toEqual('inner');
		expect(sutErr.type).toEqual('bar');
		expect(sutErr.inner[0].type).toEqual('inner');
	});

	it('flat() returns self and inner errors', () => {
		const innerOk = ok('inner-ok');
		const innerErr = ok('inner-err');
		const sut = err('outer');
		sut.inner = [innerOk, innerErr];
		const actual = sut.flat();
		const expected = [sut, innerOk, innerErr];
		expect(actual).toStrictEqual(expected);
	});

	it('flat() can resolve deep nested in correct order', () => {
		const sut = err('', [err('', [err('', [err('', [ok('last')])])])]);
		const actual = sut.flat();

		expect(actual.length).toEqual(5);
		expect(actual[4].type).toEqual('last');
		expect(actual[4].valid).toEqual(true);
	});

	it('validateAll() can resolve deep nested in correct order', () => {
		const result = err('', [err('', [err('', [err('', [ok('last')])])])]);
		const actual = validateAll(1, () => result);

		expect(actual.length).toEqual(5);
		expect(actual[4].type).toEqual('last');
		expect(actual[4].valid).toEqual(true);
	});

	it('getErrors() returns errors as string in correct order', () => {
		const results = [err('one'), err('two'), ok('three'), err('four'), ok('five')];
		const actual = getErrors(results);

		expect(actual).toStrictEqual(['one', 'two', 'four']);
	});

	it('all validators return a valid default result type', () => {
		expect(required()(true).type).toEqual(ValidationType.Required);
		expect(required()(false).type).toEqual(ValidationType.Required);
		expect(min(2)(3).type).toEqual(ValidationType.Min);
		expect(min(2)(1).type).toEqual(ValidationType.Min);
		expect(max(2)(1).type).toEqual(ValidationType.Max);
		expect(max(2)(2).type).toEqual(ValidationType.Max);
		expect(range(0, 2)(1).type).toEqual(ValidationType.Range);
		expect(range(0, 2)(6).type).toEqual(ValidationType.Range);
		expect(size(1)([1]).type).toEqual(ValidationType.Size);
		expect(size(1)([1, 2]).type).toEqual(ValidationType.Size);
		expect(eq(1)(1).type).toEqual(ValidationType.Equal);
		expect(eq(1)(2).type).toEqual(ValidationType.Equal);
		expect(eqField(field('', [], { value: 1 }))(1).type).toEqual(ValidationType.Equal);
		expect(eqField(field('', [], { value: 2 }))(1).type).toEqual(ValidationType.Equal);
		expect(email()('ab@cd.ef').type).toEqual(ValidationType.Email);
		expect(email()('abcdef').type).toEqual(ValidationType.Email);
		expect(regex(/abc/)('abc').type).toEqual(ValidationType.Regex);
		expect(regex(/abc/)('def').type).toEqual(ValidationType.Regex);
		expect(not(eq(1))(2).type).toEqual(ValidationType.Equal);
		expect(not(eq(1))(1).type).toEqual(ValidationType.Equal);
		expect(all(eq(1))(1).type).toEqual(ValidationType.All);
		expect(all(eq(1))(2).type).toEqual(ValidationType.All);
		expect(any(eq(1))(1).type).toEqual(ValidationType.Any);
		expect(any(eq(1))(2).type).toEqual(ValidationType.Any);
		expect(none(eq(1))(2).type).toEqual(ValidationType.None);
		expect(none(eq(1))(1).type).toEqual(ValidationType.None);
		expect(either(eq(1), eq(2))(2).type).toEqual(ValidationType.Either);
		expect(either(eq(2), eq(2))(2).type).toEqual(ValidationType.Either);
	});

	it('all validators return the error given at init', () => {
		expect(required('foo')(true).type).toEqual('foo');
		expect(required('foo')(false).type).toEqual('foo');
		expect(min(2, 'foo')(3).type).toEqual('foo');
		expect(min(2, 'foo')(1).type).toEqual('foo');
		expect(max(2, 'foo')(1).type).toEqual('foo');
		expect(max(2, 'foo')(2).type).toEqual('foo');
		expect(range(0, 2, 'foo')(1).type).toEqual('foo');
		expect(range(0, 2, 'foo')(6).type).toEqual('foo');
		expect(size(1, 'foo')([1]).type).toEqual('foo');
		expect(size(1, 'foo')([1, 2]).type).toEqual('foo');
		expect(eq(1, 'foo')(1).type).toEqual('foo');
		expect(eq(1, 'foo')(2).type).toEqual('foo');
		expect(eqField(field('', [], { value: 1 }), 'foo')(1).type).toEqual('foo');
		expect(eqField(field('', [], { value: 2 }), 'foo')(1).type).toEqual('foo');
		expect(email('foo')('ab@cd.ef').type).toEqual('foo');
		expect(email('foo')('abcdef').type).toEqual('foo');
		expect(regex(/abc/, 'foo')('abc').type).toEqual('foo');
		expect(regex(/abc/, 'foo')('def').type).toEqual('foo');
		expect(not(eq(1, 'foo'))(2).type).toEqual('foo');
		expect(not(eq(1, 'foo'))(1).type).toEqual('foo');
		expect(all(eq(1, 'foo'))(1).inner[0].type).toEqual('foo');
		expect(all(eq(1, 'foo'))(2).inner[0].type).toEqual('foo');
		expect(any(eq(1, 'foo'))(1).inner[0].type).toEqual('foo');
		expect(any(eq(1, 'foo'))(2).inner[0].type).toEqual('foo');
		expect(none(eq(1, 'foo'))(2).inner[0].type).toEqual('foo');
		expect(none(eq(1, 'foo'))(1).inner[0].type).toEqual('foo');
		expect(either(eq(1, 'foo'), eq(2, 'foo'))(2).inner[0].type).toEqual('foo');
		expect(either(eq(2, 'foo'), eq(2, 'foo'))(2).inner[0].type).toEqual('foo');
	});

	it('required() works as expected', () => {
		expect(required()(true).valid).toEqual(true);
		expect(required()(false).valid).toEqual(false);
		expect(required()(null).valid).toEqual(false);
		expect(required()(undefined).valid).toEqual(false);
		expect(required()('').valid).toEqual(false);
		expect(required()('foo').valid).toEqual(true);
		expect(required()(0).valid).toEqual(false);
		expect(required()(1).valid).toEqual(true);
		expect(required()(-1).valid).toEqual(true);
		expect(required()({}).valid).toEqual(true);
		expect(required()([]).valid).toEqual(false);
		expect(required()([1]).valid).toEqual(true);
	});

	it('min() works as expected', () => {
		expect(min(1)(1).valid).toEqual(true);
		expect(min(2)(1).valid).toEqual(false);
		expect(min(1)(2).valid).toEqual(true);
		expect(min(-1)(2).valid).toEqual(true);
		expect(min(-1)(-2).valid).toEqual(false);
		expect(min(-2)(-1).valid).toEqual(true);
		expect(min(2)([1, 2, 3]).valid).toEqual(true);
		expect(min(2)([1, 2]).valid).toEqual(true);
		expect(min(2)([1]).valid).toEqual(false);
		expect(min(-2)([1]).valid).toEqual(true);
		expect(min(2)('1').valid).toEqual(false);
		expect(min(2)('12').valid).toEqual(true);
		expect(min(2)('123').valid).toEqual(true);
		expect(min(-1)('123').valid).toEqual(true);
		expect(min(1)('   ').valid).toEqual(false);
		expect(min(2)('5').valid).toEqual(false);
		expect(min(1)({}).valid).toEqual(false);
		// @ts-ignore
		expect(min(null)(1).valid).toEqual(true);
		// @ts-ignore
		expect(min(undefined)(1).valid).toEqual(false);
		expect(min(0)(null).valid).toEqual(true);
		expect(min(1)(null).valid).toEqual(false);
		expect(min(0)(undefined).valid).toEqual(true);
		expect(min(1)(undefined).valid).toEqual(false);
	});

	it('max() works as expected', () => {
		expect(max(1)(1).valid).toEqual(true);
		expect(max(2)(1).valid).toEqual(true);
		expect(max(1)(2).valid).toEqual(false);
		expect(max(-1)(-2).valid).toEqual(true);
		expect(max(1)('1').valid).toEqual(true);
		expect(max(1)('5').valid).toEqual(true);
		expect(max(1)('00').valid).toEqual(false);
		expect(max(3)('   123   ').valid).toEqual(true);
		expect(max(3)('   1 23   ').valid).toEqual(false);
		expect(max(0)([]).valid).toEqual(true);
		expect(max(1)([1]).valid).toEqual(true);
		expect(max(1)([1, 2]).valid).toEqual(false);
		expect(max(2)([1]).valid).toEqual(true);
		expect(max(-1)([]).valid).toEqual(false);
		// @ts-ignore
		expect(max(null)(0).valid).toEqual(true);
		// @ts-ignore
		expect(max(undefined)(0).valid).toEqual(false);
		expect(max(0)(null).valid).toEqual(true);
		expect(max(1)(null).valid).toEqual(true);
		expect(max(-1)(undefined).valid).toEqual(false);
		expect(max(0)(undefined).valid).toEqual(true);
	});

	it('range() works as expected', () => {
		expect(range(0, 0)(0).valid).toEqual(true);
		expect(range(1, 10)(0).valid).toEqual(false);
		expect(range(1, 10)(11).valid).toEqual(false);
		expect(range(1, 10)(5).valid).toEqual(true);
		expect(range(1, 2)('').valid).toEqual(false);
		expect(range(1, 2)('0').valid).toEqual(true);
		expect(range(1, 2)('000').valid).toEqual(false);
		expect(range(1, 2)([]).valid).toEqual(false);
		expect(range(1, 2)([5]).valid).toEqual(true);
		expect(range(1, 2)([5, 5, 5]).valid).toEqual(false);
		expect(range(1, 2)({}).valid).toEqual(false);
		expect(range(-1, 2)({}).valid).toEqual(true);
	});

	it('size() works as expected', () => {
		expect(size(0)(0).valid).toEqual(true);
		expect(size(5)(5).valid).toEqual(true);
		expect(size(0)(null).valid).toEqual(true);
		expect(size(0)(undefined).valid).toEqual(true);
		expect(size(0)({}).valid).toEqual(true);
		expect(size(0)([]).valid).toEqual(true);
		expect(size(1)([]).valid).toEqual(false);
		expect(size(0)([1]).valid).toEqual(false);
		expect(size(0)('').valid).toEqual(true);
		expect(size(0)('   ').valid).toEqual(true);
		expect(size(1)('  x  ').valid).toEqual(true);
		// @ts-ignore
		expect(size(null)(null).valid).toEqual(false);
	});

	it('eq() works as expected', () => {
		expect(eq(0)(0).valid).toEqual(true);
		expect(eq('0')(0).valid).toEqual(false);
		expect(eq(0)('0').valid).toEqual(false);
		expect(eq(null)(null).valid).toEqual(true);
		expect(eq(undefined)(undefined).valid).toEqual(true);
		expect(eq(null)(undefined).valid).toEqual(false);
		expect(eq(null)(0).valid).toEqual(false);
		expect(eq(0)(null).valid).toEqual(false);
		expect(eq([0])([0]).valid).toEqual(true);
		expect(eq({ foo: 'bar' })({ foo: 'bar' }).valid).toEqual(true);
		expect(eq(NaN)(NaN).valid).toEqual(true);
	});

	it('eqField() works as expected', () => {
		expect(eqField(field('', [], { value: 'foo' }))('foo').valid).toEqual(true);
		expect(eqField(field('', [], { value: { bar: 'foo' } }))({ bar: 'foo' }).valid).toEqual(
			true
		);
		expect(eqField(field(''))(null).valid).toEqual(true);
		expect(eqField(field('', [], { value: 'foo' }))('bar').valid).toEqual(false);
	});

	it('email() works as expected', () => {
		expect(email()('foo@baz.car').valid).toEqual(true);
		expect(email()('foo@baz@.car').valid).toEqual(false);
		expect(email()('foo').valid).toEqual(false);
		expect(email()('foo.bar@foo').valid).toEqual(false);
		expect(email()('foo.bar@foo.bar').valid).toEqual(true);
		// NOTE: the regex behind the email validator is well tested by the team behind chromium
	});

	it('regex() works as expected', () => {
		expect(regex(/abc/)('abc').valid).toEqual(true);
		expect(regex(/abc/)('a-c').valid).toEqual(false);
	});

	it('not() works as expected', () => {
		expect(not(eq(1))(2).valid).toEqual(true);
	});

	it('all() works as expected', () => {
		expect(all(eq(1), eq(1))(1).valid).toEqual(true);
		expect(all(eq(1), eq(1), eq(1))(1).valid).toEqual(true);
	});

	it('any() works as expected', () => {
		expect(any(eq(1), eq(2))(1).valid).toEqual(true);
		expect(any(eq(2), eq(1), eq(1))(1).valid).toEqual(true);
		expect(any(eq(1), eq(1), eq(1))(1).valid).toEqual(true);
		expect(any(eq(1), eq(1), eq(1))(2).valid).toEqual(false);
	});

	it('none() works as expected', () => {
		expect(none(eq(1), eq(2))(3).valid).toEqual(true);
		expect(none(eq(1), eq(2))(2).valid).toEqual(false);
		expect(none(eq(1), eq(1))(1).valid).toEqual(false);
	});

	it('either() works as expected', () => {
		expect(either(eq(1), eq(2))(1).valid).toEqual(true);
		expect(either(eq(1), eq(2))(2).valid).toEqual(true);
		expect(either(eq(1), eq(1))(1).valid).toEqual(false);
		expect(either(eq(2), eq(2))(2).valid).toEqual(false);
	});
});
