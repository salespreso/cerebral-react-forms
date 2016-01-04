import dedent from "dedent";
import {log} from "../log";
import {servicesCheck} from "../errors";

export const getFormDefaults = function(input, state, output, services) {
	servicesCheck(services);

	const {name} = input;
	const {form} = services.forms[name];
	const fields = {};

	for (const prop in form.fields) {
		const formProp = form.fields[prop];

		let connector = formProp;
		if (typeof connector === "object") {
			connector = formProp.connector;
		}

		if (typeof connector.defaultStoreValue === "object") {
			fields[prop] = connector.defaultStoreValue;
		} else if (typeof connector.defaultStoreValue === "function") {
			fields[prop] = connector.defaultStoreValue(formProp.options || {});
		} else {
			throw new Error(dedent`
				\n\nConnector for the ${prop} field does not have a defaultKey.
				Create one like so:

				function Connector(data, done) {
					...
				}
				Connector.defaultStoreValue = { defaultKey: "" };

				or

				Connector.defaultStoreValue = function(options) { return { defaultKey: "" }; };\n
			`);
		}
	}

	log.debug("Setup store defaults");
	output({ fields });
};
