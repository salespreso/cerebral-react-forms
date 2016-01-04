import dedent from "dedent";

export function servicesCheck(services) {
	if (!services.forms) {
		throw new Error(dedent`
			Could not find registered forms in services!

			When creating your cerebral model, make sure to pass the registered
			forms as a service.
		`);
	}
}
