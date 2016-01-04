import Form from "lib/register";

const NotBlankValidator = function(value) {
	return value === "" ? "Input should not be blank" : true;
};

const MustContainPandaValidator = function(value) {
	return value.toLowerCase().indexOf("panda") === -1 ? (
		"There is not enough pandas in this input"
	) : true;
};

const IntegerHigherThan = function(num) {
	return function(value) {
		return parseInt(value, 10) > num ? true : `Number should be higher than ${num}`;
	};
};

function InputConnector(data, done) {
	return {
		value: data.value,
		onChange: (value) => {
			done({ value });
		}
	};
}
InputConnector.defaultStoreValue = { value: "" };

InputConnector.toStore = function(value) {
	return { value };
};

InputConnector.fromStore = function({ value }) {
	return value;
};

const form = {
	fields: {
		password1: {
			connector: InputConnector,
			validators: [NotBlankValidator]
		},
		password2: {
			connector: InputConnector,
			validators: [NotBlankValidator]
		},
		name: {
			connector: InputConnector,
			validators: [NotBlankValidator, MustContainPandaValidator]
		},
		age: {
			connector: InputConnector,
			options: {multiple: true},
			validators: function() {
				return [IntegerHigherThan(20)];
			}
		}
	}
};

Form.register("testform", form, ["testapp", "form"]);
