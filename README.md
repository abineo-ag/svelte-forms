# **Archived and Unmaintained**

.


.


.


.


.


.


.


.


.


.


.


.


.


.


.


.


.


.


.


.


.


.


.


# Svelte Forms

[![npm](https://img.shields.io/npm/v/@abineo/svelte-forms)](https://www.npmjs.com/package/@abineo/svelte-forms)
[![CI](https://github.com/abineo-ag/svelte-forms/actions/workflows/ci.yml/badge.svg)](https://github.com/abineo-ag/svelte-forms/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/Coverage-94.68%25-success)](https://github.com/abineo-ag/svelte-forms/actions/workflows/coverage.yml)

Well tested form validation for Svelte and Sveltekit. Support for Javascript and Typescript.

[📖 Documentation](https://github.com/abineo-ag/svelte-forms/blob/main/DOCS.md)

## Installation

```sh
npm install @abineo/svelte-forms
```

## Usage

```ts
const mail = field('email', [required(), email()]);
const pass = field('password', [required(), min(8)]);
const name = field('username', [not(eq('steve'))], { optional: true });
const gender = field('gender', [], { optional: true, value: 'human' });
const country = field('country', [(value) => value === 'switzerland' ? err('too rich!' : ok())]);

const userForm = form(mail, pass, name, gender, country);

function onSubmit() {
    const uf = get(userForm);
    console.log(uf.data, uf.errors, uf.valid);
}
```

```svelte
<form on:submit|preventDefault="{onSubmit}">
	<input bind:value={$mail.value} name={$field.name} use:fieldState={{ field: mail, invalid:
	'border-red-500' }} /> ...
	<button type="submit" disabled="{!$userForm.valid}">Submit</button>
</form>
```

## Contributing

If you think you found a bug: [open a issue](https://github.com/abineo-ag/svelte-forms/issues).
Feature request are also welcome.

## License

This library is distributed under the terms of the [ISC License](https://github.com/abineo-ag/svelte-forms/blob/main/LICENSE).  
Find an easy explanation on [choosealicense.com/licenses/isc](https://choosealicense.com/licenses/isc/).
