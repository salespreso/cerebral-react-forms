import {application} from "sp-application/decorators";
import setPage from "./factories/set-page";
import {validateForm, setFormErrors} from "lib/actions";

@application()
export default class TestApp {
	static get routes() {
		return {
			"/": "mainPageOpened"
		};
	}

	static get signals() {
		return {
			mainPageOpened: [setPage("form")],
			formSubmitted: [
				validateForm, {
					success: [],
					error: [setFormErrors]
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
