import {getValidationData} from "../validation";
import {servicesCheck} from "../errors";

function validateInput(field, value) {
	let cleanData;
	let errorData = [];

	let {validators} = field;
	validators = validators || [];

	if (typeof validators === "function") {
		validators = validators();
	}

	if (validators.length) {
		const responses = validators.map((validator) => {
			return validator(value);
		});
		const errors = [];
		for (const response of responses) {
			if (response === true) {
				cleanData = value;
			} else {
				errors.push(response);
			}
		}
		if (errors.length) {
			errorData = errors;
		}
	} else {
		cleanData = value;
	}

	return {
		value: cleanData,
		errors: errorData
	};
}

/**
 * A cerebral action for validating your react forms. Generally
 * this will be the first action in your signal, as it's used
 * to validate all of your forms inputs and branch off as either
 * a success or an error.
 * @method validateForm
 * @param {String} name - the name of the form you wish to validate
 * @example
 * // Your signal.js
 * import {setForm} from "sp-react-forms/factories";
 * import {validateForm} from "sp-react-forms/actions";
 * export default [
 *   setForm("myForm"),
 *   validateForm, {
 *     success: [...],
 *     error: [...]
 *   }
 * ];
 */
export function validateForm(input, state, output, services) {
	servicesCheck(services);
	const {name} = input;
	const {form, store: storePath} = services.forms[name];
	const storeData = state.get([...storePath, "fields"]);
	const {fields, store} = getValidationData(form, storeData, storePath);

	const cleanData = {};
	const errorData = {};
	const fieldData = {};

	// Clean fields separately
	for (const field in fields) {
		const {value} = fields[field];

		const {
			value: fieldValue,
			errors: fieldErrors
		} = validateInput(fields[field], value);

		if (typeof fieldValue !== "undefined") {
			cleanData[field] = value;
		}

		if (fieldErrors.length) {
			errorData[field] = fieldErrors;
		}

		fieldData[field] = value;
	}

	const outputData = { cleanData, errors: errorData, store: storePath };

	if (Object.keys(errorData).length) {
		state.merge(store, {
			isSubmitted: true,
			hasErrors: true
		});
		output.error(outputData);
	} else {
		state.merge(store, {
			errors: {},
			isSubmitted: true,
			hasErrors: false
		});
		output.success(outputData);
	}
}

validateForm.input = {
	name: String
};
