import { LitElement, html } from 'lit-element';

import '../src/tags/litelement-tags';
// List of countries in the world
const Countries = [
	'Afghanistan',
	'Albania',
	'Algeria',
	'Andorra',
	'Angola',
	'Anguilla',
	'Antigua & Barbuda',
	'Argentina',
	'Armenia',
	'Aruba',
	'Australia',
	'Austria',
	'Azerbaijan',
	'Bahamas',
	'Bahrain',
	'Bangladesh',
	'Barbados',
	'Belarus',
	'Belgium',
	'Belize',
	'Benin',
	'Bermuda',
	'Bhutan',
	'Bolivia',
	'Bosnia & Herzegovina',
	'Botswana',
	'Brazil',
	'British Virgin Islands',
	'Brunei',
	'Bulgaria',
	'Burkina Faso',
	'Burundi',
	'Cambodia',
	'Cameroon',
	'Cape Verde',
	'Cayman Islands',
	'Chad',
	'Chile',
	'China',
	'Colombia',
	'Congo',
	'Cook Islands',
	'Costa Rica',
	'Cote D Ivoire',
	'Croatia',
	'Cruise Ship',
	'Cuba',
	'Cyprus',
	'Czech Republic',
	'Denmark',
	'Djibouti',
	'Dominica',
	'Dominican Republic',
	'Ecuador',
	'Egypt',
	'El Salvador',
	'Equatorial Guinea',
	'Estonia',
	'Ethiopia',
	'Falkland Islands',
	'Faroe Islands',
	'Fiji',
	'Finland',
	'France',
	'French Polynesia',
	'French West Indies',
	'Gabon',
	'Gambia',
	'Georgia',
	'Germany',
	'Ghana',
	'Gibraltar',
	'Greece',
	'Greenland',
	'Grenada',
	'Guam',
	'Guatemala',
	'Guernsey',
	'Guinea',
	'Guinea Bissau',
	'Guyana',
	'Haiti',
	'Honduras',
	'Hong Kong',
	'Hungary',
	'Iceland',
	'India',
	'Indonesia',
	'Iran',
	'Iraq',
	'Ireland',
	'Isle of Man',
	'Israel',
	'Italy',
	'Jamaica',
	'Japan',
	'Jersey',
	'Jordan',
	'Kazakhstan',
	'Kenya',
	'Kuwait',
	'Kyrgyz Republic',
	'Laos',
	'Latvia',
	'Lebanon',
	'Lesotho',
	'Liberia',
	'Libya',
	'Liechtenstein',
	'Lithuania',
	'Luxembourg',
	'Macau',
	'Macedonia',
	'Madagascar',
	'Malawi',
	'Malaysia',
	'Maldives',
	'Mali',
	'Malta',
	'Mauritania',
	'Mauritius',
	'Mexico',
	'Moldova',
	'Monaco',
	'Mongolia',
	'Montenegro',
	'Montserrat',
	'Morocco',
	'Mozambique',
	'Namibia',
	'Nepal',
	'Netherlands',
	'Netherlands Antilles',
	'New Caledonia',
	'New Zealand',
	'Nicaragua',
	'Niger',
	'Nigeria',
	'Norway',
	'Oman',
	'Pakistan',
	'Palestine',
	'Panama',
	'Papua New Guinea',
	'Paraguay',
	'Peru',
	'Philippines',
	'Poland',
	'Portugal',
	'Puerto Rico',
	'Qatar',
	'Reunion',
	'Romania',
	'Russia',
	'Rwanda',
	'Saint Pierre & Miquelon',
	'Samoa',
	'San Marino',
	'Satellite',
	'Saudi Arabia',
	'Senegal',
	'Serbia',
	'Seychelles',
	'Sierra Leone',
	'Singapore',
	'Slovakia',
	'Slovenia',
	'South Africa',
	'South Korea',
	'Spain',
	'Sri Lanka',
	'St Kitts & Nevis',
	'St Lucia',
	'St Vincent',
	'St. Lucia',
	'Sudan',
	'Suriname',
	'Swaziland',
	'Sweden',
	'Switzerland',
	'Syria',
	'Taiwan',
	'Tajikistan',
	'Tanzania',
	'Thailand',
	'Timor L\'Este',
	'Togo',
	'Tonga',
	'Trinidad & Tobago',
	'Tunisia',
	'Turkey',
	'Turkmenistan',
	'Turks & Caicos',
	'Uganda',
	'Ukraine',
	'United Arab Emirates',
	'United Kingdom',
	'United States of America',
	'Uruguay',
	'Uzbekistan',
	'Venezuela',
	'Vietnam',
	'Virgin Islands (US)',
	'Yemen',
	'Zambia',
	'Zimbabwe',
];

const suggestions = Countries.map((country) => {
	return {
		id: country,
		text: country,
	};
});

const KeyCodes = {
	comma: 188,
	enter: 13,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

class TagApp extends LitElement {
	constructor() {
		super();
		this.tags = [
			{ id: 'Thailand', text: 'Thailand' },
			{ id: 'India', text: 'India' },
		];
	}

	static get properties() {
		return {
			tags: { type: Array }
		};
	}

	handleDelete(id) {
		let tags = this.tags.filter((tag) => tag.id !== id);
		this.tags = tags;
	}

	async handleAddition(tag) {
		this.tags.push(tag);
		await this.requestUpdate();
	}

	render() {
		return html`
			<litelement-tags
				tags=${JSON.stringify(this.tags)}
				suggestions=${JSON.stringify(suggestions)}
				allSuggestions=${JSON.stringify(suggestions)}
				delimiters=${JSON.stringify(delimiters)}
				.handleDeleteProps=${(id) => {this.handleDelete(id)}}
				.handleAddition=${(tag) => {this.handleAddition(tag)}}
			>
			</litelement-tags>
		`;
	}
}

customElements.define('tag-app', TagApp);