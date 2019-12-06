import { LitElement } from 'lit-element';

import './remove-component';

class Tag extends LitElement {
	constructor () {
		super();
		this.props.labelField = 'text';
		this.props.readOnly = false;
	}
	static get properties() {
		return {
			props: { type: Object }
		}; 
	}
	render() {
		let { props } = this;
		const label = props.tag[props.labelField];
		return html`
			<span
				onClick=${props.onTagClicked}
				onKeyDown=${props.onTagClicked}
				onTouchStart=${props.onTagClicked}>
				${label}
				<remove-component
					tag=${props.tag}
					className=${classNames.remove}
					removeComponent=${props.removeComponent}
					onClick=${props.onDelete}
					readOnly=${rpropseadOnly}
				/>
			</span>
		`;
	} 
}

customElements.define('tag', Tag);