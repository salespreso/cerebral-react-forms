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
		getValue({ value }) {
			return value;
		},
		onChange: (value) => {
			done({ value });
		}
	};
}
InputConnector.defaultValue = { value: "" };
InputConnector.toValue = function(value) {
	return { value };
};

export default {
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
	},
	clean(data) {
		if (data.fields.password1 !== data.fields.password2) {
			data.errors.password1 = ["Password1 must match password2"];
		}
		return data;
	}
};
