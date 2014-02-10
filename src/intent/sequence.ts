/// <reference path="../../_typings.d.ts" />

import iter = module('./iterator')

export class Sequence<T> extends iter.IterBase<T> {
}
class UniqueIter<T> extends IterBase<T> {
	private it: Iter<T>;
	private seen: T[];

	constructor(it: Iter<T>, seen: T[] = []) {
		super();

		this.it = it;
		this.seen = seen;
	}

	next(): T {
		var obj: T;
		while ((obj = this.it.next()) && this.seen.indexOf(obj) !== -1);
		if (obj)
			this.seen.push(obj);
		return obj;
	}

	copy(): UniqueIter<T> {
		return new UniqueIter<T>(this.it.copy(), this.seen.slice(0));
	}
}

while (true) {
	yield 3;
}
