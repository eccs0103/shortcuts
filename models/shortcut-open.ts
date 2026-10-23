"use strict";

import "adaptive-extender/core";
import { Field, Model, Optional } from "adaptive-extender/core";

//#region Shortcut open
export interface ShortcutOpenScheme {
	shortcut: string;
	target_host: string;
	page_location: string;
	page_referrer: string | undefined;
	network: string | undefined;
	user_agent: string | undefined;
	preview: number;
	session_id: number;
	engagement_time_msec: number;
}

export class ShortcutOpen extends Model {
	static #limit: number = 100;
	static #engagement: number = 1;
	static #previewers: RegExp = /TelegramBot|WhatsApp|facebookexternalhit|Slackbot|Discordbot|Twitterbot|LinkedInBot|SkypeUriPreview|vkShare|Viber/i;

	@Field(String, { name: "shortcut" })
	shortcut: string;

	@Field(String, { name: "target_host" })
	host: string;

	@Field(String, { name: "page_location" })
	location: string;

	@Field(Optional.Of(String), { name: "page_referrer" })
	referrer: string | undefined;

	@Field(Optional.Of(String), { name: "network" })
	network: string | undefined;

	@Field(Optional.Of(String), { name: "user_agent" })
	agent: string | undefined;

	@Field(Number, { name: "preview" })
	preview: number;

	@Field(Number, { name: "session_id" })
	session: number;

	@Field(Number, { name: "engagement_time_msec" })
	engagement: number;

	constructor();
	constructor(shortcut: string, host: string, location: string, referrer: string | null, network: string | null, agent: string | null, session: number);
	constructor(shortcut?: string, host?: string, location?: string, referrer?: string | null, network?: string | null, agent?: string | null, session?: number) {
		if (shortcut === undefined || host === undefined || location === undefined || referrer === undefined || network === undefined || agent === undefined || session === undefined) {
			super();
			return;
		}

		super();
		const limit = ShortcutOpen.#limit;
		this.shortcut = shortcut;
		this.host = host;
		this.location = location;
		this.referrer = referrer?.slice(0, limit) ?? undefined;
		this.network = network ?? undefined;
		this.agent = agent?.slice(0, limit) ?? undefined;
		this.preview = Number(agent !== null && ShortcutOpen.#previewers.test(agent));
		this.session = session;
		this.engagement = ShortcutOpen.#engagement;
	}
}
//#endregion
