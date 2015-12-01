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
					password1: "",
					password2: "",
					name: "",
					age: "10"
				},
				errors: {}
			}
		};
	}
}
