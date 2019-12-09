import { LitElement, html } from 'lit-element';

import isEqual from 'lodash/isEqual';
import escape from 'lodash/escape';

const minQueryLength = 2;

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
			query: { type: String },
			selectedIndex: { type: Number },
			suggestions: { type: Array },
			handleClick: { type: Function },
			handleHover: { type: Function },
			isFocused: { type: Boolean },
			classNames: { type: Object },
			labelField: { type: String },
			suggestionsContainer: { type: Object }
		};
	}

	shouldUpdate(changedProps) {
		const shouldRenderSuggestions = this.shouldRenderSuggestionsProps || this.shouldRenderSuggestions;
		return (
			this.isFocused !== changedProps.get('isFocused') ||
			!isEqual(changedProps.get('suggestions'), this.suggestions) ||
			shouldRenderSuggestions(this.query) ||
			shouldRenderSuggestions(this.query) !== shouldRenderSuggestions(changedProps.get('query'))
		);
	}

	updated(changedProps) {
		// let suggestionsContainer = this.parentElement.querySelector('component-name');
		if (
			this.suggestionsContainer &&
			changedProps.get('selectedIndex') !== this.selectedIndex
		) {
			const activeSuggestion = this.suggestionsContainer.querySelector(
				this.classNames.activeSuggestion
			);

			if (activeSuggestion) {
				maybeScrollSuggestionIntoView(
					activeSuggestion,
					this.suggestionsContainer
				);
			}
		}
	}

	markIt(input, query) {
		const escapedRegex = query.trim().replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
		const { [this.labelField]: labelValue } = input;

		return {
			__html: labelValue.replace(RegExp(escapedRegex, 'gi'), (x) => {
				return html`<mark>${escape(x)}</mark>`;
			}),
		};
	}

	shouldRenderSuggestions(query) {
		let shouldRender = query.length >= minQueryLength && this.isFocused;
		return shouldRender;
	}

	renderSuggestion(item, query) {
		return html`<span>${item.text}</span>`;
	}

	render() {
		const suggestions = this.suggestions.map((item, i) => {
			return html`
				<li
					@click=${() => {this.handleClick(i)}}
					@mouseDown=${() => {this.handleClick(i)}}
					@touchStart=${() => {this.handleClick(i)}}
					@mouseOver=${this.handleHover.bind(null, i)}
					className=${
						i === this.selectedIndex ? this.classNames.activeSuggestion : ''
					}
				>
					${this.renderSuggestion(item, this.query)}
				</li>
			  `;
		});
		// use the override, if provided
		if (suggestions.length === 0 || !this.shouldRenderSuggestions(this.query)) {
			return null;
		}
		return html`
		<div
			className=${this.classNames.suggestions}>
			<ul> ${suggestions} </ul>
		</div>
		`;
	}
}

customElements.define('lit-suggestions', Suggestions);