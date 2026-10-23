"use strict";

import "adaptive-extender/core";
import { Field, Model } from "adaptive-extender/core";

//#region Shortcuts environment
export interface ShortcutsEnvironmentScheme {
	MEASUREMENT_SECRET: string;
}

export class ShortcutsEnvironment extends Model {
	@Field(String, { name: "MEASUREMENT_SECRET" })
	secret: string;
}
//#endregion
