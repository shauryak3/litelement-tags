import { LitElement, html } from 'lit-element';

import './remove-component';

class Tag extends LitElement {
	constructor () {
		super();
		this.labelField = 'text';
		this.readOnly = false;
	}
	static get properties() {
		return {
			tag: { type: Object },
			onTagClicked: { type: Function},
			onDelete: { type: Function},
			readOnly: { type: Boolean},
			labelField: { type: Boolean},
		}; 
	}
	render() {
		const label = this.tag[this.labelField];
		return html`
			<span
				onClick=${this.onTagClicked}
				onKeyDown=${this.onTagClicked}
				onTouchStart=${this.onTagClicked}>
				${label}
				<remove-component
					onClick=${this.onDelete}
					readOnly=${this.readOnly}
				/>
			</span>
		`;
	} 
}

customElements.define('lit-tag', Tag);