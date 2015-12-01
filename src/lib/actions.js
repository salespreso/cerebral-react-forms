function validateInput(field, value) {
	let cleanData;
	let errorData = [];

	let {validators} = field;

	if (typeof validators === "function") {
		validators = validators();
	}

	const responses = validators.map((validator) => {
		return validator(value);
	});
	const errors = [];
	for (const response of responses) {
		if (response === true) {
			cleanData = value;
		} else if (typeof response === "string") {
			errors.push(response);
		}
	}
	if (errors.length) {
		errorData = errors;
	}

	return {
		value: cleanData,
		errors: errorData
	};
}

export const setStateValue = (input, state) => {
	const {store, name, value} = input;
	state.set([...store, "fields", name], value);
};

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
