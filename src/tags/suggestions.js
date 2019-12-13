import { LitElement, html } from 'lit-element';

import { DEFAULT_CLASSNAMES } from './constants';
import isEqual from 'lodash/isEqual';

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

	updated(changedProps) {
		if (
			this.suggestionsContainer &&
			changedProps.get('selectedIndex') !== this.selectedIndex
		) {
			const activeSuggestion = this.suggestionsContainer.querySelector(
				DEFAULT_CLASSNAMES.activeSuggestion
			);

			if (activeSuggestion) {
				maybeScrollSuggestionIntoView(
					activeSuggestion,
					this.suggestionsContainer
				);
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
					class=${ i === this.selectedIndex ? DEFAULT_CLASSNAMES.activeSuggestion : ''}
					>
					${item.name}
				</li>
			  `;
		});

		return html`
			${suggestions.length? html`
				<div
					class=${DEFAULT_CLASSNAMES.suggestions}>
					<ul> ${suggestions} </ul>
				</div>
			`:html``}
		`;
	}
}

customElements.define('lit-suggestions', Suggestions);