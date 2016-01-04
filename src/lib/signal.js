/**
 * @module react-forms
 * @example
 ```javascript
 import form from "sp-react-forms/signal";
 ```
 * @class signal
 */
import {setStateValue} from "./actions";
import Forms from "./register";

/**
 * Adds the state update signal needed for updating each field.
 * This needs to be registered on the cerebral controller at
 * the start of the application
 * @property default
 * @example
 ```javascript
 import signal from "sp-react-forms/signal";

 ...

 signal.register(controller);
 ```
 */
export default {
	register(controller) {
		// Add our forms as a service
		controller.services.forms = Forms.registered;

		// Add the Hoc state changed signal
		controller.signal("formDriver.stateChanged", [
			setStateValue
		]);
	}
};
