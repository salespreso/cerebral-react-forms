import {servicesCheck} from "../errors";

export function updateFormFields(input, state, output, services) {
	servicesCheck(services);
	const {name, fields} = input;
	const {store} = services.forms[name];
	state.set([...store, "fields"], fields);
}
