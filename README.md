# Svelte Forms

Form validation for Svelte and Sveltekit. Support for Javascript and Typescript.

- [Documentation](DOCS.md)
- [Examples](examples/README.md)

## Installation

```sh
npm install @rokkett/svelte-forms
```

## Usage

```ts
// field(<name>, <default value>, <validators>, <options>)
const mail = field("email", "", [required(), email()]);
const pass = field("password", "", [required(), min(8)]);
const name = field("username", "", [not(eq("notch"))], { optional: true });
const gender = field("gender", "", [], { optional: true });

// form(<field>, ...)
const userForm = form(mail, pass, name, gender);

function onSubmit() {
    console.log(get(userForm).data);
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

If you think you found a bug: [open a issue](https://gitlab.com/rokkett/svelte-forms/-/issues). Feature request are also welcome.

## License

This library is distributed under the terms of the [ISC License](./LICENSE).  
Find an easy explanation on [choosealicense.com/licenses/isc](https://choosealicense.com/licenses/isc/).
