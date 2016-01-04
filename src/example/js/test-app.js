import {application} from "sp-application/decorators";
import setPage from "./factories/set-page";
import {
	validateForm,
	setFormErrors,
	getFormDefaults,
	updateFormFields
} from "lib/actions";
import {setForm} from "lib/factories";
import {setupTestForm} from "./actions/setup-test-form";
import {cleanTestForm} from "./actions/clean-test-form";

@application()
export default class TestApp {
	static get routes() {
		return {
			"/": "mainPageOpened"
		};
	}

	static get signals() {
		return {
			mainPageOpened: [
				setPage("form"),
				// Sets the form name for preceeding actions
				setForm("testform"),
				// Gets values for the store based on the form connector defaults
				getFormDefaults,
				// An action for overwriting the defaults (completely or partially),
				// overwrites the previous output if needed
				setupTestForm,
				// Finally update the field values
				updateFormFields
			],
			formSubmitted: [
				setForm("testform"),
				// A more complicated validation with an action for cleaning.
				// Action checks to make sure that password1 and password2 match
				validateForm, {
					// Run our cleaning function regardless of success or fail
					success: [
						cleanTestForm, {
							success: [],
							error: [setFormErrors]
						}
					],
					error: [
						cleanTestForm, {
							success: [],
							error: []
						},
						// Show the errors regardless
						setFormErrors
					]
				}
			]
		};
	}

	static get store() {
		return {
			form: {
				fields: {},
				errors: {}
			}
		};
	}
}
