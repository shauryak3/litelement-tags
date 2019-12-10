import { LitElement, html } from 'lit-element';

import { DEFAULT_CLASSNAMES } from './constants';

class Tag extends LitElement {
	static get properties() {
		return {
			tag: { type: Object },
			onDelete: { type: Function},
			labelField: { type: String}
		}; 
	}

	render() {
		const label = this.tag[this.labelField];

		return html`
			<span
				class=${DEFAULT_CLASSNAMES.tag}>
				${label}
				<a class=${DEFAULT_CLASSNAMES.remove} @click=${() => {this.onDelete(this.tag.id)}}>
					X
				</a>
			</span>
		`;
	} 
}

customElements.define('lit-tag', Tag);