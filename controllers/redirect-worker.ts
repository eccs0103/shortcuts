"use strict";

import "adaptive-extender/core";
import { type Environment } from "adaptive-extender/core";
import { CloudflareWorker } from "../environment/workers/cloudflare-worker.js";
import { RedirectService } from "../services/redirect-service.js";

//#region Redirect worker
class RedirectWorker extends CloudflareWorker<Environment> {
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
