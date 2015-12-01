import {setStateValue} from "./actions";

export default {
	register(controller) {
		controller.signal("formDriver.stateChanged", [
			setStateValue
		]);
	}
};
