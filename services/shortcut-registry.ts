"use strict";

import "adaptive-extender/core";
import shortcuts from "../resources/data/shortcuts.json";

//#region Shortcut registry
export class ShortcutRegistry {
	#routes: Map<string, string> = new Map(Object.entries(shortcuts));

	resolve(name: string): URL | null {
		const target = this.#routes.get(name);
		if (target === undefined) return null;
		return new URL(target);
	}
}
//#endregion
