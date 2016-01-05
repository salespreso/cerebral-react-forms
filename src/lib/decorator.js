import Hoc from "./Hoc";

/**
 * Decorator to use on React classes for easy auto
 * injection of form helpers (state/validation)
 * @param {String} name - Then name of your form. Can be dot notation
 * @return {Function}
 * @example
 * @form("yourForm")
 * class MyForm extends React.Component {
 *  // ...
 * }
 */
export default function decorator(name) {
	return function(Component) {
		return Hoc(Component, name);
	};
}
