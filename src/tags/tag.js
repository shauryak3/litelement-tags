import { LitElement, html } from 'lit-element';
import ClassNames from 'classnames';
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
			labelField: { type: String},
			classNames: { type: Object}
		}; 
	}
	render() {
		const label = this.tag[this.labelField];
		return html`
			<span
				className=${ClassNames('tag-wrapper', this.classNames.tag)}
				onClick=${this.onTagClicked}
				onKeyDown=${this.onTagClicked}
				onTouchStart=${this.onTagClicked}>
				${label}
				<remove-component
					className=${this.classNames.remove}
					onClick=${this.onDelete}
					readOnly=${this.readOnly}
				/>
			</span>
		`;
	} 
}

customElements.define('lit-tag', Tag);