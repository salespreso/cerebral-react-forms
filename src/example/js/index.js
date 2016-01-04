import React from "react";
import ReactDOM from "react-dom";
import Controller from "cerebral";
import Model from "cerebral-baobab";
import Router from "cerebral-router";
import {Container} from "cerebral-react";

import {Register, ApplicationRunner} from "sp-application";
import {default as Forms} from "lib/register";

import Layout from "./components/Layout";
import signal from "lib/signal";

let controller;

Register.import("example.js", [
	"test-app"
])
.then(() => {
	const store = ApplicationRunner.createStore();
	const signals = ApplicationRunner.createSignals();
	const routes = ApplicationRunner.createRoutes();

	const services = {
		forms: Forms.registered
	};

	const model = Model(store);
	controller = Controller(model, services);

	// Create our signals before we create the router
	for (const routeName in signals) {
		const actions = signals[routeName];
		controller.signal(routeName, actions);
	}

	signal.register(controller);

	Router(controller, routes, {
		onlyHash: true
	}).trigger();
})
.then(() => {
	ReactDOM.render((
		<Container controller={controller}>
			<Layout />
		</Container>
	), document.getElementById("main"));
});
