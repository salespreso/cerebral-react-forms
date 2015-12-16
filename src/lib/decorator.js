/**
 * Decorator to use on React classes for easy auto
 * injection of form helpers (state/validation)
 * @module react-forms
 * @example
 ```javascript
 import form from "sp-react-forms/decorator";
 ```
 * @class decorators
 */
import Hoc from "./Hoc";

/**
 * @property default
 * @example

Note to remove the '\' in front of the decorator syntax

```javascript
import form from "sp-react-forms/decorator";

\@form(["testapp", "form"], {
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
})
class MyForm extends React.Component {

}
```
 */
export default function(store, props = {}) {
	return function(Component) {
		return Hoc(Component, store, props);
	};
}
