import React from "react";
import TestUtils from "react/lib/ReactTestUtils";
import Controller from "cerebral";
import Model from "cerebral-baobab";
import signal from "../lib/signal";
import {Container} from "cerebral-react";
import Hoc from "../lib/Hoc";

function createController(store = {}) {
	const model = Model(store);
	const controller = Controller(model);
	signal.register(controller);
	return controller;
}

context("Hoc", function() {
	it("should throw an error if a store does not exist", function() {
		class TestForm extends React.Component {
			render() {
				return <div/>;
			}
		}
		const controller = createController();
		const Form = Hoc(TestForm, "myForm", ["path", "to", "form"], {});
		const root = () => TestUtils.renderIntoDocument(
			<Container controller={controller}>
				<Form />
			</Container>
		);

		assert.throws(root, `Can not find a form at path 'path.to.form'`);
	});

	it("should contain the fields connector values as a prop", function() {
		function TestConnector() {
			return (data, done) => {
				return {
					value: data.value,
					getValue: ({ value }) => value,
					onChange: (value) => done({ value })
				};
			};
		}

		class TestForm extends React.Component {
			render() {
				return <div/>;
			}
		}

		const connector = TestConnector();

		const controller = createController({
			form: {
				fields: {
					testField: { value: "myValue" }
				},
				errors: {}
			}
		});

		const Form = Hoc(TestForm, "myForm", ["form"], {
			fields: {
				testField: connector
			}
		});

		const root = TestUtils.renderIntoDocument(
			<Container controller={controller}>
				<Form />
			</Container>
		);

		const myForm = TestUtils.findRenderedComponentWithType(root, TestForm);
		const testField = myForm.props.forms.myForm.fields.testField;
		assert.equal(testField.value, "myValue");
		assert.isFunction(testField.onChange);
		assert.isArray(testField.errors);
	});

	it("should throw an error if the form fields does not exist", function() {
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

		const Form = Hoc(TestForm, "myForm", ["form"], {});
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
		class TestForm extends React.Component {
			render() {
				return <div/>;
			}
		}

		const controller = createController({
			form: {
				fields: {}
			}
		});

		const Form = Hoc(TestForm, "myForm", ["form"], {});
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
