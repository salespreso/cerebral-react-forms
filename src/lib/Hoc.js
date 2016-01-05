import _ from "lodash";
import React from "react";
import {Decorator as Cerebral} from "cerebral-react";
import Register from "./register";

/**
 * @module react-forms
 * @class actions
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
