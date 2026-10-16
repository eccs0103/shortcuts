"use strict";

import "adaptive-extender/core";

//#region Shortcut registry
export class ShortcutRegistry {
	static #ROUTES: ReadonlyMap<string, string> = new Map([
		["vscode-quartz", "https://marketplace.visualstudio.com/items?itemName=eccs0103.quartz-language"],
		["2026-11-03", `https://cheatsheet.eccs.dev/?import=${encodeURIComponent("https://gist.githubusercontent.com/eccs0103/e787f0c61970cf01e3a7735dc814ae23/raw")}`],
		["4th-floor", `https://cheatsheet.eccs.dev/?import=${encodeURIComponent("https://gist.githubusercontent.com/eccs0103/578ff92d4de60eaedc36eee29a22be2c/raw")}`],
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
