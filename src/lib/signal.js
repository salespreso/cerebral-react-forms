import {setStateValue} from "./actions";
import Forms from "./register";

/**
 * Adds the state update signal needed for updating each field.
 * This needs to be registered on the cerebral controller at
 * the start of the application
 * @example
 * import signal from "sp-react-forms/signal";
 *
 * ...
 *
 * signal.register(controller);
 */
const signal = {
	register(controller) {
		// Add our forms as a service
		controller.services.forms = Forms.registered;

		// Add the Hoc state changed signal
		controller.signal("formDriver.stateChanged", [
			setStateValue
		]);
	}
};

export default signal;
