import { LitElement, html } from 'lit-element';

import tagStyle from './tag.scss';

class Tag extends LitElement {
	static get properties() {
		return {
			tag: { type: Object },
			onDelete: { type: Function},
			labelField: { type: String}
		};
	}

	static get styles() {
		return [tagStyle];
	}

	render() {
		const label = this.tag[this.labelField];

		return html`
			<div class="tag">
				<span>${label}</span>
				<button type="button" class="tag__remove-btn"
					title="Delete label ${label}" aria-label="Delete label ${label}"
					@click=${() => {this.onDelete(this.tag)}}>
					<svg width="8px" height="8px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M19.803 16l11.41-11.41A2.689 2.689 0 1027.408.789L16 12.198 4.592.787A2.69 2.69 0 10.788 4.59L12.197 16 .787 27.41a2.69 2.69 0 003.804 3.802L16 19.803l11.41 11.41a2.689 2.689 0 103.802-3.804L19.803 16z" fill="currentColor"/>
					</svg>
				</button>
			</div>
		`;
	} 
}

customElements.define('vwo-tag', Tag);