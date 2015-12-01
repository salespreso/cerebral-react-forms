import React from "react";
import {Decorator as Cerebral} from "cerebral-react";

// Store data has to look like the following:
// {
// 	fields: {
// 		foo: "foo"
// 	},
// 	errors: {}
// }
export default function(Component, name, store, formProps = {}) {
	@Cerebral({ form: store })
	class Hoc extends React.Component {
		signalFactory(name) {
			const {signals} = this.props;

			return (value) => {
				// Set signal here
				signals.formDriver.stateChanged({
					store: [...store, "fields", name],
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
