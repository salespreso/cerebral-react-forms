import React from "react";
import TestUtils from "react/lib/ReactTestUtils";

import Controller from "cerebral";
import Model from "cerebral-baobab";
import {Container} from "cerebral-react";

import signal from "../lib/signal";
import Hoc from "../lib/Hoc";
import FormRegister from "../lib/register";

function createController(store = {}) {
	const model = Model(store);
	const controller = Controller(model);
	signal.register(controller);
	return controller;
}

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

context("Hoc", function() {
	beforeEach(function() {
		FormRegister.unregister();
	});

	it("should throw an error if a store does not exist", function() {
		FormRegister.register("testform", {}, ["path", "to", "form"]);

		class TestForm extends React.Component {
			render() {
				return <div/>;
			}
		}
		const controller = createController();
		const Form = Hoc(TestForm, "testform");
		const root = () => TestUtils.renderIntoDocument(
			<Container controller={controller}>
				<Form />
			</Container>
		);

		assert.throws(root, `Can not find a form at path 'path.to.form'`);
	});

	it("should contain the fields connector values as a prop", function() {
		const form = {
			fields: {
				testField: InputConnector
			}
		};

		FormRegister.register("testform", form, ["path", "to", "form"]);

		class TestForm extends React.Component {
			render() {
				return <div/>;
			}
		}
		const controller = createController({
			path: {
				to: {
					form: {
						fields: {
							testField: { value: "myValue" }
						},
						errors: {}
					}
				}
			}
		});
		const Form = Hoc(TestForm, "testform");
		const root = TestUtils.renderIntoDocument(
			<Container controller={controller}>
				<Form />
			</Container>
		);

		const myForm = TestUtils.findRenderedComponentWithType(root, TestForm);
		const testField = myForm.props.form.fields.testField;
		assert.equal(testField.value, "myValue");
		assert.isFunction(testField.onChange);
		assert.isArray(testField.errors);
	});

	it("should throw an error if the form fields does not exist", function() {
		const form = {
			fields: {
				testField: InputConnector
			}
		};

		FormRegister.register("testform", form, ["form"]);

		class TestForm extends React.Component {
			render() {
				return <div/>;
			}
		}
		const controller = createController({
			form: {
				errors: {}
			}
		});
		const Form = Hoc(TestForm, "testform");
		const render = () => {
			const root = TestUtils.renderIntoDocument(
					<Container controller={controller}>
					<Form />
					</Container>
			);
			TestUtils.findRenderedComponentWithType(root, TestForm);
		};

		assert.throws(render, `Can not find stored value 'form.fields'`);
	});

	it("should throw an error if the form errors does not exist", function() {
		const form = {
			fields: {
				testField: InputConnector
			}
		};

		FormRegister.register("testform", form, ["form"]);

		class TestForm extends React.Component {
			render() {
				return <div/>;
			}
		}
		const controller = createController({
			form: {
				fields: {
					testField: { value: "myValue" }
				}
			}
		});
		const Form = Hoc(TestForm, "testform");
		const render = () => {
			const root = TestUtils.renderIntoDocument(
				<Container controller={controller}>
					<Form />
				</Container>
			);
			TestUtils.findRenderedComponentWithType(root, TestForm);
		};

		assert.throws(render, `Can not find stored value 'form.errors'`);
	});
});
