// meme.js
import('node-fetch');

export const trigger = 'meme';
export async function response() {
	const response = await fetch('https://meme-api.com/gimme');
	const json = await response.json();
	return json.url;
}
