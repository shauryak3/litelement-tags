import { LitElement } from 'lit-element';

const crossStr = String.fromCharCode(215);

class RemoveComponent extends LitElement {
	static get properties () {
		return {
			props: { type: Object }
		};
	}

	render() {
		let { props } = this;
		return html`
			<a onClick=${props.onClick} className=${props.className} onKeyDown=${props.onClick}>
				${props.crossStr}
	  		</a>
		`;
	}
}

customElements.define('remove-component', RemoveComponent);