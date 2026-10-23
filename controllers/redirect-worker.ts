"use strict";

import "adaptive-extender/core";
import { EnvironmentProvider, type Environment } from "adaptive-extender/core";
import { CloudflareWorker } from "../environment/workers/cloudflare-worker.js";
import { VisitorCookies } from "../environment/workers/visitor-cookies.js";
import { ShortcutOpen } from "../models/shortcut-open.js";
import { ShortcutRegistry } from "../models/shortcut-registry.js";
import { ShortcutsEnvironment } from "../models/shortcuts-environment.js";
import { MeasurementService } from "../services/measurement-service.js";

//#region Redirect worker
class RedirectWorker extends CloudflareWorker<Environment> {
	static #pattern: RegExp = /^\/to\/([\w-]+)$/;
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

	/** Records the open in GA4 without delaying the redirect. Skipped when the browser asks not to be tracked (Global Privacy Control). */
	#measure(request: Request, environment: Environment, context: ExecutionContext, cookies: VisitorCookies, event: ShortcutOpen): void {
		if (request.headers.get("Sec-GPC") === "1") return;
		const { secret } = EnvironmentProvider.resolve(environment, ShortcutsEnvironment);
		const measurement = new MeasurementService(secret);
		context.waitUntil(measurement.send(request, cookies.user, event));
	}

	async run(request: Request, environment: Environment, context: ExecutionContext): Promise<Response> {
		const registry = this.#registry;
		const { method, url, headers } = request;
		if (method !== "GET" && method !== "HEAD") return new Response("Method Not Allowed", { status: 405 });

		const { origin, pathname } = new URL(url);
		const cookies = new VisitorCookies(request);
		if (pathname === "/") return this.#redirect(new URL(registry.fallback), cookies);
		const match = RedirectWorker.#pattern.exec(pathname);
		if (match === null) return this.#notFound();
		const link = registry.resolve(match[1]);
		if (link === null) return this.#notFound();
		const target = new URL(link);
		if (method === "GET") this.#measure(request, environment, context, cookies, new ShortcutOpen(match[1], target.host, `${origin}${pathname}`, headers.get("Referer"), cookies.network, headers.get("User-Agent")));
		return this.#redirect(target, cookies);
	}

	async catch(error: Error): Promise<Response> {
		console.error(`Redirect failed:\n${Error.from(error)}`);
		return new Response("Internal Server Error", { status: 500 });
	}
}
//#endregion

export default new RedirectWorker();
