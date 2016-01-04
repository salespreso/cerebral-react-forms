// Basic cleaning function to check that password1 is equal
// to password2
export function cleanTestForm(input, state, output) {
	const data = Object.assign({}, input);

	const {password1, password2} = data.cleanData;

	if (!password1 || !password2) {
		output.error();
	} else if (password1 !== password2) {
		data.errors.password1 = ["Password1 must match Password2"];
		output.error(data);
	} else {
		output.success();
	}
}
