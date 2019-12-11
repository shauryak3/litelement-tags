import { LitElement, html } from 'lit-element';
import noop from 'lodash/noop';
import uniq from 'lodash/uniq';

import './suggestions';
import './tag';

import { buildRegExpFromDelimiters } from './utils';

//Constants
import {
	KEYS,
	DEFAULT_PLACEHOLDER,
	DEFAULT_LABEL_FIELD,
	DEFAULT_CLASSNAMES
} from './constants';


class LitTags extends LitElement {
	constructor() {
		super();
		this.placeholder = DEFAULT_PLACEHOLDER;
		this.labelField = DEFAULT_LABEL_FIELD;
		this.suggestions = this.allSuggestions;
		this.delimiters = [KEYS.ENTER, KEYS.TAB];
		this.autofocus = true;
		this.inline = true;
		this.handleDeleteProps = noop;
		this.handleAddition = noop;
		this.allowDeleteFromEmptyInput = true;
		this.allowAdditionFromPaste = true;
		this.resetInputOnDelete = true;
		this.autocomplete = false;
		this.readOnly = false;
		this.allowUnique = true;
		this.tags = [];
		this.selectionMode = false;
		this.selectedIndex = -1;
		this.isFocused = false;
		this.query = '';
	}

	static get properties() {
		return {
			placeholder: { type: String },
			labelField: { type: String },
			allSuggestions : { type: Array },
			suggestions: { type: Array },
			delimiters: { type: Array },
			autofocus: { type: Boolean },
			inputFieldPosition: { type: String },
			handleAddition: { type: Function },
			allowDeleteFromEmptyInput: { type: Boolean },
			allowAdditionFromPaste: { type: Boolean },
			resetInputOnDelete: { type: Boolean },
			autocomplete: { type: Boolean },
			readOnly: { type: Boolean },
			allowUnique: { type: Boolean },
			tags: { type: Array },
			selectionMode: { type: Boolean },
			selectedIndex: { type: Number },
			isFocused: { type: Boolean },
			query: { type: String },
			handleFilterSuggestions: { type: Function },
			handleTagClickProps: { type: Function },
			handleDeleteProps: { type: Function },
			handleInputChangeProps: { type: Function },
			handleInputFocusProps: { type: Function },
			handleInputBlurProps: { type: Function },
			id: { type: String },
			shouldRenderSuggestions: { type: Function }
		};
	}

	connectedCallback() {
		this.suggestions = this.allSuggestions;
		super.connectedCallback();
		if (this.autofocus && !this.readOnly) {
			this.resetAndFocusInput();
		}
	}

	render() {
		const tagItems = this.getTagItems();
		const query = this.query.trim();
		const selectedIndex = this.selectedIndex;
		const suggestions = this.suggestions;
		const {
			placeholder,
			name: inputName,
			id: inputId,
			maxLength
		} = this;

		return html`
			<div class=${'litelement-tags-wrapper'}>
				<div class=${DEFAULT_CLASSNAMES.selected}>
					${tagItems}
					<input
						class=${DEFAULT_CLASSNAMES.tagInputField}
						type="text"
						placeholder=${placeholder}
						aria-label=${placeholder}
						@focus=${this.handleFocus}
						@blur=${this.handleBlur}
						@input=${this.handleChange}
						@keydown=${this.handleKeyDown}
						@paste=${this.handlePaste}
						name=${inputName}
						id=${inputId}
						maxLength=${maxLength}
					></input>
				</div>
				<lit-suggestions
					query=${query}
					suggestions=${JSON.stringify(suggestions)}
					labelField=${this.labelField}
					selectedIndex=${selectedIndex}
					.handleClick=${(i) => {this.handleSuggestionClick(i)}}
					.handleHover=${(i) => {this.handleSuggestionHover(i)}}
					shouldRenderSuggestions=${this.shouldRenderSuggestions}
					isFocused=${this.isFocused}
				/>
			</div>
		`;
	}

	filteredSuggestions(query, suggestions) {
		if (this.handleFilterSuggestions) {
			return this.handleFilterSuggestions(query, suggestions);
		}

		let exactSuggestions = suggestions.filter((item) => {
			return this.getQueryIndex(query, item) === 0;
		});
		let tagsText = [];
		this.tags.map((tag) => {
			tagsText.push(tag.text);
		})
		let filtered = exactSuggestions.filter((suggestion) => {
			return !tagsText.includes(suggestion.text);
		})
		
		return filtered;
	}

	getQueryIndex(query, item) {
		return item[this.labelField]
			.toLowerCase()
			.indexOf(query.toLowerCase());
	}

	resetAndFocusInput() {
		this.query = '';
		if (this.shadowRoot.querySelector('input')) {
			this.shadowRoot.querySelector('input').value = '';
			this.shadowRoot.querySelector('input').focus();
		}
	}

	handleDelete(id) {
		this.handleDeleteProps(id);
		if (!this.resetInputOnDelete) {
			this.shadowRoot.querySelector('input') && this.shadowRoot.querySelector('input').focus();
		} else {
			this.resetAndFocusInput();
		}
	}

