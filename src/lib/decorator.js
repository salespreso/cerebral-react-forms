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
	}
})
class MyForm extends React.Component {

}
```
 */
export default function(name) {
	return function(Component) {
		return Hoc(Component, name);
	};
}
