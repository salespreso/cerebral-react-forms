import {convertToValue} from "lib/actions";

export const setupTestForm = function(input, state, output, services) {
	const {form} = services.forms.testform;
	const convertedFields = convertToValue(form, {
		password1: "foo",
		password2: "bar",
		name: "Hi!",
		age: "28"
	});

	output({ fields: {...input.fields, ...convertedFields} });
};
