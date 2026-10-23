"use strict";

import "adaptive-extender/core";
import { EnvironmentProvider, type Environment } from "adaptive-extender/core";
import { CloudflareWorker } from "../environment/workers/cloudflare-worker.js";
import { ShortcutsEnvironment } from "../models/shortcuts-environment.js";
import { MeasurementService } from "../services/measurement-service.js";
import { RedirectService } from "../services/redirect-service.js";
import { ShortcutRegistry } from "../services/shortcut-registry.js";

//#region Redirect worker
class RedirectWorker extends CloudflareWorker<Environment> {
	async run(request: Request, environment: Environment, context: ExecutionContext): Promise<Response> {
		const { secret } = EnvironmentProvider.resolve(environment, ShortcutsEnvironment);
		const url = new URL(request.url);
		const registry = new ShortcutRegistry(url);
		const measurement = new MeasurementService(secret);
		const service = new RedirectService(registry, measurement);
		return await service.handle(request, context);
	}

	async catch(error: Error): Promise<Response> {
		console.error(`Redirect failed:\n${Error.from(error)}`);
		return new Response("Internal Server Error", { status: 500 });
	}
}

export default new RedirectWorker();
//#endregion
