import { Set } from 'typescript';

class ClassListMock implements DOMTokenList {
	[index: number]: string;
	length: number;
	value: string;
	toString(): string {
		throw new Error('Method not implemented.');
	}
	item(index: number): string | null {
		throw new Error('Method not implemented.');
	}
	replace(token: string, newToken: string): boolean {
		throw new Error('Method not implemented.');
	}
	supports(token: string): boolean {
		throw new Error('Method not implemented.');
	}
	toggle(token: string, force?: boolean | undefined): boolean {
		throw new Error('Method not implemented.');
	}
	forEach(
		callbackfn: (value: string, key: number, parent: DOMTokenList) => void,
		thisArg?: any
	): void {
		throw new Error('Method not implemented.');
	}
	entries(): IterableIterator<[number, string]> {
		throw new Error('Method not implemented.');
	}
	keys(): IterableIterator<number> {
		throw new Error('Method not implemented.');
	}
	values(): IterableIterator<string> {
		throw new Error('Method not implemented.');
	}
	[Symbol.iterator](): IterableIterator<string> {
		throw new Error('Method not implemented.');
	}

	cls: Set<string>;

	constructor() {
		this.cls = new Set('');
	}

	add(...tokens: string[]): void {
		tokens.forEach((token) => this.cls.add(token));
	}

	remove(...tokens: string[]): void {
		tokens.forEach((token) => this.cls.delete(token));
	}

	contains(token: string): boolean {
		return this.cls.has(token);
	}
}

export class NodeMock {
	classList: ClassListMock;

	constructor() {
		this.classList = new ClassListMock();
	}
}
