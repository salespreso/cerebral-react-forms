import _ from "lodash";
import sinon from "sinon";
import {actions} from "../lib/index";

const {
	validateForm,
	setStateValue,
	setFormErrors
} = actions;

function InputConnector(data, done) {
	return {
		value: data.value,
		onChange: (value) => {
			done({ value });
		}
	};
}
InputConnector.defaultStoreValue = { value: "" };

InputConnector.toStore = function(value) {
	return { value };
};

InputConnector.fromStore = function({ value }) {
	return value;
};

let store = {};

const state = {
	set() {},
	get(args) {
		return _.get(store, args);
	},
	merge() {}
};

const output = () => {};
output.success = () => {};
output.error = () => {};

context("Actions", function() {
	beforeEach(function() {
		store = {};
	});

	describe("#validateForm", function() {
		it("should succeed with no validations", sinon.test(function() {
			const spy = this.spy(output, "success");
			const fields = {
				password: {
					connector: InputConnector
				}
			};

			const services = {
				forms: {
					testform: {
						form: {
							fields
						},
						store: ["testform"]
					}
				}
			};

			store = {
				testform: {
					fields: {
						password: { value: "" }
					},
					errors: {}
				}
			};

			validateForm({ name: "testform" }, state, output, services);
			assert.isTrue(spy.called);
		}));

		it("should succeed when validations pass", sinon.test(function() {
			const spy = this.spy(output, "success");
			const fields = {
				password: {
					connector: InputConnector,
					validators: [
						function() {
							return true;
						}
					]
				}
			};

			const services = {
				forms: {
					testform: {
						form: {
							fields
						},
						store: ["testform"]
					}
				}
			};

			store = {
				testform: {
					fields: {
						password: { value: "" }
					},
					errors: {}
				}
			};

			validateForm({ name: "testform" }, state, output, services);
			assert.isTrue(spy.called);
		}));

		it("should fail when validations fail", sinon.test(function() {
			const spy = this.spy(output, "error");
			const fields = {
				password: {
					connector: InputConnector,
					validators: [
						function() {
							return "Validation failed";
						}
					]
				}
			};

			const services = {
				forms: {
					testform: {
						form: {
							fields
						},
						store: ["testform"]
					}
				}
			};

			store = {
				testform: {
					fields: {
						password: { value: "" }
					},
					errors: {}
				}
			};

			validateForm({ name: "testform" }, state, output, services);
			assert.isTrue(spy.called);
		}));

		it("should allow validators to be a function", sinon.test(function() {
			const spy = this.spy(output, "success");
			const fields = {
				password: {
					connector: InputConnector,
					validators: () => [
						function() {
							return true;
						}
					]
				}
			};

			const services = {
				forms: {
					testform: {
						form: {
							fields
						},
						store: ["testform"]
					}
				}
			};

			store = {
				testform: {
					fields: {
						password: { value: "" }
					},
					errors: {}
				}
			};

			validateForm({ name: "testform" }, state, output, services);
			assert.isTrue(spy.called);
		}));

		it("should return the fields and their values on success", sinon.test(function() {
			const spy = this.spy(output, "success");
			const fields = {
				password: {
					connector: InputConnector,
					validators: () => [
						function() {
							return true;
						}
					]
				}
			};

			const services = {
				forms: {
					testform: {
						form: {
							fields
						},
						store: ["testform"]
					}
				}
			};

			store = {
				testform: {
					fields: {
						password: { value: "hunter2" }
					},
					errors: {}
				}
			};

			validateForm({ name: "testform" }, state, output, services);
			assert.isTrue(spy.calledWith({
				cleanData: { password: "hunter2" },
				errors: {},
				store: ["testform"]
			}));
		}));

		it("should allow errors to be returned as any type (SP-926)", sinon.test(function() {
			const spy = this.spy(output, "error");
			const fields = {
				password: {
					connector: InputConnector,
					validators: [
						function() {
							return { message: "error" };
						}
					]
				}
			};

			const services = {
				forms: {
					testform: {
						form: {
							fields
						},
						store: ["testform"]
					}
				}
			};

			store = {
				testform: {
					fields: {
						password: { value: "hunter2" }
					},
					errors: {}
				}
			};

			validateForm({ name: "testform" }, state, output, services);
			assert.isTrue(spy.calledWith({
				cleanData: {},
				errors: { password: [{ message: "error" }] },
				store: ["testform"]
			}));
		}));

		it("should return the fields and their error messages on failure", sinon.test(function() {
			const spy = this.spy(output, "error");
			const fields = {
				password: {
					connector: InputConnector,
					validators: [
						function() {
							return "error";
						}
					]
				}
			};

			const services = {
				forms: {
					testform: {
						form: {
							fields
						},
						store: ["testform"]
					}
				}
			};

			store = {
				testform: {
					fields: {
						password: { value: "hunter2" }
					},
					errors: {}
				}
			};

			validateForm({ name: "testform" }, state, output, services);
			assert.isTrue(spy.calledWith({
				cleanData: {},
				errors: { password: ["error"] },
				store: ["testform"]
			}));
		}));
	});

	describe("#setStateValue", function() {
		it("should set the correct store field based on the input", sinon.test(function() {
			const spy = this.spy(state, "set");
			const input = {
				store: ["path", "to", "form"],
				name: "password",
				value: "hunter2"
			};

			setStateValue(input, state);
			assert.isTrue(spy.calledWith(["path", "to", "form", "fields", "password"], "hunter2"));
		}));
	});

	describe("#setFormErrors", function() {
		it("should set the correct field errors based on the input", sinon.test(function() {
			const spy = this.spy(state, "set");
			const input = {
				errors: {
					field: ["error message"]
				},
				store: ["path", "to", "form"]
			};

			setFormErrors(input, state);
			assert.isTrue(spy.calledWith(["path", "to", "form", "errors"], {
				field: ["error message"]
			}));
		}));
	});
});
