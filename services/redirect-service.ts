"use strict";

import "adaptive-extender/core";
import { VisitorCookies } from "../environment/workers/visitor-cookies.js";
import { type MeasurementService } from "./measurement-service.js";
import { ShortcutRegistry } from "./shortcut-registry.js";

//#region Redirect service
export class RedirectService {
	static #pattern: RegExp = /^\/to\/([\w-]+)$/;
	static #fallback: URL = new URL("https://eccs.dev");
	#registry: ShortcutRegistry = new ShortcutRegistry();

	/** Redirects with the visitor cookies of the eccs.dev sites, so a first-time visitor arrives at the target already carrying the id its events will use. */
	#redirect(target: URL, cookies: VisitorCookies): Response {
		const headers = new Headers({ "Location": String(target), "Cache-Control": "no-store" });
		for (const line of cookies.issue()) headers.append("Set-Cookie", line);
		return new Response(null, { status: 302, headers });
	}

	#notFound(): Response {
		return new Response("Not Found", { status: 404 });
	}

	/** Sends /to/<name> to its shortcut and records the open without delaying the redirect; the bare domain goes to the fallback, unrecorded. */
	handle(request: Request, measurement: MeasurementService, context: ExecutionContext): Response {
		const { method, url } = request;
		if (method !== "GET" && method !== "HEAD") return new Response("Method Not Allowed", { status: 405 });

		const { pathname } = new URL(url);
		const cookies = new VisitorCookies(request);
		if (pathname === "/") return this.#redirect(RedirectService.#fallback, cookies);
		const match = RedirectService.#pattern.exec(pathname);
		if (match === null) return this.#notFound();
		const [, name] = match;
		const target = this.#registry.resolve(name);
		if (target === null) return this.#notFound();
		if (method === "GET") context.waitUntil(measurement.send(request, cookies, name, target));
		return this.#redirect(target, cookies);
	}
}
//#endregion
