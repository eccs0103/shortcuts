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
}

export class ShortcutOpen extends Model {
	static #limit: number = 100;
	static #previewers: RegExp = /TelegramBot|WhatsApp|facebookexternalhit|Slackbot|Discordbot|Twitterbot|LinkedInBot|SkypeUriPreview|vkShare|Viber/i;

	/** Name of the opened shortcut, the part after /to/ (e.g. "4th-floor"). */
	@Field(String, { name: "shortcut" })
	shortcut: string;

	/** Host the shortcut redirects to (e.g. "cheatsheet.eccs.dev"). The full target URL is left out: the registry already knows it and GA cuts values at 100 characters. */
	@Field(String, { name: "target_host" })
	host: string;

	/** The opened shortcut URL (e.g. "https://from.eccs.dev/to/4th-floor"), so the report reads it like any page. */
	@Field(String, { name: "page_location" })
	location: string;

	/** Referer header of the request, cut to 100 characters. Absent when the browser or app sent none, which messengers usually do. */
	@Field(Optional.Of(String), { name: "page_referrer" })
	referrer: string | undefined;

	/** Organisation that owns the visitor's network (e.g. "Ucom CJSC", "Amazon.com, Inc."), from Cloudflare's request.cf.asOrganization. Cloud and hosting providers mark bots. */
	@Field(Optional.Of(String), { name: "network" })
	network: string | undefined;

	/** User-Agent header, cut to 100 characters. The only device hint a redirect has, since no page runs. */
	@Field(Optional.Of(String), { name: "user_agent" })
	agent: string | undefined;

	/** 1 when the User-Agent is a link-preview fetcher (Telegram, WhatsApp, Slack, Discord and the like): the link was pasted into a chat, not opened by a person. 0 otherwise. */
	@Field(Number, { name: "preview" })
	preview: number;

	constructor();
	constructor(shortcut: string, host: string, location: string, referrer: string | null, network: string | null, agent: string | null);
	constructor(shortcut?: string, host?: string, location?: string, referrer?: string | null, network?: string | null, agent?: string | null) {
		if (shortcut === undefined || host === undefined || location === undefined || referrer === undefined || network === undefined || agent === undefined) {
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
	}
}
//#endregion
