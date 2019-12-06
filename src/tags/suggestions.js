import { LitElement } from 'lit-element';

import isEqual from 'lodash/isEqual';
import escape from 'lodash/escape';

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
		this.minQueryLength = 2;
		this.suggestionsContainer = this.parentNode;
	}
	static get properties() {
		return {
			query: { type: String },
			selectedIndex: { type: Number },
			suggestions: { type: Array },
			handleClick: { type: Function },
			handleHover: { type: Function },
			minQueryLength: { type: Number },
			shouldRenderSuggestionsProps: { type: Function },
			isFocused: { type: Boolean },
			classNames: { type: Object },
			labelField: { type: String },
			renderSuggestion: { type: Function },
			suggestionsContainer: { type: Object}
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

	markIt = (input, query) => {
		const escapedRegex = query.trim().replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
		const { [this.labelField]: labelValue } = input;

		return {
			__html: labelValue.replace(RegExp(escapedRegex, 'gi'), (x) => {
				return html`<mark>${escape(x)}</mark>`;
			}),
		};
	}

	shouldRenderSuggestions(query) {
		return query.length >= this.minQueryLength && this.isFocused;
	}

	renderSuggestion(item, query) {
		if (typeof this.renderSuggestion === 'function') {
			return this.renderSuggestion(item, query);
		}
		return html`<span dangerouslySetInnerHTML=${this.markIt(item, query)} />`;
	}

	render() {
		const suggestions = this.suggestions.map((item, i) => {
			return html`
				<li
				  onMouseDown=${this.handleClick.bind(null, i)}
				  onTouchStart=${this.handleClick.bind(null, i)}
				  onMouseOver=${this.handleHover.bind(null, i)}
				  className=${
					i === this.selectedIndex ? this.classNames.activeSuggestion : ''
				}>
					${this.renderSuggestion(item, this.query)}
				</li>
			  `;
		});

		// use the override, if provided
		const shouldRenderSuggestions = this.shouldRenderSuggestionsProps || this.shouldRenderSuggestions;
		if (suggestions.length === 0 || !shouldRenderSuggestions(this.query)) {
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

customElements.define('suggestions', Suggestions);