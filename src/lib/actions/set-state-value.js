/**
 * A cerebral action for updating signals. Generally only
 * needed to be used internally by the higher order component
 * in this library. It is called on changing a single input.
 *
 * Its input requires:
 * @method setStateValue
 * @param {String[]} store - A list path the form in your store.
 * Ie: ["path", "to", "form"]
 * @param {String} name - The name of input being updated
 * @param {Any} value - Any serializable value (number, string, boolean, etc)
 * to update in the store
 * @example
 ```javascript
 import {setStateValue} from "sp-react-forms/actions";
 ```
 */
export const setStateValue = (input, state) => {
	const {store, name, value} = input;
	state.set([...store, "fields", name], value);
};

setStateValue.input = {
	store: Array,
	name: String,
	value: (value) => {
		return typeof value !== "undefined";
	}
};
