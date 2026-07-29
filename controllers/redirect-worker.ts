"use strict";

import "adaptive-extender/core";
import { CloudflareWorker } from "../environment/cloudflare-worker.js";
import { RedirectService } from "../services/redirect-service.js";
import { ShortcutRegistry } from "../models/shortcut-registry.js";

//#region Redirect worker
class RedirectWorker extends CloudflareWorker {
	#service: RedirectService = new RedirectService();

	async run(request: Request): Promise<Response> {
		return this.#service.handle(request);
	}

	async catch(error: Error): Promise<Response> {
		console.error(`Redirect failed:\n${Error.from(error)}`);
		return new Response("Internal Server Error", { status: 500 });
	}
}
//#endregion

export default new RedirectWorker();
