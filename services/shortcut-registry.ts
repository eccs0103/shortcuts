"use strict";

import "adaptive-extender/core";

//#region Shortcut registry
export class ShortcutRegistry {
	static #path: string = "/data/shortcuts.json";

	#source: URL;

	constructor(origin: Readonly<URL>) {
		this.#source = new URL(ShortcutRegistry.#path, origin);
	}

	async #targets(): Promise<Map<string, string>> {
		const response = await fetch(this.#source);
		if (!response.ok) throw new ReferenceError(`Unable to read shortcuts due ${response.status} status`);
		return Map.AsRecord(String).import(await response.json(), "shortcuts.json");
	}

	async resolve(name: string): Promise<URL | null> {
		const targets = await this.#targets();
		const target = targets.get(name);
		if (target === undefined) return null;
		return new URL(target);
	}
}
//#endregion
