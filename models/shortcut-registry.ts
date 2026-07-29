"use strict";

import "adaptive-extender/core";

//#region Shortcut registry
export class ShortcutRegistry {
	static #ROUTES: ReadonlyMap<string, string> = new Map([
		["vscode-quartz", "https://marketplace.visualstudio.com/items?itemName=eccs0103.quartz-language"],
	]);
	#fallback: Readonly<URL> = new URL("https://eccs.dev");

	get fallback(): URL { return this.#fallback; }

	resolve(name: string): URL | null {
		const target = ShortcutRegistry.#ROUTES.get(name);
		if (target === undefined) return null;
		return new URL(target);
	}
}
//#endregion