	handleTagClick(i, e) {
		if (this.handleTagClickProps) {
			this.handleTagClickProps(i, e);
		}
		if (!this.resetInputOnDelete) {
			this.shadowRoot.querySelector('input') && this.shadowRoot.querySelector('input').focus();
		} else {
			this.resetAndFocusInput();
		}
	}

	async handleChange(e) {
		const query = this.shadowRoot.querySelector('input').value.trim();
		const suggestions = this.filteredSuggestions(query, this.allSuggestions);
		this.query = query;
		this.suggestions = suggestions;
		this.selectedIndex = (this.selectedIndex >= suggestions.length ? suggestions.length - 1 : this.selectedIndex);
		await this.requestUpdate();
	}

	handleFocus(e) {
		const value = e.target.value;
		if (this.handleInputFocusProps) {
			this.handleInputFocusProps(value);
		}
		this.isFocused = true;
	}

	handleBlur(e) {
		const value = e.target.value;
		if (this.handleInputBlurProps) {
			this.handleInputBlurProps(value);
			if (this.shadowRoot.querySelector('input')) {
				this.shadowRoot.querySelector('input').value = '';
			}
		}
		this.isFocused = false;
	}

	handleKeyDown(e) {
		let { query, selectedIndex, suggestions, selectionMode } = this;
		// hide suggestions menu on escape
		if (e.keyCode === KEYS.ESCAPE) {
			e.preventDefault();
			e.stopPropagation();
			selectedIndex = -1;
			selectionMode = false;
			suggestions = [];
		}

		// When one of the terminating keys is pressed, add current query to the tags.
		// If no text is typed in so far, ignore the action - so we don't end up with a terminating
		// character typed in.
		if (this.delimiters.indexOf(e.keyCode) !== -1 && !e.shiftKey) {
			if (e.keyCode !== KEYS.TAB || this.query !== '') {
				e.preventDefault();
			}

			const selectedQuery =
				selectionMode && selectedIndex !== -1
					? suggestions[selectedIndex]
					: { id: query, [this.labelField]: query };

			if (selectedQuery !== '') {
				this.addTag(selectedQuery);
			}
		}

		// when backspace key is pressed and query is not empty -> update suggestions
		if ( e.keyCode === KEYS.BACKSPACE) {
			this.handleChange();
		}

		// up arrow
		if (e.keyCode === KEYS.UP_ARROW) {
			e.preventDefault();
			selectedIndex = (selectedIndex <= 0 ? suggestions.length - 1 : selectedIndex - 1);
			selectionMode = true;
		}

		// down arrow
		if (e.keyCode === KEYS.DOWN_ARROW) {
			e.preventDefault();
			selectedIndex = (suggestions.length === 0 ? -1 : (selectedIndex + 1) % suggestions.length);
			selectionMode = true;
		}
	}

	handlePaste(e) {
		if (!this.allowAdditionFromPaste) {
			return;
		}
		e.preventDefault();

		const clipboardData = e.clipboardData || window.clipboardData;
		const clipboardText = clipboardData.getData('text');

		const { maxLength = clipboardText.length } = this; 

		const maxTextLength = Math.min(maxLength, clipboardText.length);
		const pastedText = clipboardData.getData('text').substr(0, maxTextLength);

		// Used to determine how the pasted content is split.
		const delimiterRegExp = buildRegExpFromDelimiters(this.delimiters);
		const tags = pastedText.split(delimiterRegExp);

		// Only add unique tags
		uniq(tags).forEach((tag) =>
			this.addTag({ id: tag, [this.labelField]: tag })
		);
	}

	addTag(tag) {
		const { tags, labelField, allowUnique } = this;
		if (!tag.id || !tag[labelField]) {
			return;
		}
		const existingKeys = tags.map((tag) => tag.id.toLowerCase());

		// Return if tag has been already added
		if (allowUnique && existingKeys.indexOf(tag.id.toLowerCase()) >= 0) {
			return;
		}
		if (this.autocomplete) {
			const possibleMatches = this.filteredSuggestions(
				tag[labelField],
				this.suggestions
			);
			if (
				(this.autocomplete === 1 && possibleMatches.length === 1) ||
				(this.autocomplete === true && possibleMatches.length)
			) {
				tag = possibleMatches[0];
			}
		}
		// call method to add
		this.handleAddition(tag);

		// reset the state
		this.query = '';
		this.selectionMode = false;
		this.selectedIndex = -1;
		this.suggestions = this.allSuggestions;
		this.resetAndFocusInput();
	}

	handleSuggestionClick(i) {
		this.addTag(this.suggestions[i]);
	}

	handleSuggestionHover(i) {
		this.selectedIndex = i;
		this.selectionMode = true;
	}

	getTagItems() {
		const {
			tags,
			labelField
		} = this;

		return tags.map((tag) => {
			return html`
				<lit-tag
					tag=${JSON.stringify(tag)}
					labelField=${labelField}
					.onDelete=${(id) => { this.handleDelete(id) }}
				/>
			`;
		});
	}
}

customElements.define('lit-tags', LitTags);