You must register the sp-react-forms on the cerebral controller for the library to work:

```javascript
import signal from "sp-react-forms/signal";
import Controller from "cerebral";
import Model from "cerebral-baobab";

const model = Model({});
const controller = Controller(model);

signal.register(controller);
```
