"use strict";

import "adaptive-extender/core";
import { VisitorCookies } from "../environment/workers/visitor-cookies.js";
import { type MeasurementService } from "./measurement-service.js";
import { type ShortcutRegistry } from "./shortcut-registry.js";

//#region Redirect service
export class RedirectService {
	static #pattern: RegExp = /^\/to\/([\w-]+)$/;

	#registry: ShortcutRegistry;
	#measurement: MeasurementService;

	constructor(registry: ShortcutRegistry, measurement: MeasurementService) {
		this.#registry = registry;
		this.#measurement = measurement;
	}

	#redirect(target: URL, cookies: VisitorCookies): Response {
		const headers = new Headers();
		headers.set("Location", String(target));
		headers.set("Cache-Control", "no-store");
		for (const line of cookies.issue()) headers.append("Set-Cookie", line);
		return new Response(null, { status: 302, headers });
	}

	#notFound(): Response {
		return new Response("Not Found", { status: 404 });
	}

	async handle(request: Request, context: ExecutionContext): Promise<Response> {
		const { method, url } = request;
		if (method !== "GET" && method !== "HEAD") return new Response("Method Not Allowed", { status: 405 });

		const { pathname } = new URL(url);
		const cookies = new VisitorCookies(request);
		if (pathname === "/") return this.#notFound();
		const match = RedirectService.#pattern.exec(pathname);
		if (match === null) return this.#notFound();
		const [, name] = match;
		const target = await this.#registry.resolve(name);
		if (target === null) return this.#notFound();
		if (method === "GET") context.waitUntil(this.#measurement.send(request, cookies, name, target));
		return this.#redirect(target, cookies);
	}
}
//#endregion
