"use strict";

import "adaptive-extender/core";
import { URI } from "adaptive-extender/core";

//#region Shortcut registry
export class ShortcutRegistry {
	static #path: string = "/data/shortcuts.json";

	#assets: Fetcher;
	#source: URI;

	constructor(assets: Fetcher, origin: Readonly<URI>) {
		this.#assets = assets;
		this.#source = new URI(ShortcutRegistry.#path, origin);
	}

	async #targets(): Promise<Map<string, string>> {
		const response = await this.#assets.fetch(this.#source.href);
		if (!response.ok) throw new ReferenceError(`Unable to read shortcuts due ${response.status} status`);
		return Map.AsRecord(String).import(await response.json(), "shortcuts.json");
	}

	async resolve(name: string): Promise<URI | null> {
		const targets = await this.#targets();
		const target = targets.get(name);
		if (target === undefined) return null;
		return new URI(target);
	}
}
//#endregion
