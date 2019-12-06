import { LitElement } from 'lit-element';
import noop from 'lodash/noop';
import uniq from 'lodash/uniq';
import memoizeOne from 'memoize-one';

import './suggestions';
import './tag';

import { buildRegExpFromDelimiters } from './utils';

//Constants
import {
	KEYS,
	DEFAULT_PLACEHOLDER,
	DEFAULT_CLASSNAMES,
	DEFAULT_LABEL_FIELD,
	INPUT_FIELD_POSITIONS,
} from './constants';

class LitelementTags extends LitElement {
	constructor() {
		super();
		this.placeholder = DEFAULT_PLACEHOLDER;
		this.labelField = DEFAULT_LABEL_FIELD;
		this.suggestions = [];
		this.delimiters = [KEYS.ENTER, KEYS.TAB];
		this.autofocus = true;
		this.inline = true; // TODO= Remove in v7.x.x
		this.inputFieldPosition = INPUT_FIELD_POSITIONS.INLINE;
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
			suggestions: { type: Array },
			delimiters: { type: Array },
			autofocus: { type: Boolean },
			inline: { type: Boolean },
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
			handleDrag: { type: Function },
			id: { type: String },
			minQueryLength: { type: Number },
			shouldRenderSuggestions: { type: Function },
			renderSuggestion: { type: Function }
		};
	}

	connectedCallback() {
		if (this.autofocus && !this.readOnly) {
			this.resetAndFocusInput();
		}
	}

	filteredSuggestions(query, suggestions) {
		if (this.handleFilterSuggestions) {
			return this.handleFilterSuggestions(query, suggestions);
		}

		const exactSuggestions = suggestions.filter((item) => {
			return this.getQueryIndex(query, item) === 0;
		});
		const partialSuggestions = suggestions.filter((item) => {
			return this.getQueryIndex(query, item) > 0;
		});
		return exactSuggestions.concat(partialSuggestions);
	}

	getQueryIndex = (query, item) => {
		return item[this.labelField]
			.toLowerCase()
			.indexOf(query.toLowerCase());
	}

	resetAndFocusInput() {
		this.query = '';
		if (this.shadowRoot.querySelector('textInput')) {
			this.shadowRoot.querySelector('textInput').value = '';
			this.shadowRoot.querySelector('textInput').focus();
		}
	}

	handleDelete(i, e) {
		this.handleDeleteProps(i, e);
		if (!this.resetInputOnDelete) {
			this.shadowRoot.querySelector('textInput') && this.shadowRoot.querySelector('textInput').focus();
		} else {
			this.resetAndFocusInput();
		}
		e.stopPropagation();
	}

	handleTagClick(i, e) {
		if (this.handleTagClickProps) {
			this.handleTagClickProps(i, e);
		}
		if (!this.resetInputOnDelete) {
			this.shadowRoot.querySelector('textInput') && this.shadowRoot.querySelector('textInput').focus();
		} else {
			this.resetAndFocusInput();
		}
	}

	handleChange(e) {
		if (this.handleInputChangeProps) {
			this.handleInputChangeProps(e.target.value);
		}

		const query = e.target.value.trim();
		const suggestions = this.filteredSuggestions(query, this.props.suggestions);

		this.query = query;
		this.suggestions = suggestions;
		this.selectedIndex = (this.selectedIndex >= suggestions.length ? suggestions.length - 1 : this.selectedIndex);
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
			if (this.shadowRoot.querySelector('textInput')) {
				this.shadowRoot.querySelector('textInput').value = '';
			}
		}
		this.isFocused = false;
	}

	handleKeyDown(e) {
		const { query, selectedIndex, suggestions, selectionMode } = this;

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

		// when backspace key is pressed and query is blank, delete tag
		if (
			e.keyCode === KEYS.BACKSPACE &&
			query === '' &&
			this.allowDeleteFromEmptyInput
		) {
			this.handleDelete(this.tags.length - 1, e);
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

		this.resetAndFocusInput();
	};

	handleSuggestionClick(i) {
		this.addTag(this.suggestions[i]);
	}

	handleSuggestionHover(i) {
		this.selectedIndex = i;
		this.selectionMode = true;
	}

	moveTag(dragIndex, hoverIndex) {
		const tags = this.tags;

		// locate tags
		const dragTag = tags[dragIndex];

		// call handler with the index of the dragged tag
		// and the tag that is hovered
		this.handleDrag(dragTag, dragIndex, hoverIndex);
	}

	getTagItems = () => {
		const {
			tags,
			labelField,
			removeComponent,
			readOnly
		} = this;
		const moveTag = null;
		return tags.map((tag, index) => {
			return html`
				<Tag
					key=${`${tag.id}-${index}`}
					index=${index}
					tag=${tag}
					labelField=${labelField}
					onDelete=${() => { this.handleDelete(index) }}
					moveTag=${moveTag}
					removeComponent=${removeComponent}
					onTagClicked=${() => { this.handleTagClick(index) }}
					readOnly=${readOnly}
				/>
			`;
		});
	};

	render() {
		const tagItems = this.getTagItems();

		const query = this.query.trim();
		const selectedIndex = this.selectedIndex;
		const suggestions = this.suggestions;

		const {
			placeholder,
			name: inputName,
			id: inputId,
			maxLength,
			inline,
			inputFieldPosition,
		} = this;

		const position = !inline ? INPUT_FIELD_POSITIONS.BOTTOM : inputFieldPosition;

		const tagInput = !this.readOnly ? (
			html`<div>
				<input
					type="text"
					placeholder=${placeholder}
					aria-label=${placeholder}
					onFocus=${this.handleFocus}
					onBlur=${this.handleBlur}
					onChange=${this.handleChange}
					onKeyDown=${this.handleKeyDown}
					onPaste=${this.handlePaste}
					name=${inputName}
					id=${inputId}
					maxLength=${maxLength}
					value=${this.inputValue}
				/>

				<suggestions
					query=${query}
					suggestions=${suggestions}
					labelField=${this.labelField}
					selectedIndex=${selectedIndex}
					handleClick=${this.handleSuggestionClick}
					handleHover=${this.handleSuggestionHover}
					minQueryLength=${this.minQueryLength}
					shouldRenderSuggestions=${this.shouldRenderSuggestions}
					isFocused=${this.isFocused}
					renderSuggestion=${this.renderSuggestion}
				/>
			</div>`
		) : null;

		return html`
			<div>
				${position === INPUT_FIELD_POSITIONS.TOP && tagInput}
				<div>
				${tagItems}
				${position === INPUT_FIELD_POSITIONS.INLINE && tagInput}
				</div>
				${position === INPUT_FIELD_POSITIONS.BOTTOM && tagInput}
			</div>
		`;
	}
}

customElements.define('litelement-tags', LitelementTags);