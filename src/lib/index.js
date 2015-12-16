/**
 An all in one bridge between cerebral stores and react forms,
 including validation and cleaning methods

 For this to work, the [signal must be registered](#signal)

 @example
 For the following signal:
 ```javascript
 import {validateForm} from "sp-react-forms/actions";

 ...

 controller.signal("formSubmitted", [
	validateForm, {
		success: [],
		error: []
	}
 ]);
 ```

 And the store:
 ```javascript
 {
	form: {
		fields: {
			password1: "",
			password2: ""
		},
		errors: {}
	}
 }
 ```

 You can create a fully working form like so:
 ```javascript
 import React from "react";
 import form from "lib/decorator";

 // Validators are just function that are passed a value.
 // They return a message on error, or true if validation passes
 const NotBlankValidator = function(value) {
 	return value === "" ? "Input should not be blank" : true;
 };

 // Connectors are used to bridge your components into something that
 // your component can understand. In this case, the "onChange" function
 // is what we use to get new values, and "value" is how we pass the
 // data in
 function InputConnector() {
 	return (data, done) => {
 		return {
 			value: data.value,
			// To determine what value will be passed to our validator, modify the object
			// get it
			getValue({ value }) {
				return value;
			},
 			onChange: (e) => {
 				done({ value: e.target.value });
 			}
 		};
 	};
 }

 // The decorator is the neatest method for creating a form. The parameters
 // are as followed:
 // param1: name of the form
 // param2: path to the store
 // param3: data about your form
 \@form("test", ["form"], {
	// Fields contains the connector types and validations for each field
 	fields: {
 		password1: {
 			connector: InputConnector(),
 			validators: [NotBlankValidator]
 		},
 		password2: {
 			connector: InputConnector(),
 			validators: [NotBlankValidator]
 		},
 	},
	// The clean function will be run at the end.You can use this to throw
	// new errors based on the entire form's data, and you can actually use
	// this to modify current fields values and error messages before
	// validation is finally complete
 	clean(data) {
 		if (data.fields.password1 !== data.fields.password2) {
 			data.errors.password1 = ["Password1 must match password2"];
 		}
 		return data;
 	}
 })
 class MyForm extends React.Component {
 	handleSubmit(e) {
 		e.preventDefault();
		// Notice the name passed in matches the first parameter of the
		// form decorator - this gets all the validators and information needed
		// to pass to the validateForm action
 		const data = this.props.getFormValidationData("test");

		// Finally pass the data to the signal, where the first action is the
		// validateForm action
 		this.props.signals.formSubmitted(data);
 	}

 	handleChange(value) {
 		const form = this.props.forms.test;
 		// An example of how to override the change function. Easy way
 		// to do asyncronous actions
 		form.fields.password1.onChange(value);
 	}

 	renderError(form, name) {
		// Errors per form are returned as an array in form.errors for each field
 		return form.errors[name] ? (
 			<small style={{ color: "red"}}>{form.errors[name].join(", ")}</small>
 		) : null;
 	}

 	render() {
 		const form = this.props.forms.test;

		// Our input can now use the values that our form decorator created for us. Input
		// this case it contains the value and onChange function

 		return (
 			<div>
 				<h2>Form</h2>
 				<form onSubmit={this.handleSubmit.bind(this)}>
 					{this.renderError(form, "password1")}
 					<input {...form.fields.password1} onChange={this.handleChange.bind(this)} />

 					{this.renderError(form, "password2")}
 					<input {...form.fields.password2} />
 				</form>
 			</div>
 		);
 	}
 }

 export default MyForm;
 ```


 @module react-forms
 @main react-forms
 */
export {default as decorator} from "./decorator";
export {default as Hoc} from "./Hoc";
export * as actions from "./actions";
export {default as signal} from "./signal";
