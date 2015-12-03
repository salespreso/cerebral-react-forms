/**
 * Action methods to be used with cerebral and cerebral-react
 * @class actions
 * @module react-forms
 * @example
 * ```javascript
 * import {setStateValue, validateForm} from "sp-react-forms/actions";
 * ```
 */

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
	const data = this.props.getFormValidationData("test");
	this.props.signals.formSubmitted(data);
 }

 ...
 ```
 */
export const validateForm = (input, state, output) => {
	let cleanData = {};
	let errorData = {};
	const {fields, store, clean} = input;

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
	}

	// Run the clean function. This can modify the validated data,
	// and also has a chance to return errors
	const {fields: cleanFields, errors: cleanErrors} = clean({
		fields: cleanData,
		errors: errorData
	});

	cleanData = Object.assign(cleanData, cleanFields);
	errorData = Object.assign(errorData, cleanErrors);

	const data = {
		...errorData,
		...cleanData,
		fields: undefined,
		store: undefined,
		clean: undefined
	};

	if (Object.keys(errorData).length) {
		output.error(data);
		state.merge(store, {
			errors: errorData,
			isSubmitted: true,
			hasErrors: true
		});
	} else {
		state.merge(store, {
			errors: {},
			isSubmitted: true,
			hasErrors: false
		});
		output.success(data);
	}
};
