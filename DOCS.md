# Fields

Creating fields is simple. The only required argument is `name`. The name is used when returning errors or when retreiving form data. More on that later.

```ts
import { field } from '@abineo/svelte-forms';

const myField = field('foo');
```

Fields are [Svelte Stores](https://svelte.dev/docs#run-time-svelte-store) which you can subscribe to.

```svelte
<input bind:value="{$myField.value}" name="{$myField.name}" />
{#if !$myField.valid && $myField.dirty}
	<sub>{$myField.errors.join()}</sub>
{/if}
```

You can add validators to a field, mark it as optional or set a initial value.
You can change the value of a field, or reset the field to the initial value (default is `null`).

```ts
import { field, required, min } from '@abineo/svelte-forms';
import { get } from 'svelte/store';

const myField = field(
	'foo',
	[required(), min(20)], // <- validators
	{ optional: true, value: 42 } // <- options
);

myField.set(5);

console.log(get(myField).value, get(myField).valid);
// 5, false

myField.reset();

console.log({
	value: get(myField).value,
	dirty: get(myField).dirty,
	valid: get(myField).valid,
});
// { value: 42, dirty: true, valid: true }

myField.setValid(false);

console.log(get(myField).valid);
// false

myField.revalidate(/* dirty?: boolean */ false);

console.log({
	dirty: get(myField).dirty,
	valid: get(myField).valid,
});
// { dirty: false, valid: true }
```

# Validators

Validators take optional arguments and return a function which validates a given value.
Every Validator can take a optional error string, which will be added to the fields `errors`.
There are plenty of default validators to pick from:

```ts
function required(error?: string);

function min(minimum: number, error?: string);

function max(maximum: number, error?: string);

function range(minimum: number, maximum: number, error?: string);

function size(size: number, error?: string);

function eq(wanted: any, error?: string);

function eqField(field: Field<any>, error?: string);

function email(error?: string);

function regex(regex: RegExp, error?: string);
```

All validators are connected as a logical `AND` gate. Example:

```ts
const name = field('name', [eq('alice'), eq('bob')]);
// no value is ever valid, bacause it cannot be equal 'alice' and be equal 'bob' at the same time
```

## Chain validators with gates

Gates are special validators, which take validators as arguments. Let me show a simple example:

```ts
const password = field('password', [not(eq('1234'))]);
// All values are valid, exept '1234'
```

These are all the gates:

```ts
function not(validator: Validator) => Validator;
// invert result (is valid if validator inside is invalid)

function all(...validators: Validator[]) => Validator;
// is only valid if all validators are valid

function any(...validators: Validator[]) => Validator;
// is valid if one or more validators are valid

function none(...validators: Validator[]) => Validator;
// is valid if all validators are INvalid

function either(validatorA: Validator, validatorB: Validator) => Validator;
// either is valid if exactly one validator is valid.
```

You can put validators inside other validators or gates:

```ts
const password = field('password', [not(any(eq('1234')), eq('asdf'))]);
// All values are valid, exept '1234' and 'asdf'
const password = field('password', [none(eq('1234')), eq('asdf')]);
// same
```

## Creating custom validators

You can create custom validators, for more complex scenarios.

```ts
const myValidator = (value: any) => {
	if (value === 'foo') return err('foo-err-type');
	else if (value === null) return err('no-null-err-type');
	else return ok();
};
const f = field('phield', [myValidator, required()]);

console.log(get(f).errors, get(f).valid);
// ['no-null-err-type', 'required'], false

f.set('foo');

console.log(get(f).errors, get(f).valid);
// ['foo-err-type'], false

f.set('bar');

console.log(get(f).errors, get(f).valid);
// [], true
```

# Form

A form is a [Svelte Stores](https://svelte.dev/docs#run-time-svelte-store) which contains all your fields.

```ts
const email = field('email', [required('Please enter your email')]);
const password = field('pass', [min(8)]);

const f = form(email, password);

console.log(get(f).errors);
// { errors: { email: 'Please enter your email', pass: 'min' } }

email.set('foo@bar.baz');
password.set('password1!');

console.log(get(f).data);
// { email: 'foo@bar.baz', pass: 'password1!' }
```

```svelte
<button disabled="{!$f.valid}" type="submit">Login</button>
```

# Classes / Styling

Use the `fieldState` action to automatically set classes.

```ts
import { field, fieldState } from '@abineo/svelte-forms';

const foo = field('foo');
```

```svelte
<input use:fieldState="{{ field: foo, invalid: 'border-red' }}" />
```

The following classes are set by the action:

-   valid
-   invalid
-   dirty

You can change them by passing in custom class names, as seen in the example above.
