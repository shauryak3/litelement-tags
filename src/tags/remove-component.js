import { LitElement, html } from 'lit-element';

const crossStr = String.fromCharCode(215);

class RemoveComponent extends LitElement {
	static get properties () {
		return {
			onClick: { type: Function},
			readOnly: { type: Boolean }
		};
	}

	render() {
		return html`
			${this.readOnly ? html`
				<span />
			`:html`
				<a onClick=${this.onClick} onKeyDown=${this.onClick}>
				${crossStr}
				</a>
			`}
		`;
	}
}

customElements.define('remove-component', RemoveComponent);