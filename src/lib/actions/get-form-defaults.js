import dedent from "dedent";
import {log} from "../log";
import {servicesCheck} from "../errors";
/**
 * @class actions
 * @module react-forms
 */

/**
 * Taking the name of the form as an input, this method will
 * set default values in the store for that form, based on the
 * default values in the connector. This is often used for
 * initial setup, but could also be used to clear a form
 * @method getFormDefaults
 * @param {String} name - Pass the name into the input to set which form to process.
 * @example
 ```javascript
 import {getFormDefaults, updateFormFields} from "sp-react-forms/actions";

 // Your signal
 [
	setForm("yourForm"),
  // Sets the output values defaults based off of each field's connector.
  // After this action you could alter it however you like (perhaps it
  // needs data from a server?)
	getFormDefaults,
  // Finally writes the changes to the store
	updateFormFields
 ]
 ```
 */
export const getFormDefaults = function(input, state, output, services) {
	servicesCheck(services);

	const {name} = input;
	const {form} = services.forms[name];
	const fields = {};

	for (const prop in form.fields) {
		const formProp = form.fields[prop];

		let connector = formProp;
		if (typeof connector === "object") {
			connector = formProp.connector;
		}

		if (typeof connector.defaultStoreValue === "object") {
			fields[prop] = connector.defaultStoreValue;
		} else if (typeof connector.defaultStoreValue === "function") {
			fields[prop] = connector.defaultStoreValue(formProp.options || {});
		} else {
			throw new Error(dedent`
				\n\nConnector for the ${prop} field does not have a defaultKey.
				Create one like so:

				function Connector(data, done) {
					...
				}
				Connector.defaultStoreValue = { defaultKey: "" };

				or

				Connector.defaultStoreValue = function(options) { return { defaultKey: "" }; };\n
			`);
		}
	}

	log.debug("Setup store defaults");
	output({ fields });
};
