"use strict";

import "adaptive-extender/core";
import { EnvironmentProvider, type Environment } from "adaptive-extender/core";
import { CloudflareWorker } from "../environment/workers/cloudflare-worker.js";
import { ShortcutsEnvironment } from "../models/shortcuts-environment.js";
import { MeasurementService } from "../services/measurement-service.js";
import { RedirectService } from "../services/redirect-service.js";

//#region Redirect worker
class RedirectWorker extends CloudflareWorker<Environment> {
	#service: RedirectService = new RedirectService();

	async run(request: Request, environment: Environment, context: ExecutionContext): Promise<Response> {
		const { secret } = EnvironmentProvider.resolve(environment, ShortcutsEnvironment);
		return this.#service.handle(request, new MeasurementService(secret), context);
	}

	async catch(error: Error): Promise<Response> {
		console.error(`Redirect failed:\n${Error.from(error)}`);
		return new Response("Internal Server Error", { status: 500 });
	}
}
//#endregion

export default new RedirectWorker();
