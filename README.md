# SalesPreso react-forms
> An all in one bridge between cerebral stores and react forms,
including validation and cleaning methods

For this to work, the [signal must be registered](#signal)

##### Example
For the following signal:
```javascript
import {validateForm, setFormErrors} from "sp-react-forms/actions";

...

controller.signal("formSubmitted", [
	validateForm, {
		success: [],
		error: [setFormErrors]
	}
]);
```

And the store:
```javascript
{
	form: {
		fields: {
			password1: { value: "" },
			password2: { value: "" }
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
\@form(["form"], {
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
		const data = this.props.getFormValidationData();

		// Finally pass the data to the signal, where the first action is the
		// validateForm action
		this.props.signals.formSubmitted(data);
	}

	handleChange(value) {
		const form = this.props.form;
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
		const form = this.props.form;

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

## API Reference
  - [`hoc`](#hoc)
    - [`this.props.forms`](#thispropsforms)
    - [`.this.props.getFormValidationData()`](#thispropsgetformvalidationdata)
  - [`actions`](#actions)
    - [`.setStateValue(String[] store, String name, Any value)`](#setstatevaluestring-store-string-name-any-value)
    - [`.validateForm(Object fields, String[] store, Function clean)`](#validateformobject-fields-string-store-function-clean)
    - [`.setFormErrors(String[] store, Object errors)`](#setformerrorsstring-store-object-errors)
  - [`decorators`](#decorators)
    - [`default`](#default)
  - [`signal`](#signal)
    - [`default`](#default)
  - [`validation`](#validation)
    - [`.getValidationData()`](#getvalidationdata)

### `hoc`
> Higher Order Component to use on React classes for easy auto
injection of form helpers (state/validation)

```javascript
import Form from "sp-react-forms/Hoc";

class MyForm extends React.Component {
// ...
}

export default Form(MyForm, ["testapp", "form"], {
	fields: {
		password1: {
			connector: InputConnector(),
			validators: [NotBlankValidator]
		},
		password2: {
			connector: InputConnector(),
			validators: [NotBlankValidator]
		}
	},
	clean(data) {
		if (data.fields.password1 !== data.fields.password2) {
			data.errors.password1 = ["Password1 must match password2"];
		}
		return data;
	}
});
```
##### **Properties**
#### `this.props.forms`
Contains the value/update functions from the connector. Alleviates writing
similar code for updating the state.
###### Example
```javascript
// If your connector is the following for a particular field:
function InputConnector() {
	return (data, done) => {
		return {
			value: data.value,
			onChange: (value) => {
				done({ value });
			}
		};
	};
}

// You can access these values like so:
this.props.form.yourField

// Which will contain:
{ value: data, onChange={...} }
```

In this example, when `onChange` is called will be passed to the connector, which in turn
fires a signal to update the store.

`value` will contain data from the state - this stop a lot of boilerplate having to be written.

<br/>
##### **Methods**
#### `.this.props.getFormValidationData()`
This gets the validators and values for all of your forms fields, making it easy to
pass to your signals. Generally this gets passed to a signal where the first action
is the `validateForm` action in `sp-react-forms/actions`
###### Example
```javascript
...

handleSubmit(e) {
	e.preventDefault();
		const data = this.props.getFormValidationData();
		this.props.signals.formSubmitted(data);
	}

...
```

### `actions`
> Action methods to be used with cerebral and cerebral-react

```javascript
import {
  setStateValue,
  validateForm,
  setFormErrors
} from "sp-react-forms/actions";
```

##### **Methods**
#### `.setStateValue(String[] store, String name, Any value)`
A cerebral action for updating signals. Generally only
needed to be used internally by the higher order component
in this library. It is called on changing a single input.

Its input requires:

<br/>

###### **Params**

<table>
  <thead>
    <tr>
      <th>Type</th>
      <th>Parameter</th>
      <th width="70%">Description</th>
    </tr>
  </thead>
  <tbody>
  <tr>
    <td>String[]</td>
    <td><code>store</code></td>
    <td>A list path the form in your store.
Ie: [&quot;path&quot;, &quot;to&quot;, &quot;form&quot;]</td>
  </tr>
  <tr>
    <td>String</td>
    <td><code>name</code></td>
    <td>The name of input being updated</td>
  </tr>
  <tr>
    <td>Any</td>
    <td><code>value</code></td>
    <td>Any serializable value (number, string, boolean, etc)
to update in the store</td>
  </tr>
  </tbody>
</table>

###### Example
```javascript
import {setStateValue} from "sp-react-forms/actions";
```
<br/>
#### `.validateForm(Object fields, String[] store, Function clean)`
A cerebral action for validating your react forms. Generally
this will be the first action in your signal, as it's used
to validate all of your forms inputs and branch off as either
a success or an error.

<b>Note</b>: you will not need to generally worry about passing the input
data to this action. Instead use the `getFormValidationData` method
that you get from using the Higher Order Component or decorator.

Its input requires:

<br/>

###### **Params**

<table>
  <thead>
    <tr>
      <th>Type</th>
      <th>Parameter</th>
      <th width="70%">Description</th>
    </tr>
  </thead>
  <tbody>
  <tr>
    <td>Object</td>
    <td><code>fields</code></td>
    <td>An object containing fields, which in turn contains
the validations for each field.</td>
  </tr>
  <tr>
    <td>String[]</td>
    <td><code>store</code></td>
    <td>The path to the form in the store, eg: [&quot;path&quot;, &quot;to&quot;, &quot;form&quot;]</td>
  </tr>
  <tr>
    <td>Function</td>
    <td><code>clean</code></td>
    <td>The clean function to pass our data through. This can return
errors and modify the error messages and clean data as needed.</td>
  </tr>
  </tbody>
</table>

###### Example
```javascript
// Your signal.js
import {validateForm} from "sp-react-forms/actions";

export default [
	validateForm, {
		success: [...],
		error: [...]
	}
];

// In your form component, using the HOC or decorator
...

handleSubmit(e) {
	e.preventDefault();
	const data = this.props.getFormValidationData();
	this.props.signals.formSubmitted(data);
}

...
```
<br/>
#### `.setFormErrors(String[] store, Object errors)`
Use after an error condition after validation fails, either by
using the validate action in this lib, or any other action that
affects the "errors" field. It expects the input to look like:
```javascript
{
  fieldname1: ["error messages", "go", "here"],
  fieldname2: ["another error message"]
}
```
Its input requires:

<br/>

###### **Params**

<table>
  <thead>
    <tr>
      <th>Type</th>
      <th>Parameter</th>
      <th width="70%">Description</th>
    </tr>
  </thead>
  <tbody>
  <tr>
    <td>String[]</td>
    <td><code>store</code></td>
    <td>A list path the form in your store.
Ie: [&quot;path&quot;, &quot;to&quot;, &quot;form&quot;]</td>
  </tr>
  <tr>
    <td>Object</td>
    <td><code>errors</code></td>
    <td>An object of fields, containing an array of
error messages (as strings)</td>
  </tr>
  </tbody>
</table>

###### Example
```javascript
import {setFormErrors} from "sp-react-forms/actions";
```

### `decorators`
> Decorator to use on React classes for easy auto
injection of form helpers (state/validation)

```javascript
import form from "sp-react-forms/decorator";
```
##### **Properties**
#### `default`

###### Example
Note to remove the '\' in front of the decorator syntax

```javascript
import form from "sp-react-forms/decorator";

\@form(["testapp", "form"], {
	fields: {
		password1: {
			connector: InputConnector(),
			validators: [NotBlankValidator]
		},
		password2: {
			connector: InputConnector(),
			validators: [NotBlankValidator]
		}
	},
	clean(data) {
		if (data.fields.password1 !== data.fields.password2) {
			data.errors.password1 = ["Password1 must match password2"];
		}
		return data;
	}
})
class MyForm extends React.Component {

}
```

### `signal`
```javascript
import form from "sp-react-forms/signal";
```
##### **Properties**
#### `default`
Adds the state update signal needed for updating each field.
This needs to be registered on the cerebral controller at
the start of the application
###### Example
```javascript
import signal from "sp-react-forms/signal";

...

signal.register(controller);
```

### `validation`
> Validation helper methods

```javascript
import form from "sp-react-forms/validation";
```

##### **Methods**
#### `.getValidationData()`
Converts form data and store data into an object that can be
passed safely the `validateForm` cerebral action. This can be
accessed in the Hoc/decorator by using `getFormValidationData`
instead of using this directly for most forms.

