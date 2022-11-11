# Svelte Forms

[![Status](https://gitlab.com/rokkett/svelte-forms/badges/main/pipeline.svg?ignore_skipped=true&key_text=tests&key_width=40)](https://gitlab.com/rokkett/svelte-forms/-/pipelines)
[![Coverage](https://gitlab.com/rokkett/svelte-forms/badges/main/coverage.svg)](https://gitlab.com/rokkett/svelte-forms/-/pipelines)

Form validation for Svelte and Sveltekit. Support for Javascript and Typescript.

- [Documentation](DOCS.md)
- [Examples](examples/README.md)

## Installation

```sh
npm install @rokkett/svelte-forms
```

## Usage

```ts
const mail = field('email', [required(), email()]);
const pass = field('password', [required(), min(8)]);
const name = field('username', [not(eq('steve'))], { optional: true });
const gender = field('gender', [], { optional: true, value: 'human' });

const userForm = form(mail, pass, name, gender);

function onSubmit() {
    const uf = get(userForm);
    console.log(uf.data, uf.errors, uf.valid);
}
```

```html
<form on:submit|preventDefault={onSubmit}>
    <input
        bind:value={$mail.value}
        name={$field.name}
        use:fieldState={{ field: mail, invalid: 'border-red-500' }}
    />
    <button type="submit" disabled={!$userForm.valid}>Submit</button>
</form>
```

## Contributing

If you think you found a bug: [open a issue](https://gitlab.com/rokkett/svelte-forms/-/issues).
Feature request are also welcome.

## License

This library is distributed under the terms of the [ISC License](./LICENSE).  
Find an easy explanation on [choosealicense.com/licenses/isc](https://choosealicense.com/licenses/isc/).
