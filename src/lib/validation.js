import dedent from "dedent";
/**
 * Validation helper methods
 * @module react-forms
 * @example
 ```javascript
 import form from "sp-react-forms/validation";
 ```
 * @class validation
 */

/**
 * Converts form data and store data into an object that can be
 * passed safely the `validateForm` cerebral action. This can be
 * accessed in the Hoc/decorator by using `getFormValidationData`
 * instead of using this directly for most forms.
 *
 * @method getValidationData
 * @param {Object} form - A form object (usually from the register)
 * @param {Object} storeData - The "fields" object of a form from a baobab store
 * @param {Array} storePath - The path to the form, ie: ["path", "to", "form"]
 */
export const getValidationData = function(form, storeData, storePath) {
	const validationData = {};
	const fields = form.fields;
	for (const prop in fields) {
		const data = storeData[prop];

		let connector;
		if (typeof fields[prop] === "function") {
			connector = fields[prop];
		} else {
			connector = fields[prop].connector;
		}

		if (typeof connector.fromStore !== "function") {
			throw new Error(dedent`
				\n\nConnector for the ${prop} field does not have a fromStore method.
				Create one like so:

				function Connector(data, done) {
				...
				}

				Connector.fromStore = function({ value }) {
				return value;
				};
			`);
		}

		validationData[prop] = {
			value: connector.fromStore(data),
			validators: fields[prop].validators || []
		};
	}

	return {
		fields: {...validationData},
		store: storePath
	};
};
