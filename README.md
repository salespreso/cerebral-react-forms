# SalesPreso react-forms
> An all in one bridge between cerebral stores and react forms,
including validation and cleaning methods

For this to work, the [signal must be registered](#signal)

##### Example
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

## API Reference
  - [`actions`](#actions)
    - [`.getFormDefaults(String name)`](#getformdefaultsstring-name)
    - [`.setFormErrors(String[] store, Object errors)`](#setformerrorsstring-store-object-errors)
    - [`.setStateValue(String[] store, String name, Any value)`](#setstatevaluestring-store-string-name-any-value)
    - [`.updateFormFields(String name, Object fields)`](#updateformfieldsstring-name-object-fields)
    - [`.validateForm(String name)`](#validateformstring-name)
  - [`hoc`](#hoc)
    - [`this.props.forms`](#thispropsforms)
  - [`decorators`](#decorators)
    - [`default`](#default)
  - [`register`](#register)
    - [`register.registered`](#registerregistered)
    - [`register.get(String name)`](#registergetstring-name)
    - [`register.register(String name, Object form, String[] store)`](#registerregisterstring-name-object-form-string-store)
    - [`register.unregister(String ?name)`](#registerunregisterstring-?name)
  - [`signal`](#signal)
    - [`default`](#default)
  - [`validation`](#validation)
    - [`.getValidationData(Object form, Object storeData, Array storePath)`](#getvalidationdataobject-form-object-storedata-array-storepath)

### `actions`
> Action methods to be used with cerebral and cerebral-react


##### **Methods**
#### `.getFormDefaults(String name)`
Taking the name of the form as an input, this method will
set default values in the store for that form, based on the
default values in the connector. This is often used for
initial setup, but could also be used to clear a form

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
    <td>String</td>
    <td><code>name</code></td>
    <td>Pass the name into the input to set which form to process.</td>
  </tr>
  </tbody>
</table>

###### Example
```javascript
import {getFormDefaults, updateFormFields} from "sp-react-forms/actions";

// Your signal
[
	setForm("yourForm"),
 // Sets the output values defaults based off of each field's connector.
 // After this action you could alter it however you like (perhaps it
 // needs data from a server?)
	getFormDefaults,
 // Finally writes the changes to the store
	updateFormFields
]
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
Ie: ["path", "to", "form"]</td>
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
import {validateForm, setFormErrors} from "sp-react-forms/actions";
import {setForm} from "sp-react-forms/factories";

// Your signal
[
	setForm("yourForm"),
	validateForm, {
		success: [],
		errors: [setFormErrors]
	}
]
```
<br/>
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
Ie: ["path", "to", "form"]</td>
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

// In your form component...
this.props.signals.formDriver.stateChanged.sync({ store, name, value });
```
<br/>
#### `.updateFormFields(String name, Object fields)`
Takes the input name and fields and updates the form's store data
This should be run last after actions have altered a form's data.

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
    <td>String</td>
    <td><code>name</code></td>
    <td>The name of the form you are updating</td>
  </tr>
  <tr>
    <td>Object</td>
    <td><code>fields</code></td>
    <td>An object containing the fields and their
needed values</td>
  </tr>
  </tbody>
</table>

###### Example
```javascript
import {setForm} from "sp-react-forms/factories";
import {getFormDefaults, updateFormFields} from "sp-react-forms/actions";

// Your signal
[
	setForm("yourForm"),
	getFormDefaults,
	updateFormFields
]
```
<br/>
#### `.validateForm(String name)`
A cerebral action for validating your react forms. Generally
this will be the first action in your signal, as it's used
to validate all of your forms inputs and branch off as either
a success or an error.

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
    <td>String</td>
    <td><code>name</code></td>
    <td>the name of the form you wish to validate</td>
  </tr>
  </tbody>
</table>

###### Example
```javascript
// Your signal.js
import {setForm} from "sp-react-forms/factories";
import {validateForm} from "sp-react-forms/actions";
export default [
 setForm("myForm"),
	validateForm, {
		success: [...],
		error: [...]
	}
];
```

### `hoc`
> Higher Order Component to use on React classes for easy auto
injection of form helpers (state/validation)

Register your form:
```javascript
import Form from "sp-react-forms/register";
// ...

const form = {
	fields: {
		password1: {
		connector: InputConnector,
		validators: [NotBlankValidator]
	},
}

Form.register("myForm", form, ["form"]);
```

Render your form:

```javascript
import Form from "sp-react-forms/Hoc";

class MyForm extends React.Component {
	// ...

	handleSubmit(e) {
		e.preventDefault();
		this.props.signals.formSubmitted({ name: "myForm" });
	}
}

export default Form(MyForm, "myForm");
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

\@form("yourForm")
class MyForm extends React.Component {

}
```

### `register`
```javascript
import Form from "sp-react-forms/register";
```
##### **Properties**
#### `register.registered`
Contains all registered forms. Mostly used by actions in this library

<br/>
##### **Methods**
#### `register.get(String name)`
Retrieve a registered form

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
    <td>String</td>
    <td><code>name</code></td>
    <td>The name of the form. Can be dot notation to indicate depth</td>
  </tr>
  </tbody>
</table>

###### Example
```javascript
Form.get("form");
Form.get("path.to.form");
```
<br/>
#### `register.register(String name, Object form, String[] store)`
Register a form

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
    <td>String</td>
    <td><code>name</code></td>
    <td>The name of the form. Can be dot notation to indicate depth</td>
  </tr>
  <tr>
    <td>Object</td>
    <td><code>form</code></td>
    <td>And object containing form data</td>
  </tr>
  <tr>
    <td>String[]</td>
    <td><code>store</code></td>
    <td>A baobab path to the form</td>
  </tr>
  </tbody>
</table>

###### Example
```javascript
Form.register("myForm", { ... }, ["form"]);
```
<br/>
#### `register.unregister(String ?name)`
Unregister a form (or all forms)

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
    <td>String</td>
    <td><code>?name</code></td>
    <td>The name of the form. Can be dot notation to indicate depth</td>
  </tr>
  </tbody>
</table>

###### Example
```javascript
// Remove myForm
Form.unregister("myForm");

// Remove all forms
Form.unregister();
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
#### `.getValidationData(Object form, Object storeData, Array storePath)`
Converts form data and store data into an object that can be
passed safely the `validateForm` cerebral action. This can be
accessed in the Hoc/decorator by using `getFormValidationData`
instead of using this directly for most forms.

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
    <td><code>form</code></td>
    <td>A form object (usually from the register)</td>
  </tr>
  <tr>
    <td>Object</td>
    <td><code>storeData</code></td>
    <td>The "fields" object of a form from a baobab store</td>
  </tr>
  <tr>
    <td>Array</td>
    <td><code>storePath</code></td>
    <td>The path to the form, ie: ["path", "to", "form"]</td>
  </tr>
  </tbody>
</table>


