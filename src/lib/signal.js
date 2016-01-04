/**
 * @module react-forms
 * @example
 ```javascript
 import form from "sp-react-forms/signal";
 ```
 * @class signal
 */
import {setStateValue} from "./actions";

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
		controller.signal("formDriver.stateChanged", [
			setStateValue
		]);
	}
};
