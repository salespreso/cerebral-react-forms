import {getValidationData} from "../lib/validation";

function TestConnector(data, done) {
	return {
		value: data.value,
		onChange() {
			done({ value: "" });
		},
		getValue({ value }) {
			return value;
		}
	};
}

function TestValidator() {
	return true;
}

const storePath = ["path", "to", "form"];

context("Validation", function() {
	describe("#getValidationData", function() {
		it("should convert a form into something that can be validated", function() {
			const form = {
				fields: {
					field: {
						connector: TestConnector,
						validators: [TestValidator]
					}
				}
			};

			const fieldData = {
				field: { value: "foo" }
			};

			const data = getValidationData(form, fieldData, storePath);
			assert.equal(data.store, storePath);
			assert.equal(data.fields.field.value, "foo");
			assert.equal(data.fields.field.validators[0], TestValidator);
		});

		it("should work with just a connector", function() {
			const form = {
				fields: {
					field: TestConnector
				}
			};

			const fieldData = {
				field: { value: "foo" }
			};

			const data = getValidationData(form, fieldData, storePath);
			assert.equal(data.store, storePath);
			assert.equal(data.fields.field.value, "foo");
			assert.deepEqual(data.fields.field.validators, []);
		});

		it("should throw an error if no getValue method is on the connector", function() {
			function BrokenConnector(data, done) {
				return {
					value: data.value,
					onChange() {
						done({ value: "" });
					}
				};
			}

			const fields = {
				field: { value: "foo" }
			};

			const form = {
				fields: {
					field: BrokenConnector
				}
			};

			const func = () => getValidationData(form, fields, []);
			assert.throws(func, `Field 'field' requires a connector with a getValue() method`);
		});

		it("should use a clean function if supplied", function() {
			function clean() {}

			const form = {
				fields: {
					field: TestConnector
				},
				clean
			};

			const fieldData = {
				field: { value: "foo" }
			};

			const data = getValidationData(form, fieldData, storePath);
			assert.equal(data.clean, clean);
		});

		it("the default clean method should just return the data entered", function() {
			const form = {};
			const fieldData = {};
			const data = getValidationData(form, fieldData, storePath);
			const dataIn = { foo: "bar" };
			assert.equal(dataIn, data.clean(dataIn));
		});
	});
});
