/**
 * A helper action for setting the form name
 * for subsequent actions. This could easily be
 * replaced by passing "name" to the signal running
 * the actions.
 * @param {String} name - Then name of your form. Can be dot notation
 */
export const setForm = function(name) {
	function action(input, state, output) {
		output({ name });
	}

	action.displayName = `setForm("${name}")`;

	return action;
};
