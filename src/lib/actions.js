export const setStateValue = (input, state) => {
	const {store, value} = input;
	state.set(store, value);
};

export const validateForm = (input, state, output) => {
	const cleanData = {};
	const errorData = {};
	const {fields, store} = input;

	for (const field in fields) {
		const {value, validators} = fields[field];
		const responses = validators.map((validator) => {
			return validator(value);
		});
		const errors = [];
		for (const response of responses) {
			if (response === true) {
				cleanData[field] = value;
			} else if (typeof response === "string") {
				errors.push(response);
			}
		}
		if (errors.length) {
			errorData[field] = errors;
		}
	}

	const data = {
		...errorData,
		...cleanData,
		fields: undefined,
		store: undefined
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
