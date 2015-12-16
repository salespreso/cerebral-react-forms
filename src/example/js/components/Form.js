import React from "react";
import form from "lib/decorator";
import {TextField, RaisedButton} from "sp-components";

const NotBlankValidator = function(value) {
	return value === "" ? "Input should not be blank" : true;
};

const MustContainPandaValidator = function(value) {
	return value.toLowerCase().indexOf("panda") === -1 ? (
		"There is not enough pandas in this input"
	) : true;
};

const IntegerHigherThan = function(num) {
	return function(value) {
		return parseInt(value, 10) > num ? true : `Number should be higher than ${num}`;
	};
};

function InputConnector() {
	return (data, done) => {
		return {
			value: data.value,
			getValue({ value }) {
				return value;
			},
			onChange: (value) => {
				done({ value });
			}
		};
	};
}

@form("test", ["testapp", "form"], {
	fields: {
		password1: {
			connector: InputConnector(),
			validators: [NotBlankValidator]
		},
		password2: {
			connector: InputConnector(),
			validators: [NotBlankValidator]
		},
		name: {
			connector: InputConnector(),
			validators: [NotBlankValidator, MustContainPandaValidator]
		},
		age: {
			connector: InputConnector(),
			validators: function() {
				return [IntegerHigherThan(20)];
			}
		}
	},
	clean(data) {
		if (data.fields.password1 !== data.fields.password2) {
			data.errors.password1 = ["Password1 must match password2"];
		}
		return data;
	}
})
class Layout extends React.Component {
	handleSubmit(e) {
		e.preventDefault();
		const data = this.props.getFormValidationData("test");
		this.props.signals.testapp.formSubmitted(data);
	}

	handleChange(value) {
		const form = this.props.forms.test;
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
		const form = this.props.forms.test;

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
