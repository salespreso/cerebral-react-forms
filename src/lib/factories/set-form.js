export const setForm = function(name) {
	function action(input, state, output) {
		output({ name });
	}

	action.displayName = `setForm("${name}")`;

	return action;
};
