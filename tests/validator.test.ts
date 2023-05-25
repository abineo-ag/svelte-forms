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
		expect(sut.type).toBe('error');
		expect(sut.valid).toBe(true);
		expect(sut.inner).toStrictEqual([]);
		expect(sut.inv().valid).toBe(false);
	});

	it('can call err with no args', () => {
		const sut = err();
		expect(sut.type).toBe('error');
		expect(sut.valid).toBe(false);
		expect(sut.inner).toStrictEqual([]);
		expect(sut.inv().valid).toBe(true);
	});

	it('can call err and ok args', () => {
		const sutOk = ok('foo', [ok('inner')]);
		const sutErr = err('bar', [err('inner')]);
		expect(sutOk.type).toBe('foo');
		expect(sutOk.inner[0].type).toBe('inner');
		expect(sutErr.type).toBe('bar');
		expect(sutErr.inner[0].type).toBe('inner');
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

		expect(actual.length).toBe(5);
		expect(actual[4].type).toBe('last');
		expect(actual[4].valid).toBe(true);
	});

	it('validateAll() can resolve deep nested in correct order', () => {
		const result = err('', [err('', [err('', [err('', [ok('last')])])])]);
		const actual = validateAll(1, () => result);

		expect(actual.length).toBe(5);
		expect(actual[4].type).toBe('last');
		expect(actual[4].valid).toBe(true);
	});

	it('getErrors() returns errors as string in correct order', () => {
		const results = [err('one'), err('two'), ok('three'), err('four'), ok('five')];
		const actual = getErrors(results);

		expect(actual).toStrictEqual(['one', 'two', 'four']);
	});

	it('all validators return a valid default result type', () => {
		expect(required()(true).type).toBe(ValidationType.Required);
		expect(required()(false).type).toBe(ValidationType.Required);
		expect(min(2)(3).type).toBe(ValidationType.Min);
		expect(min(2)(1).type).toBe(ValidationType.Min);
		expect(max(2)(1).type).toBe(ValidationType.Max);
		expect(max(2)(2).type).toBe(ValidationType.Max);
		expect(range(0, 2)(1).type).toBe(ValidationType.Range);
		expect(range(0, 2)(6).type).toBe(ValidationType.Range);
		expect(size(1)([1]).type).toBe(ValidationType.Size);
		expect(size(1)([1, 2]).type).toBe(ValidationType.Size);
		expect(eq(1)(1).type).toBe(ValidationType.Equal);
		expect(eq(1)(2).type).toBe(ValidationType.Equal);
		expect(eqField(field('', [], { value: 1 }))(1).type).toBe(ValidationType.Equal);
		expect(eqField(field('', [], { value: 2 }))(1).type).toBe(ValidationType.Equal);
		expect(email()('ab@cd.ef').type).toBe(ValidationType.Email);
		expect(email()('abcdef').type).toBe(ValidationType.Email);
		expect(regex(/abc/)('abc').type).toBe(ValidationType.Regex);
		expect(regex(/abc/)('def').type).toBe(ValidationType.Regex);
		expect(not(eq(1))(2).type).toBe(ValidationType.Equal);
		expect(not(eq(1))(1).type).toBe(ValidationType.Equal);
		expect(all(eq(1))(1).type).toBe(ValidationType.All);
		expect(all(eq(1))(2).type).toBe(ValidationType.All);
		expect(any(eq(1))(1).type).toBe(ValidationType.Any);
		expect(any(eq(1))(2).type).toBe(ValidationType.Any);
		expect(none(eq(1))(2).type).toBe(ValidationType.None);
		expect(none(eq(1))(1).type).toBe(ValidationType.None);
		expect(either(eq(1), eq(2))(2).type).toBe(ValidationType.Either);
		expect(either(eq(2), eq(2))(2).type).toBe(ValidationType.Either);
	});

	it('all validators return the error given at init', () => {
		expect(required('foo')(true).type).toBe('foo');
		expect(required('foo')(false).type).toBe('foo');
		expect(min(2, 'foo')(3).type).toBe('foo');
		expect(min(2, 'foo')(1).type).toBe('foo');
		expect(max(2, 'foo')(1).type).toBe('foo');
		expect(max(2, 'foo')(2).type).toBe('foo');
		expect(range(0, 2, 'foo')(1).type).toBe('foo');
		expect(range(0, 2, 'foo')(6).type).toBe('foo');
		expect(size(1, 'foo')([1]).type).toBe('foo');
		expect(size(1, 'foo')([1, 2]).type).toBe('foo');
		expect(eq(1, 'foo')(1).type).toBe('foo');
		expect(eq(1, 'foo')(2).type).toBe('foo');
		expect(eqField(field('', [], { value: 1 }), 'foo')(1).type).toBe('foo');
		expect(eqField(field('', [], { value: 2 }), 'foo')(1).type).toBe('foo');
		expect(email('foo')('ab@cd.ef').type).toBe('foo');
		expect(email('foo')('abcdef').type).toBe('foo');
		expect(regex(/abc/, 'foo')('abc').type).toBe('foo');
		expect(regex(/abc/, 'foo')('def').type).toBe('foo');
		expect(not(eq(1, 'foo'))(2).type).toBe('foo');
		expect(not(eq(1, 'foo'))(1).type).toBe('foo');
		expect(all(eq(1, 'foo'))(1).inner[0].type).toBe('foo');
		expect(all(eq(1, 'foo'))(2).inner[0].type).toBe('foo');
		expect(any(eq(1, 'foo'))(1).inner[0].type).toBe('foo');
		expect(any(eq(1, 'foo'))(2).inner[0].type).toBe('foo');
		expect(none(eq(1, 'foo'))(2).inner[0].type).toBe('foo');
		expect(none(eq(1, 'foo'))(1).inner[0].type).toBe('foo');
		expect(either(eq(1, 'foo'), eq(2, 'foo'))(2).inner[0].type).toBe('foo');
		expect(either(eq(2, 'foo'), eq(2, 'foo'))(2).inner[0].type).toBe('foo');
	});

	it('required() works as expected', () => {
		expect(required()(true).valid).toBe(true);
		expect(required()(false).valid).toBe(false);
		expect(required()(null).valid).toBe(false);
		expect(required()(undefined).valid).toBe(false);
		expect(required()('').valid).toBe(false);
		expect(required()('foo').valid).toBe(true);
		expect(required()(0).valid).toBe(false);
		expect(required()(1).valid).toBe(true);
		expect(required()(-1).valid).toBe(true);
		expect(required()({}).valid).toBe(true);
		expect(required()([]).valid).toBe(false);
		expect(required()([1]).valid).toBe(true);
	});

	it('min() works as expected', () => {
		expect(min(1)(1).valid).toBe(true);
		expect(min(2)(1).valid).toBe(false);
		expect(min(1)(2).valid).toBe(true);
		expect(min(-1)(2).valid).toBe(true);
		expect(min(-1)(-2).valid).toBe(false);
		expect(min(-2)(-1).valid).toBe(true);
		expect(min(2)([1, 2, 3]).valid).toBe(true);
		expect(min(2)([1, 2]).valid).toBe(true);
		expect(min(2)([1]).valid).toBe(false);
		expect(min(-2)([1]).valid).toBe(true);
		expect(min(2)('1').valid).toBe(false);
		expect(min(2)('12').valid).toBe(true);
		expect(min(2)('123').valid).toBe(true);
		expect(min(-1)('123').valid).toBe(true);
		expect(min(1)('   ').valid).toBe(false);
		expect(min(2)('5').valid).toBe(false);
		expect(min(1)({}).valid).toBe(false);
		// @ts-ignore
		expect(min(null)(1).valid).toBe(true);
		// @ts-ignore
		expect(min(undefined)(1).valid).toBe(false);
		expect(min(0)(null).valid).toBe(true);
		expect(min(1)(null).valid).toBe(false);
		expect(min(0)(undefined).valid).toBe(true);
		expect(min(1)(undefined).valid).toBe(false);
	});

	it('max() works as expected', () => {
		expect(max(1)(1).valid).toBe(true);
		expect(max(2)(1).valid).toBe(true);
		expect(max(1)(2).valid).toBe(false);
		expect(max(-1)(-2).valid).toBe(true);
		expect(max(1)('1').valid).toBe(true);
		expect(max(1)('5').valid).toBe(true);
		expect(max(1)('00').valid).toBe(false);
		expect(max(3)('   123   ').valid).toBe(true);
		expect(max(3)('   1 23   ').valid).toBe(false);
		expect(max(0)([]).valid).toBe(true);
		expect(max(1)([1]).valid).toBe(true);
		expect(max(1)([1, 2]).valid).toBe(false);
		expect(max(2)([1]).valid).toBe(true);
		expect(max(-1)([]).valid).toBe(false);
		// @ts-ignore
		expect(max(null)(0).valid).toBe(true);
		// @ts-ignore
		expect(max(undefined)(0).valid).toBe(false);
		expect(max(0)(null).valid).toBe(true);
		expect(max(1)(null).valid).toBe(true);
		expect(max(-1)(undefined).valid).toBe(false);
		expect(max(0)(undefined).valid).toBe(true);
	});

	it('range() works as expected', () => {
		expect(range(0, 0)(0).valid).toBe(true);
		expect(range(1, 10)(0).valid).toBe(false);
		expect(range(1, 10)(11).valid).toBe(false);
		expect(range(1, 10)(5).valid).toBe(true);
		expect(range(1, 2)('').valid).toBe(false);
		expect(range(1, 2)('0').valid).toBe(true);
		expect(range(1, 2)('000').valid).toBe(false);
		expect(range(1, 2)([]).valid).toBe(false);
		expect(range(1, 2)([5]).valid).toBe(true);
		expect(range(1, 2)([5, 5, 5]).valid).toBe(false);
		expect(range(1, 2)({}).valid).toBe(false);
		expect(range(-1, 2)({}).valid).toBe(true);
	});

	it('size() works as expected', () => {
		expect(size(0)(0).valid).toBe(true);
		expect(size(5)(5).valid).toBe(true);
		expect(size(0)(null).valid).toBe(true);
		expect(size(0)(undefined).valid).toBe(true);
		expect(size(0)({}).valid).toBe(true);
		expect(size(0)([]).valid).toBe(true);
		expect(size(1)([]).valid).toBe(false);
		expect(size(0)([1]).valid).toBe(false);
		expect(size(0)('').valid).toBe(true);
		expect(size(0)('   ').valid).toBe(true);
		expect(size(1)('  x  ').valid).toBe(true);
		// @ts-ignore
		expect(size(null)(null).valid).toBe(false);
	});

	it('eq() works as expected', () => {
		expect(eq(0)(0).valid).toBe(true);
		expect(eq('0')(0).valid).toBe(false);
		expect(eq(0)('0').valid).toBe(false);
		expect(eq(null)(null).valid).toBe(true);
		expect(eq(undefined)(undefined).valid).toBe(true);
		expect(eq(null)(undefined).valid).toBe(false);
		expect(eq(null)(0).valid).toBe(false);
		expect(eq(0)(null).valid).toBe(false);
		expect(eq([0])([0]).valid).toBe(true);
		expect(eq({ foo: 'bar' })({ foo: 'bar' }).valid).toBe(true);
		expect(eq(NaN)(NaN).valid).toBe(true);
	});

	it('eqField() works as expected', () => {
		expect(eqField(field('', [], { value: 'foo' }))('foo').valid).toBe(true);
		expect(eqField(field('', [], { value: { bar: 'foo' } }))({ bar: 'foo' }).valid).toBe(true);
		expect(eqField(field(''))(null).valid).toBe(true);
		expect(eqField(field('', [], { value: 'foo' }))('bar').valid).toBe(false);
	});

	it('email() works as expected', () => {
		// https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/web_tests/fast/forms/resources/ValidityState-typeMismatch-email.js?q=ValidityState-typeMismatch-email.js&ss=chromium
		expect(email()('something@something.com').valid).toBe(true);
		expect(email()('someone@localhost.localdomain').valid).toBe(true);
		expect(email()('someone@127.0.0.1').valid).toBe(true);
		expect(email()('a@b.b').valid).toBe(true);
		expect(email()('a/b@domain.com').valid).toBe(true);
		expect(email()('{}@domain.com').valid).toBe(true);
		expect(email()("m*'!%@something.sa").valid).toBe(true);
		expect(email()('tu!!7n7.ad##0!!!@company.ca').valid).toBe(true);
		expect(email()('%@com.com').valid).toBe(true);
		expect(email()("!#$%&'*+/=?^_`{|}~.-@com.com").valid).toBe(true);
		expect(email()('.wooly@example.com').valid).toBe(false);
		expect(email()('wo..oly@example.com').valid).toBe(false);
		expect(email()('someone@do-ma-in.com').valid).toBe(true);
		expect(email()('somebody@example').valid).toBe(false);
		expect(email()('a@p.com').valid).toBe(true);
		expect(email()('').valid).toBe(false);
		expect(email()('invalid:email@example.com').valid).toBe(false);
		expect(email()('@somewhere.com').valid).toBe(false);
		expect(email()('example.com').valid).toBe(false);
		expect(email()('@@example.com').valid).toBe(false);
		expect(email()('a space@example.com').valid).toBe(false);
		expect(email()('something@ex..ample.com').valid).toBe(false);
		expect(email()('a\b@c').valid).toBe(false);
		expect(email()('someone@somewhere.com.').valid).toBe(false);
		expect(email()('""test\blah""@example.com').valid).toBe(false);
		expect(email()('"testblah"@example.com').valid).toBe(false);
		expect(email()('someone@somewhere.com@').valid).toBe(false);
		expect(email()('someone@somewhere_com').valid).toBe(false);
		expect(email()('someone@some:where.com').valid).toBe(false);
		expect(email()('.').valid).toBe(false);
		expect(email()('F/s/f/a@feo+re.com').valid).toBe(false);
		expect(email()('some+long+email+address@some+host-weird-/looking.com').valid).toBe(false);
		expect(email()('a @p.com').valid).toBe(false);
		expect(email()('a\u0020@p.com').valid).toBe(false);
		expect(email()('a\u0009@p.com').valid).toBe(false);
		expect(email()('a\u000B@p.com').valid).toBe(false);
		expect(email()('a\u000C@p.com').valid).toBe(false);
		expect(email()('a\u2003@p.com').valid).toBe(false);
		expect(email()('a\u3000@p.com').valid).toBe(false);
		expect(email()('ddjk-s-jk@asl-.com').valid).toBe(false);
		expect(email()('someone@do-.com').valid).toBe(false);
		expect(email()('somebody@-p.com').valid).toBe(false);
		expect(email()('somebody@-.com').valid).toBe(false);
	});

	it('regex() works as expected', () => {
		expect(regex(/abc/)('abc').valid).toBe(true);
		expect(regex(/abc/)('a-c').valid).toBe(false);
	});

	it('not() works as expected', () => {
		expect(not(eq(1))(2).valid).toBe(true);
	});

	it('all() works as expected', () => {
		expect(all(eq(1), eq(1))(1).valid).toBe(true);
		expect(all(eq(1), eq(1), eq(1))(1).valid).toBe(true);
	});

	it('any() works as expected', () => {
		expect(any(eq(1), eq(2))(1).valid).toBe(true);
		expect(any(eq(2), eq(1), eq(1))(1).valid).toBe(true);
		expect(any(eq(1), eq(1), eq(1))(1).valid).toBe(true);
		expect(any(eq(1), eq(1), eq(1))(2).valid).toBe(false);
	});

	it('none() works as expected', () => {
		expect(none(eq(1), eq(2))(3).valid).toBe(true);
		expect(none(eq(1), eq(2))(2).valid).toBe(false);
		expect(none(eq(1), eq(1))(1).valid).toBe(false);
	});

	it('either() works as expected', () => {
		expect(either(eq(1), eq(2))(1).valid).toBe(true);
		expect(either(eq(1), eq(2))(2).valid).toBe(true);
		expect(either(eq(1), eq(1))(1).valid).toBe(false);
		expect(either(eq(2), eq(2))(2).valid).toBe(false);
	});
});
