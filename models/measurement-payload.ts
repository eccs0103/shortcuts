"use strict";

import "adaptive-extender/core";
import { Field, Model, Optional } from "adaptive-extender/core";
import { ShortcutOpen, type ShortcutOpenScheme } from "./shortcut-open.js";

//#region Measurement location
export interface MeasurementLocationScheme {
	city: string | undefined;
	country_id: string | undefined;
	region_id: string | undefined;
}

export class MeasurementLocation extends Model {
	@Field(Optional.Of(String), { name: "city" })
	city: string | undefined;

	@Field(Optional.Of(String), { name: "country_id" })
	country: string | undefined;

	@Field(Optional.Of(String), { name: "region_id" })
	region: string | undefined;

	constructor();
	constructor(city: string | null, country: string | null, region: string | null);
	constructor(city?: string | null, country?: string | null, region?: string | null) {
		if (city === undefined || country === undefined || region === undefined) {
			super();
			return;
		}

		super();
		this.city = city ?? undefined;
		this.country = country ?? undefined;
		if (country === null || region === null) return;
		this.region = `${country}-${region}`;
	}
}
//#endregion
//#region Measurement device
export interface MeasurementDeviceScheme {
	language: string | undefined;
}

export class MeasurementDevice extends Model {
	@Field(Optional.Of(String), { name: "language" })
	language: string | undefined;

	constructor();
	constructor(languages: string | null);
	constructor(languages?: string | null) {
		if (languages === undefined) {
			super();
			return;
		}

		super();
		if (languages === null) return;
		const [preferred] = languages.split(",");
		const [language] = preferred.split(";");
		this.language = language.trim();
	}
}
//#endregion
//#region Measurement event
export interface MeasurementEventScheme {
	name: string;
	params: ShortcutOpenScheme;
}

export class MeasurementEvent extends Model {
	@Field(String, { name: "name" })
	name: string;

	@Field(ShortcutOpen, { name: "params" })
	params: ShortcutOpen;

	constructor();
	constructor(name: string, params: ShortcutOpen);
	constructor(name?: string, params?: ShortcutOpen) {
		if (name === undefined || params === undefined) {
			super();
			return;
		}

		super();
		this.name = name;
		this.params = params;
	}
}
//#endregion
//#region Measurement payload
export interface MeasurementPayloadScheme {
	client_id: string;
	user_id: string;
	user_location: MeasurementLocationScheme;
	device: MeasurementDeviceScheme;
	events: MeasurementEventScheme[];
}

export class MeasurementPayload extends Model {
	@Field(String, { name: "client_id" })
	client: string;

	@Field(String, { name: "user_id" })
	user: string;

	@Field(MeasurementLocation, { name: "user_location" })
	location: MeasurementLocation;

	@Field(MeasurementDevice, { name: "device" })
	device: MeasurementDevice;

	@Field(Array.Of(MeasurementEvent), { name: "events" })
	events: MeasurementEvent[];

	constructor();
	constructor(client: string, user: string, location: MeasurementLocation, device: MeasurementDevice, events: MeasurementEvent[]);
	constructor(client?: string, user?: string, location?: MeasurementLocation, device?: MeasurementDevice, events?: MeasurementEvent[]) {
		if (client === undefined || user === undefined || location === undefined || device === undefined || events === undefined) {
			super();
			return;
		}

		super();
		this.client = client;
		this.user = user;
		this.location = location;
		this.device = device;
		this.events = events;
	}
}
//#endregion
