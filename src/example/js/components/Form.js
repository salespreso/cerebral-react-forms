import React from "react";
import form from "lib/decorator";
import {TextField, RaisedButton} from "sp-components";
import testForm from "../forms/test-form";

@form(["testapp", "form"], testForm)
class Layout extends React.Component {
	componentDidMount() {
		this.props.updateFields({
			// password1: "foo",
			password2: "bar",
			name: "Hi!",
			age: "28"
		});
	}

	handleSubmit(e) {
		e.preventDefault();
		const data = this.props.getFormValidationData();
		this.props.signals.testapp.formSubmitted(data);
	}

	handleChange(value) {
		const form = this.props.form;
		// An example of how to override the change function. Easy way
		// to do asyncronous actions
		form.fields.age.onChange(value);
	}

	renderError(form, name) {
		return form.errors[name] ? (
			<small style={{ color: "red"}}>{form.errors[name].join(", ")}</small>
		) : null;
	}

	render() {
		const form = this.props.form;

		const errors = [];
		for (const key in form.errors) {
			errors.push(`${key}: ${form.errors[key].join(", ")}`);
		}

		return (
			<div>
				<h2>Form</h2>
				<form onSubmit={this.handleSubmit.bind(this)}>
					{this.renderError(form, "password1")}
					<TextField floatingLabelText="Password1" {...form.fields.password1} />

					{this.renderError(form, "password2")}
					<TextField floatingLabelText="Password2" {...form.fields.password2} />

					{this.renderError(form, "name")}
					<TextField floatingLabelText="Name" {...form.fields.name} />

					{this.renderError(form, "age")}
					<TextField floatingLabelText="Age" {...form.fields.age} onChange={this.handleChange.bind(this)} />
					<RaisedButton label="Submit" primary={true} />
				</form>
			</div>
		);
	}
}

export default Layout;
