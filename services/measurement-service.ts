"use strict";

import "adaptive-extender/core";
import { Nullable } from "adaptive-extender/core";
import { VisitorCookies } from "../environment/workers/visitor-cookies.js";
import { ShortcutOpen } from "../models/shortcut-open.js";

//#region Measurement service
/** Sends a shortcut open to GA4 from the server through the Measurement Protocol, so a redirect that has no page is still recorded in the same property as the sites, under the same visitor. Ad blockers cannot stop it, because nothing runs in the browser. */
export class MeasurementService {
	static #endpoint: string = "https://www.google-analytics.com/mp/collect";
	static #measurement: string = "G-1N3MKL65T7";
	static #clientCookie: string = "_ga";
	static #sessionCookie: string = "_ga_1N3MKL65T7";
	static #clientPattern: RegExp = /^GA\d\.\d+\.(\d+\.\d+)$/;
	static #sessionPattern: RegExp = /^GS\d\.\d+\.s?(\d+)/;

	#secret: string;

	constructor(secret: string) {
		this.#secret = secret;
	}

	/** GA's own device id from the _ga cookie the sites set on eccs.dev, so the event joins that browser's visits. A browser without one gets a throwaway id in GA's format; it is never written back as a cookie. */
	static #client(request: Request): string {
		const cookie = VisitorCookies.read(request, MeasurementService.#clientCookie);
		const match = Nullable.map(cookie, MeasurementService.#clientPattern.exec);
		if (match !== null) return match[1];
		const [random] = crypto.getRandomValues(new Uint32Array(1));
		return `${random}.${Date.AsUnixSeconds.export(new Date())}`;
	}

	/** The GA session the browser is in, from the _ga_<stream> cookie, so the open lands in the same session as the page that follows. Without one, a new session starts now, the way GA numbers sessions. */
	static #session(request: Request): number {
		const cookie = VisitorCookies.read(request, MeasurementService.#sessionCookie);
		const match = Nullable.map(cookie, MeasurementService.#sessionPattern.exec);
		if (match !== null) return Number(match[1]);
		return Date.AsUnixSeconds.export(new Date());
	}

	/** Where the visitor is, from Cloudflare's geolocation of the request, because GA cannot locate a server-side event by itself. */
	static #location(request: Request): object {
		const { cf } = request;
		if (cf === undefined) return {};
		const { city, country, regionCode } = cf;
		const region = country === undefined || regionCode === undefined ? undefined : `${country}-${regionCode}`;
		return { city, country_id: country, region_id: region };
	}

	/** The browser's first preferred language (e.g. "ru" from "ru-RU,ru;q=0.9,en;q=0.8"). */
	static #device(request: Request): object {
		const header = request.headers.get("Accept-Language");
		if (header === null) return {};
		const [preferred] = header.split(",");
		const [language] = preferred.split(";");
		return { language: language.trim() };
	}

	async send(request: Request, user: string, event: ShortcutOpen): Promise<void> {
		const params = Object.assign(ShortcutOpen.export(event), { session_id: MeasurementService.#session(request), engagement_time_msec: 1 });
		const body = {
			client_id: MeasurementService.#client(request),
			user_id: user,
			user_location: MeasurementService.#location(request),
			device: MeasurementService.#device(request),
			events: [{ name: "shortcut_open", params }],
		};
		const url = new URL(MeasurementService.#endpoint);
		url.searchParams.set("measurement_id", MeasurementService.#measurement);
		url.searchParams.set("api_secret", this.#secret);
		try {
			await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
		} catch (reason) {
			console.error(`Measurement failed:\n${Error.from(reason)}`);
		}
	}
}
//#endregion
