import React from "react";
import {Decorator as Cerebral} from "cerebral-react";
import Form from "./Form";

@Cerebral({
	page: "page"
})
class Layout extends React.Component {
	render() {
		let component;

		switch (this.props.page) {
			case "form":
				component = <Form />;
				break;
			case "complete":
				component = "TODO";
				break;
			default:
				component = "Unknown";
				break;
		}

		return (
			<div className="sp-grid sp-grid--5">
				<div className="sp-col--1" />
				<div className="sp-col--3">{component}</div>
				<div className="sp-col--1" />
			</div>
		);
	}
}

export default Layout;
