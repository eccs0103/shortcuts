"use strict";

import "adaptive-extender/core";
import { ShortcutRegistry } from "../models/shortcut-registry.js";

//#region Redirect service
export class RedirectService {
	static #PATH_PATTERN: RegExp = /^\/to\/([\w-]+)$/;
	#registry: ShortcutRegistry = new ShortcutRegistry();

	#redirect(target: URL): Response {
		const headers = new Headers({ "Location": String(target), "Cache-Control": "no-store" });
		return new Response(null, { status: 302, headers });
	}

	#notFound(): Response {
		return new Response("Not Found", { status: 404 });
	}

	handle(request: Request): Response {
		const registry = this.#registry;
		const { method, url } = request;
		if (method !== "GET" && method !== "HEAD") return new Response("Method Not Allowed", { status: 405 });

		const { pathname } = new URL(url);
		if (pathname === "/") return this.#redirect(registry.fallback);
		const match = RedirectService.#PATH_PATTERN.exec(pathname);
		if (match === null) return this.#notFound();
		const target = registry.resolve(match[1]);
		if (target === null) return this.#notFound();
		return this.#redirect(target);
	}
}
//#endregion
