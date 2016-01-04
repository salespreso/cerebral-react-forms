import _ from "lodash";
import {log} from "./log";

export default class Register {
	static registered = {};

	static get(name) {
		const value = _.get(Register.registered, name);
		if (typeof value === "undefined") {
			throw new Error(`Could not find form registered as "${name}"`);
		}
		return value;
	}

	static register(name, form, store) {
		log.info(`Registered form "${name}"`);
		_.set(Register.registered, name, {
			form,
			store
		});
	}

	static unregister(name = null) {
		if (name === null) {
			log.warn("Unregistering all forms");
			Register.registered = {};
		} else {
			// Throw an error if it doesn't exist
			Register.get(name);
			_.set(Register.registered, name, undefined);
		}
	}
}
