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

			for (const prop in formProps) {
				const formProp = formProps[prop];
				const done = this.signalFactory(prop);
				// Form can be used inside your components as so:
				// <YourComponent {...this.forms.formName.propName.fields} />
				forms[name].fields[prop] = formProp.connector(this.props.form.fields[prop], done);
				forms[name].fields[prop].errors = this.props.form.errors[prop] || [];
			}

			forms[name].errors = this.props.form.errors;
			return forms;
		}

		getValidationData(forms) {
			return (name) => {
				const validationData = {};
				const form = forms[name].fields;
				for (const prop in formProps) {
					validationData[prop] = {
						value: form[prop].value,
						validators: formProps[prop].validators || []
					};
				}
				return {
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
