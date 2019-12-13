import { LitElement, html } from 'lit-element';

import { DEFAULT_CLASSNAMES } from './constants';
import isEqual from 'lodash/isEqual';
import suggestionsStyle from './suggestions.scss';

const maybeScrollSuggestionIntoView = (suggestionEl, suggestionsContainer) => {
	const containerHeight = suggestionsContainer.offsetHeight;
	const suggestionHeight = suggestionEl.offsetHeight;
	const relativeSuggestionTop =
		suggestionEl.offsetTop - suggestionsContainer.scrollTop;

	if (relativeSuggestionTop + suggestionHeight >= containerHeight) {
		suggestionsContainer.scrollTop +=
			relativeSuggestionTop - containerHeight + suggestionHeight;
	} else if (relativeSuggestionTop < 0) {
		suggestionsContainer.scrollTop += relativeSuggestionTop;
	}
};

class Suggestions extends LitElement {
	constructor() {
		super();
		this.suggestionsContainer = this.parentNode;
	}
	static get properties() {
		return {
			selectedIndex: { type: Number },
			suggestions: { type: Array },
			handleClick: { type: Function },
			handleHover: { type: Function },
			isFocused: { type: Boolean },
			suggestionsContainer: { type: Object }
		};
	}

	static get styles() {
		return [suggestionsStyle];
	}

	updated(changedProps) {
		if (
			changedProps.has('selectedIndex')
		) {
			const activeSuggestion = this.shadowRoot.querySelector('.' + DEFAULT_CLASSNAMES.activeSuggestion);
			if (activeSuggestion) {
				maybeScrollSuggestionIntoView(activeSuggestion, activeSuggestion.parentNode);
			}
		}
	}

	render() {
		const suggestions = this.suggestions.map((item, i) => {
			return html`
				<li
					@click=${() => {this.handleClick(i)}}
					@mousedown=${() => {this.handleClick(i)}}
					@touchstart=${() => {this.handleClick(i)}}
					@mouseover=${() => {this.handleHover(i)}}
					class="${DEFAULT_CLASSNAMES.suggestion} ${ i === this.selectedIndex ? DEFAULT_CLASSNAMES.activeSuggestion : ''}"
					>
					${item.name}
				</li>
			  `;
		});

		return html`
			${suggestions.length? html`
				<ul class=${ DEFAULT_CLASSNAMES.suggestions}> ${suggestions} </ul>
			`:html``}
		`;
	}
}

customElements.define('lit-suggestions', Suggestions);