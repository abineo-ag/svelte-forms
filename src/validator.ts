import { get } from 'svelte/store';
import type { Field } from './field';
import { isEqual } from 'lodash';

class ValidationResult {
	type: string;
	valid: boolean;
	inner: ValidationResult[];

	constructor(type: string, valid: boolean, inner: ValidationResult[]) {
		this.type = type;
		this.valid = valid;
		this.inner = inner;
	}

	inv(): ValidationResult {
		this.valid = !this.valid;
		return this;
	}

	flat(): ValidationResult[] {
		if (this.valid) return [this];

		const inner = this.inner.map((r) => r.flat()).flat();
		return [this, ...inner];
	}
}

export enum ValidationType {
	All = 'all',
	Any = 'any',
	None = 'none',
	Either = 'either',
	Required = 'required',
	Min = 'min',
	Max = 'max',
	Range = 'range',
	Size = 'size',
	Equal = 'equal',
	Email = 'email',
	Regex = 'regex',
}

export type Validator = (value: any) => ValidationResult;

export function ok(error: string = 'error', inner: ValidationResult[] = []): ValidationResult {
	return new ValidationResult(error, true, inner);
}

export function err(error: string = 'error', inner: ValidationResult[] = []): ValidationResult {
	return new ValidationResult(error, false, inner);
}

export function validateAll(value: any, ...validators: Validator[]): ValidationResult[] {
	return validators
		.map((validator) => validator(value))
		.map((result) => result.flat())
		.flat();
}

export function getErrors(results: ValidationResult[]): string[] {
	return results.map((result) => (result.valid ? [] : result.type)).flat();
}

function getSize(value: any): number {
	if (typeof value === 'number') return value;
	if (typeof value === 'string') return value.trim().length;
	if (Array.isArray(value)) return value.length;
	else return 0;
}

export function required(error: string = ValidationType.Required): Validator {
	return (value: any) => {
		if (
			(typeof value === 'boolean' && value) ||
			(Array.isArray(value) && value.length !== 0) ||
			(typeof value === 'object' && value && !Array.isArray(value)) ||
			getSize(value) !== 0
		)
			return ok(error);
		return err(error);
	};
}

export function min(minimum: number, error: string = ValidationType.Min): Validator {
	return (value: any) => {
		if (getSize(value) >= minimum) return ok(error);
		return err(error);
	};
}

export function max(maximum: number, error: string = ValidationType.Max): Validator {
	return (value: any) => {
		if (getSize(value) <= maximum) return ok(error);
		return err(error);
	};
}

export function range(
	minimum: number,
	maximum: number,
	error: string = ValidationType.Range
): Validator {
	return (value: any) => {
		const errors = getErrors(validateAll(value, min(minimum, error), max(maximum, error)));
		return errors.length === 0 ? ok(error) : err(error);
	};
}

export function size(size: number, error: string = ValidationType.Size): Validator {
	return (value: any) => {
		if (size === getSize(value)) return ok(error);
		return err(error);
	};
}

export function eq(wanted: any, error: string = ValidationType.Equal): Validator {
	return (value: any) => {
		if (isEqual(value, wanted)) return ok(error);
		return err(error);
	};
}

export function eqField<K extends string, V>(
	field: Field<K, V>,
	error: string = ValidationType.Equal
): Validator {
	return (value: any) => {
		if (isEqual(get(field).value, value)) return ok(error);
		return err(error);
	};
}

export function email(error: string = ValidationType.Email): Validator {
	return (value: any) => {
		// https://stackoverflow.com/a/46181/10838441
		const EMAIL =
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return String(value).toLowerCase().match(EMAIL) ? ok(error) : err(error);
	};
}

export function regex(regex: RegExp, error: string = ValidationType.Regex): Validator {
	return (value: any) => {
		return String(value).match(regex) ? ok(error) : err(error);
	};
}

export function not(validator: Validator): Validator {
	return (value: any) => {
		return validator(value).inv();
	};
}

export function all(...validators: Validator[]): Validator {
	return (value: any) => {
		const results = validateAll(value, ...validators);
		const allValid = results.every((result) => result.valid);
		return allValid ? ok(ValidationType.All, results) : err(ValidationType.All, results);
	};
}

export function any(...validators: Validator[]): Validator {
	return (value: any) => {
		const results = validateAll(value, ...validators);
		const someValid = results.some((result) => result.valid);
		return someValid ? ok(ValidationType.Any, results) : err(ValidationType.Any, results);
	};
}

export function none(...validators: Validator[]): Validator {
	return (value: any) => {
		const results = validateAll(value, ...validators);
		const valid = results.some((result) => result.valid);
		return valid ? err(ValidationType.None, results) : ok(ValidationType.None, results);
	};
}

export function either(validatorA: Validator, validatorB: Validator): Validator {
	return (value: any) => {
		const results = validateAll(value, validatorA, validatorB);
		const count = results.map((result) => result.valid || []).flat().length;
		return count === 1
			? ok(ValidationType.Either, results)
			: err(ValidationType.Either, results);
	};
}
