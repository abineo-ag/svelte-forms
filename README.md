# Svelte Forms

![Status](https://gitlab.com/abineo/svelte-forms/badges/main/pipeline.svg?ignore_skipped=true&key_text=tests&key_width=40)
![Coverage](https://gitlab.com/abineo/svelte-forms/badges/main/coverage.svg)
![Stable](https://img.shields.io/badge/status-stable-informational)
![npm](https://img.shields.io/npm/v/@abineo/svelte-forms)

Form validation for Svelte and Sveltekit. Support for Javascript and Typescript.

-   [Documentation](https://gitlab.com/abineo/svelte-forms/-/blob/main/DOCS.md)
-   [NPM](https://www.npmjs.com/package/@abineo/svelte-forms)
-   [GitLab](https://gitlab.com/abineo/svelte-forms)

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

```html
<form on:submit|preventDefault="{onSubmit}">
	<input
        bind:value={$mail.value}
        name={$field.name}
        use:fieldState={{ field: mail, invalid: 'border-red-500' }}
    />
    ...
	<button type="submit" disabled="{!$userForm.valid}">Submit</button>
</form>
```

## Contributing

If you think you found a bug: [open a issue](https://gitlab.com/abineo/svelte-forms/-/issues).
Feature request are also welcome.

## License

This library is distributed under the terms of the [ISC License](./LICENSE).  
Find an easy explanation on [choosealicense.com/licenses/isc](https://choosealicense.com/licenses/isc/).
