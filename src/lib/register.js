import _ from "lodash";
import {log} from "./log";

/**
 * @class register
 * @module react-forms
 * @example
 * ```javascript
 * import Form from "sp-react-forms/register";
 * ```
 */
export default class Register {
	/**
	 * Contains all registered forms. Mostly used by actions in this library
	 * @prop registered
	 * @static
	 */
	static registered = {};

	/**
	 * Retrieve a registered form
	 * @method get
	 * @static
	 * @param {String} name - The name of the form. Can be dot notation to indicate depth
	 * @example
	 * ```javascript
	 * Form.get("form");
	 * Form.get("path.to.form");
	 * ```
	 */
	static get(name) {
		const value = _.get(Register.registered, name);
		if (typeof value === "undefined") {
			throw new Error(`Could not find form registered as "${name}"`);
		}
		return value;
	}

	/**
	 * Register a form
	 * @method register
	 * @static
	 * @param {String} name - The name of the form. Can be dot notation to indicate depth
	 * @param {Object} form - And object containing form data
	 * @param {String[]} store - A baobab path to the form
	 * @example
	 * ```javascript
	 * Form.register("myForm", { ... }, ["form"]);
	 * ```
	 */
	static register(name, form, store) {
		log.info(`Registered form "${name}"`);
		_.set(Register.registered, name, {
			form,
			store
		});
	}

	/**
	 * Unregister a form (or all forms)
	 * @method unregister
	 * @static
	 * @param {String} ?name - The name of the form. Can be dot notation to indicate depth
	 * @example
	 * ```javascript
	 * // Remove myForm
	 * Form.unregister("myForm");
	 *
	 * // Remove all forms
	 * Form.unregister();
	 * ```
	 */
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
