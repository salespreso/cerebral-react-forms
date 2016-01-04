/**
 * Use after an error condition after validation fails, either by
 * using the validate action in this lib, or any other action that
 * affects the "errors" field. It expects the input to look like:
 ```javascript
 {
 fieldname1: ["error messages", "go", "here"],
 fieldname2: ["another error message"]
 }
 ```
 * Its input requires:
 * @method setFormErrors
 * @param {String[]} store - A list path the form in your store.
 * Ie: ["path", "to", "form"]
 * @param {Object} errors - An object of fields, containing an array of
 * error messages (as strings)
 * @example
 ```javascript
 import {setFormErrors} from "sp-react-forms/actions";
 ```
 */
export const setFormErrors = function(input, state) {
	const {errors, store} = input;
	state.set(store.concat(["errors"]), errors);
};

setFormErrors.input = {
	errors: Object,
	store: Array
};
