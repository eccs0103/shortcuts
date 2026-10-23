"use strict";

import "adaptive-extender/core";
import { Nullable } from "adaptive-extender/core";
import { VisitorCookies } from "../environment/workers/visitor-cookies.js";
import { MeasurementDevice, MeasurementEvent, MeasurementLocation, MeasurementPayload } from "../models/measurement-payload.js";
import { ShortcutOpen } from "../models/shortcut-open.js";

//#region Measurement service
export class MeasurementService {
	static #endpoint: string = "https://www.google-analytics.com/mp/collect";
	static #measurement: string = "G-1N3MKL65T7";
	static #event: string = "shortcut_open";
	static #cookieClient: string = "_ga";
	static #cookieSession: string = "_ga_1N3MKL65T7";
	static #patternClient: RegExp = /^GA\d\.\d+\.(\d+\.\d+)$/;
	static #patternSession: RegExp = /^GS\d\.\d+\.s?(\d+)/;

	#url: URL;

	constructor(secret: string) {
		const url = new URL(MeasurementService.#endpoint);
		url.searchParams.set("measurement_id", MeasurementService.#measurement);
		url.searchParams.set("api_secret", secret);
		this.#url = url;
	}

	static #client(request: Request): string {
		const cookie = VisitorCookies.read(request, MeasurementService.#cookieClient);
		const pattern = MeasurementService.#patternClient;
		const match = Nullable.map(cookie, pattern.exec.bind(pattern));
		if (match !== null) return match[1];
		const [random] = crypto.getRandomValues(new Uint32Array(1));
		return `${random}.${Date.AsUnixSeconds.export(new Date())}`;
	}

	static #session(request: Request): number {
		const cookie = VisitorCookies.read(request, MeasurementService.#cookieSession);
		const pattern = MeasurementService.#patternSession;
		const match = Nullable.map(cookie, pattern.exec.bind(pattern));
		if (match !== null) return Number(match[1]);
		return Date.AsUnixSeconds.export(new Date());
	}

	static #text(value: unknown): string | null {
		if (typeof value !== "string") return null;
		return value;
	}

	static #location(request: Request): MeasurementLocation {
		const { cf } = request;
		if (cf === undefined) return new MeasurementLocation(null, null, null);
		const { city, country, regionCode } = cf;
		return new MeasurementLocation(MeasurementService.#text(city), MeasurementService.#text(country), MeasurementService.#text(regionCode));
	}

	static #open(request: Request, cookies: VisitorCookies, name: string, target: URL): ShortcutOpen {
		const { url, headers } = request;
		const { origin, pathname } = new URL(url);
		return new ShortcutOpen(name, target.host, `${origin}${pathname}`, headers.get("Referer"), cookies.network, headers.get("User-Agent"), MeasurementService.#session(request));
	}

	static #payload(request: Request, cookies: VisitorCookies, name: string, target: URL): MeasurementPayload {
		const client = MeasurementService.#client(request);
		const location = MeasurementService.#location(request);
		const event = new MeasurementEvent(MeasurementService.#event, MeasurementService.#open(request, cookies, name, target));
		const device = new MeasurementDevice(request.headers.get("Accept-Language"));
		return new MeasurementPayload(client, cookies.user, location, device, [event]);
	}

	async send(request: Request, cookies: VisitorCookies, name: string, target: URL): Promise<void> {
		if (request.headers.get("Sec-GPC") === "1") return;
		const object = MeasurementPayload.export(MeasurementService.#payload(request, cookies, name, target));
		const body = JSON.stringify(object);
		try {
			await fetch(this.#url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
		} catch (reason) {
			console.error(`Measurement failed:\n${Error.from(reason)}`);
		}
	}
}
//#endregion
