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
 *
 * <b>Note</b>: you will not need to generally worry about passing the input
 * data to this action. Instead use the `getFormValidationData` method
 * that you get from using the Higher Order Component or decorator.
 *
 * Its input requires:
 * @method validateForm
 * @param {Object} fields - An object containing fields, which in turn contains
 * the validations for each field.
 * @param {String[]} store - The path to the form in the store, eg: ["path", "to", "form"]
 * @param {Function} clean - The clean function to pass our data through. This can return
 * errors and modify the error messages and clean data as needed.
 * @example
 ```javascript
 // Your signal.js
 import {validateForm} from "sp-react-forms/actions";
 export default [
	validateForm, {
		success: [...],
		error: [...]
	}
 ];

 // In your form component, using the HOC or decorator
 ...

 handleSubmit(e) {
	e.preventDefault();
	const data = this.props.getFormValidationData();
	this.props.signals.formSubmitted(data);
 }

 ...
 ```
 */
export const validateForm = (input, state, output, services) => {
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
};

validateForm.input = {
	name: String
};
