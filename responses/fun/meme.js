// meme.js
import('node-fetch');

module.exports = {
	trigger: 'meme',
	response: async () => {
		const response = await fetch('https://meme-api.com/gimme');
		const json = await response.json();
		return json.url;
	},
};
