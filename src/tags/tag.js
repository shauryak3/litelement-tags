import { LitElement } from 'lit-element';

import './remove-component';

class Tag extends LitElement {
	constructor () {
		super();
	}
	static get properties() {
		return {

		}; 
	}
	render() {
		return html`
			<span
				className=${ClassNames('tag-wrapper', classNames.tag, className)}
				style=${{opacity: isDragging ? 0 : 1, 'cursor': canDrag(props) ? 'move' : 'auto'}}
				onClick=${props.onTagClicked}
				onKeyDown=${props.onTagClicked}
				onTouchStart=${props.onTagClicked}>
				{label}
				<remove-component
					tag=${props.tag}
					className=${classNames.remove}
					removeComponent=${props.removeComponent}
					onClick=${props.onDelete}
					readOnly=${readOnly}
				/>
			</span>
		`;
	} 
}

customElements.define('tag', Tag);