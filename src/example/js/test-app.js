import {application} from "sp-application/decorators";
import setPage from "./factories/set-page";
import {validateForm} from "lib/actions";

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
					error: []
				}
			]
		};
	}

	static get store() {
		return {
			form: {
				fields: {
					password1: { value: "" },
					password2: { value: "" },
					name: { value: "" },
					age: { value: "10" }
				},
				errors: {}
			}
		};
	}
}
