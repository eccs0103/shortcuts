"use strict";

import "adaptive-extender/core";

//#region Shortcut registry
export class ShortcutRegistry {
	static #routes: ReadonlyMap<string, string> = new Map([
		["vscode-quartz", "https://marketplace.visualstudio.com/items?itemName=eccs0103.quartz-language"],
		["2026-11-03", `https://cheatsheet.eccs.dev/?import=${encodeURIComponent("https://gist.githubusercontent.com/eccs0103/e787f0c61970cf01e3a7735dc814ae23/raw")}`],
		["4th-floor", `https://cheatsheet.eccs.dev/?import=${encodeURIComponent("https://gist.githubusercontent.com/eccs0103/578ff92d4de60eaedc36eee29a22be2c/raw")}`],
	]);
	static #fallback: string = "https://eccs.dev";

	get fallback(): string { return ShortcutRegistry.#fallback; }

	resolve(name: string): string | null {
		const target = ShortcutRegistry.#routes.get(name);
		if (target === undefined) return null;
		return target;
	}
}
//#endregion
