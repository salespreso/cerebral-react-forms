import sinon from "sinon";
import {actions} from "../lib/index";

const {validateForm, setStateValue} = actions;

const state = () => {};
state.set = () => {};
state.merge = () => {};

const output = () => {};
output.success = () => {};
output.error = () => {};

context("Actions", function() {
	describe("#validateForm", function() {
		it("should succeed with no validations", sinon.test(function() {
			const spy = this.spy(output, "success");

			const fields = {
				password: {
					value: "password",
					validators: []
				}
			};

			const input = {
				fields,
				store: [],
				clean: data => data
			};

			validateForm(input, state, output);
			assert.isTrue(spy.called);
		}));

		it("should succeed when validations pass", sinon.test(function() {
			const spy = this.spy(output, "success");

			const fields = {
				password: {
					value: "password",
					validators: [
						function() {
							return true;
						}
					]
				}
			};

			const input = {
				fields,
				store: [],
				clean: data => data
			};

			validateForm(input, state, output);
			assert.isTrue(spy.called);
		}));

		it("should fail when validations fail", sinon.test(function() {
			const spy = this.spy(output, "error");

			const fields = {
				password: {
					value: "password",
					validators: [
						function() {
							return "Failed";
						}
					]
				}
			};

			const input = {
				fields,
				store: [],
				clean: data => data
			};

			validateForm(input, state, output);
			assert.isTrue(spy.called);
		}));

		it("should allow validators to be a function", sinon.test(function() {
			const spy = this.spy(output, "success");

			const fields = {
				password: {
					value: "password",
					validators: function() {
						return [
							function() {
								return true;
							}
						];
					}
				}
			};

			const input = {
				fields,
				store: [],
				clean: data => data
			};

			validateForm(input, state, output);
			assert.isTrue(spy.called);
		}));

		it("should return the fields and their values on success", sinon.test(function() {
			const spy = this.spy(output, "success");

			const fields = {
				password: {
					value: "password"
				}
			};

			const input = {
				fields,
				store: [],
				clean: data => data
			};

			validateForm(input, state, output);
			assert.isTrue(spy.calledWith({ password: "password" }));
		}));

		it("should allow errors to be returned as any type (SP-926)", sinon.test(function() {
			const spy = this.spy(output, "error");

			const fields = {
				password: {
					value: "password",
					validators: [
						function() {
							return { message: "error" };
						}
					]
				}
			};

			const input = {
				fields,
				store: [],
				clean: data => data
			};

			validateForm(input, state, output);
			assert.isTrue(spy.calledWith({ password: [{ message: "error" }] }));
		}));

		it("should return the fields and their error messages on failure", sinon.test(function() {
			const spy = this.spy(output, "error");

			const fields = {
				password: {
					value: "password",
					validators: [
						function() {
							return "error";
						}
					]
				}
			};

			const input = {
				fields,
				store: [],
				clean: data => data
			};

			validateForm(input, state, output);
			assert.isTrue(spy.calledWith({ password: ["error"] }));
		}));

		it("the clean method should have access to all current fields and error values", sinon.test(function() {
			const cleanApi = { clean: data => data };
			const spy = this.spy(cleanApi, "clean");

			const fields = {
				password1: {
					value: "password"
				},
				password2: {
					value: "",
					validators: [() => "error"]
				}
			};
			const input = {
				fields,
				store: [],
				clean: cleanApi.clean
			};

			validateForm(input, state, output);
			assert.isTrue(spy.calledWith({
				fields: {
					password1: "password",
					password2: ""
				},
				errors: {
					password2: ["error"]
				}
			}));
		}));

		it("should allow errors to be added using the clean method", sinon.test(function() {
			const spy = this.spy(output, "error");
			const fields = {};
			const input = {
				fields,
				store: [],
				clean: () => {
					return {
						errors: {
							all: ["error"]
						}
					};
				}
			};

			validateForm(input, state, output);
			assert.isTrue(spy.calledWith({ all: ["error"] }));
		}));

		it("should allow values to be modified in the clean method", sinon.test(function() {
			const spy = this.spy(output, "success");
			const fields = {
				password: {
					value: "password"
				}
			};

			const input = {
				fields,
				store: [],
				clean: (data) => {
					data.fields.password = "password1";
					return data;
				}
			};

			validateForm(input, state, output);
			assert.isTrue(spy.calledWith({ password: "password1" }));
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
});
