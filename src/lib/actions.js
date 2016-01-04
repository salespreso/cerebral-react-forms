import dedent from "dedent";
/**
 * Action methods to be used with cerebral and cerebral-react
 * @class actions
 * @module react-forms
 * @example
 ```javascript
 import {
   setStateValue,
   validateForm,
   setFormErrors
 } from "sp-react-forms/actions";
 ```
 */

export const convertToValue = function(form, fields) {
	const updatedFields = {};

	for (const key in fields) {
		const value = fields[key];
		if (form.fields[key]) {
			const connector = form.fields[key].connector;
			if (typeof connector.toStore === "function") {
				updatedFields[key] = connector.toStore(value, form.fields[key].options || {});
			} else {
				throw new Error(dedent`
				\n\nConnector for the ${key} field does not have a toStore method.
				Create one like so:

				function Connector(data, done) {
					...
				}

				Connector.toStore = function(value) {
					return { value };
				};
				`);
			}
		} else {
			throw new Error(dedent`
			Form prop '${key}' does not exist
			`);
		}
	}

	return updatedFields;
};

export * from "./actions/validate-form";
export * from "./actions/set-form-errors";
export * from "./actions/update-form-fields";
export * from "./actions/get-form-defaults";
export * from "./actions/set-state-value";
