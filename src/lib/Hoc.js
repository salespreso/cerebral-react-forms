/**
 * Higher Order Component to use on React classes for easy auto
 * injection of form helpers (state/validation)
 * @example
```javascript
import Form from "sp-react-forms/Hoc";

class MyForm extends React.Component {
 // ...
}

export default Form(MyForm, "test", ["testapp", "form"], {
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
 * @module react-forms
 * @class hoc
 */
import React from "react";
import {Decorator as Cerebral} from "cerebral-react";

/**
 Contains the value/update functions from the connector. Alleviates writing
 similar code for updating the state.
 @example
 ```javascript
 // If your connector is the following for a particular field:
 function InputConnector() {
	return (data, done) => {
		return {
			value: data,
			onChange: (value) => {
				done(value);
			}
		};
	};
 }

 // You can access these values like so:
 this.props.forms.yourForm.yourField

 // Which will contain:
 { value: data, onChange={...} }
 ```

 In this example, when `onChange` is called will be passed to the connector, which in turn
 fires a signal to update the store.

 `value` will contain data from the state - this stop a lot of boilerplate having to be written.
 @property this.props.forms
 */

/**
 This gets the validators and values for all of your forms fields, making it easy to
 pass to your signals. Generally this gets passed to a signal where the first action
 is the `validateForm` action in `sp-react-forms/actions`
 @method this.props.getFormValidationData
 @example
 ```javascript
 ...

 handleSubmit(e) {
	e.preventDefault();
		const data = this.props.getFormValidationData("test");
		this.props.signals.formSubmitted(data);
	}

 ...
 ```
 */

export default function(Component, name, store, formProps = {}) {
	@Cerebral({ form: store })
	class Hoc extends React.Component {
		signalFactory(name) {
			const {signals} = this.props;

			return (value) => {
				// Set signal here
				signals.formDriver.stateChanged({
					store,
					name,
					value
				});
			};
		}

		generateFormProps() {
			const forms = this.props.forms || {};
			forms[name] = {
				isSubmitted: this.props.form.isSubmitted || false,
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

				if (typeof this.props.form.fields[prop] === "undefined") {
					throw new Error(`Prop ${prop} not found. Did you forget to add it to the store?`);
				}

				// Form can be used inside your components as so:
				// <YourComponent {...this.forms.formName.propName.fields} />
				forms[name].fields[prop] = connector(this.props.form.fields[prop], done);
				forms[name].fields[prop].errors = this.props.form.errors[prop] || [];
			}

			forms[name].errors = this.props.form.errors;
			return forms;
		}

		getValidationData(forms) {
			return (name) => {
				const validationData = {};
				const form = forms[name].fields;
				for (const prop in formProps.fields) {
					validationData[prop] = {
						value: form[prop].value,
						validators: formProps.fields[prop].validators || []
					};
				}

				return {
					clean: formProps.clean || function(data) {
						return data;
					},
					fields: {...validationData},
					store
				};
			};
		}

		render() {
			const forms = this.generateFormProps();

			const {
				// Don't pass our cerebral values to the component
				form,
				get,
				...other
			} = this.props;

			const props = {
				...other,
				forms,
				getFormValidationData: this.getValidationData(forms)
			};


			return (
				<Component {...props} />
			);
		}
	}

	return Hoc;
}
