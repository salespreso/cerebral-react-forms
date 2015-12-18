/**
 * Higher Order Component to use on React classes for easy auto
 * injection of form helpers (state/validation)
 * @example

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
 * @module react-forms
 * @class hoc
 */
import _ from "lodash";
import React from "react";
import {Decorator as Cerebral} from "cerebral-react";
import {getValidationData} from "./validation";
import dedent from "dedent";
import Log from "sp-log";

const log = Log("forms");

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
		const data = this.props.getFormValidationData();
		this.props.signals.formSubmitted(data);
	}

 ...
 ```
 */
export default function(Component, store, formProps = {}) {
	@Cerebral({ form: store })
	class Hoc extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				form: null
			};
		}

		componentWillMount() {
			this.updateStoreDefaults(formProps);
		}

		componentWillReceiveProps(nextProps) {
			if (this.props.form.fields !== nextProps.form.fields) {
				this.setState({
					form: this.generateFormProps(nextProps)
				});
			}
		}

		updateFields(fields) {
			const updatedFields = {};

			for (const key in fields) {
				const value = fields[key];
				if (formProps.fields[key]) {
					const connector = formProps.fields[key].connector;
					if (typeof connector.toValue === "function") {
						updatedFields[key] = connector.toValue(value, formProps.fields[key].options || {});
					} else {
						throw new Error(dedent`
						\n\nConnector for the ${key} field does not have a toValue method.
						Create one like so:

						function Connector(data, done) {
							...
						}

						Connector.toValue = function(value) {
							return { value };
						};
						`);
					}
				} else {
					throw new Error(dedent`
					Form prop '${key}' does not exist
					`);
				}
			}

			this.props.signals.formDriver.setupFields({
				store,
				fields: {...this.props.form.fields, ...updatedFields}
			});
		}

		updateStoreDefaults(form) {
			const fields = {};

			for (const prop in form.fields) {
				const formProp = form.fields[prop];

				let connector = formProp;
				if (typeof connector === "object") {
					connector = formProp.connector;
				}

				if (typeof connector.defaultValue === "object") {
					fields[prop] = connector.defaultValue;
				} else if (typeof connector.defaultValue === "function") {
					fields[prop] = connector.defaultValue(formProp.options || {});
				} else {
					throw new Error(dedent`
						\n\nConnector for the ${prop} field does not have a defaultKey.
						Create one like so:

						function Connector(data, done) {
							...
						}
						Connector.defaultValue = { defaultKey: "" };

						or

						Connector.defaultValue = function(options) { return { defaultKey: "" }; };\n
						`);
				}
			}

			log.debug("Setup store defaults");
			this.props.signals.formDriver.setupFields.sync({ fields, store });
		}

		signalFactory(name) {
			const {signals} = this.props;

			return (value) => {
				if (!_.isObject(value) || _.isArray(value)) {
					throw new Error(`done must be called with an object. Received '${value}'`);
				}

				// Set signal here
				signals.formDriver.stateChanged.sync({
					store,
					name,
					value
				});
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

		getValidationData(forms) {
			return (name) => {
				const validationData = {};
				const form = forms[name].fields;
				for (const prop in formProps.fields) {
					let data = _.omit(form[prop], _.isFunction);
					data = _.omit(data, "errors");

					validationData[prop] = {
						value: form[prop].getValue(data),
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
			if (!this.state.form) {
				return (<div></div>);
			}

			const {
				// Don't pass our cerebral values to the component
				get,
				form,
				...other
			} = this.props;

			const props = {
				...other,
				form: this.state.form,
				updateFields: this.updateFields.bind(this),
				getFormValidationData: () => {
					return getValidationData(formProps, form.fields, store);
				}
			};

			return (
				<Component {...props} />
			);
		}
	}

	return Hoc;
}
