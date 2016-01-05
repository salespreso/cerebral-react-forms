import {servicesCheck} from "../errors";

/**
 * Takes the input name and fields and updates the form's store data
 * This should be run last after actions have altered a form's data.
 * @method updateFormFields
 * @param {String} name - The name of the form you are updating
 * @param {Object} fields - An object containing the fields and their
 * needed values
 * @example
 * import {setForm} from "sp-react-forms/factories";
 * import {getFormDefaults, updateFormFields} from "sp-react-forms/actions";
 *
 * // Your signal
 * [
 *   setForm("yourForm"),
 *   getFormDefaults,
 *   updateFormFields
 * ]
 */
export function updateFormFields(input, state, output, services) {
	servicesCheck(services);
	const {name, fields} = input;
	const {store} = services.forms[name];
	state.set([...store, "fields"], fields);
}
