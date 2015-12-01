import Hoc from "./Hoc";

export default function(name, store, props = {}) {
	return function(Component) {
		return Hoc(Component, name, store, props);
	};
}
