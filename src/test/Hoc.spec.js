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
		const TestForm = () => <div></div>;
		const controller = createController();
		const Form = Hoc(TestForm, "myForm", ["path", "to", "form"], {});
		const myForm = <Form />;
		const root = () => TestUtils.renderIntoDocument(
			<Container controller={controller}>
				{myForm}
			</Container>
		);

		assert.throws(root, `Can not find a form at path 'path.to.form'`);
	});
});
