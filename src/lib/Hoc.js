/**
 * Higher Order Component to use on React classes for easy auto
 * injection of form helpers (state/validation)
 * @example

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
 * @module react-forms
 * @class hoc
 */
import _ from "lodash";
import React from "react";
import {Decorator as Cerebral} from "cerebral-react";
import Register from "./register";

/**
 Contains the value/update functions from the connector. Alleviates writing
 similar code for updating the state.
 @example
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
 @property this.props.forms
 */

export default function(Component, name) {
	const {store, form: formProps} = Register.get(name);

	@Cerebral({ form: store })
	class Hoc extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				form: this.generateFormProps(props)
			};
		}

		componentWillReceiveProps(nextProps) {
			this.setState({
				form: this.generateFormProps(nextProps)
			});
		}

		signalFactory(name) {
			const {signals} = this.props;

			return (value) => {
				if (!_.isObject(value) || _.isArray(value)) {
					throw new Error(`done must be called with an object. Received '${value}'`);
				}

				// Set signal here
				signals.formDriver.stateChanged.sync({ store, name, value });
			};
		}

		generateFormProps(props) {
			if (typeof props.form === "undefined") {
				throw new Error(`Can not find a form at path '${store.join(".")}'`);
			}

			if (typeof props.form.fields === "undefined") {
				throw new Error(`Can not find stored value '${[...store, "fields"].join(".")}'`);
			}

			if (typeof props.form.errors === "undefined") {
				throw new Error(`Can not find stored value '${[...store, "errors"].join(".")}'`);
			}

			const form = {
				isSubmitted: props.form.isSubmitted || false,
				fields: {},
				errors: {}
			};

			for (const prop in formProps.fields) {
				const formProp = formProps.fields[prop];
				const done = this.signalFactory(prop);

				let connector = formProp;
				if (typeof connector === "object") {
					connector = formProp.connector;
				}

				if (typeof props.form.fields[prop] === "undefined") {
					break;
				}

				// Form can be used inside your components as so:
				// <YourComponent {...this.forms.formName.propName.fields} />
				form.fields[prop] = connector(props.form.fields[prop], done);
				form.fields[prop].errors = props.form.errors[prop] || [];
			}

			form.errors = {...props.form.errors};
			return form;
		}

		render() {
			const {
				// Don't pass our cerebral values to the component
				get,
				form,
				...other
			} = this.props;

			const props = {
				...other,
				form: this.state.form
			};

			return (
				<Component {...props} />
			);
		}
	}

	return Hoc;
}
