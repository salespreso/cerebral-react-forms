/**
 An all in one bridge between cerebral stores and react forms,
 including validation and cleaning methods

 For this to work, the [signal must be registered](#signal)

 @example
There are four processes to creating a form: registering your form, setting up
default values, creating a component, and a cerebral submit signal.

You must register a form before rendering your react component:
```javascript
import Form from "sp-react-forms/register";

// A connector type that you have created
import {InputConnector} from "./connector";

const form = {
	fields: {
		login: InputConnector,
		password: {
			connector: InputConnector,
			validators: [
				function(value) {
					return value.length >= 5 ? true : "Must be a minimum of 5 characters"
				}
			]
		}
	}
};

// Arguments: The name of your form, the form itself, and finally the path to
// where it will be in the baobab store. You can use the name to apply actions
// to the form, like setting up default values or submitting
Form.register("yourform", form, ["path", "to", "form"]);
```

Your baobab store must contain the default values. This could be done manually
to match your connectors, or with actions:
```javascript
import {setForm} from "sp-react-forms/factories";
import {
	getFormDefaults,
	updateFormFields
} from "sp-react-forms/actions";

// Signal called on page load
mainPageOpened: [
	// Sets the form name for preceeding actions
	setForm("yourform"),
	// Gets values for the store based on the form connector defaults
	getFormDefaults,
	// Finally update the field values in the store
	updateFormFields
]
```

You can now create your form using a decorator or a higher order component:
```javascript
import React from "react";
import form from "sp-react-components/decorator";

/@form("testform")
class TestForm extends React.Component {
	render() {
		const form = this.props.form;
		return (
			<form>
				{form.errors.login.join(", ")}
				Login: <input type="text" {...form.fields.login} />

				{form.errors.password.join(", ")}
				Password: <input type="password" {...form.fields.password} />
			</form>
		);
	}
}
```

Lastly you need to be able to submit your form. This signal can run your
validation actions:
```javascript
import {setForm} from "sp-react-forms/factories";
import {
	validateForm,
	setFormErrors
} from "sp-react-forms/actions";

// Your registered signal could look like this:
formSubmitted: [
	// Sets the form name for preceeding actions
	setForm("yourform"),
	// Validates the "yourform" form, and returns cleandata or errors based
	// on the result
	validateForm, {
		// Successfully validated, here you could post something to a server
		// and/or navigate to another page
		success: [],
		// Display the errors on the form
		error: [setFormErrors]
	}
]

// In your react component, you could then trigger the signal on form submit:
<Form onSubmit={this.props.signals.formSubmitted} />
// or from anywhere else in your application...!
```

 @module react-forms
 @main react-forms
 */
export {default as decorator} from "./decorator";
export {default as Hoc} from "./Hoc";
export * as actions from "./actions";
export {default as signal} from "./signal";
