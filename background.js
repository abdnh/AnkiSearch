// Some code is adapted from Yomichan (https://github.com/FooSoft/yomichan)

const server = "http://127.0.0.1:8765";

function isObject(value) {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function invokeAnki(action, params) {
	let response;
	try {
		response = await fetch(server, {
			method: 'POST',
			mode: 'cors',
			cache: 'default',
			credentials: 'omit',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer',
			body: JSON.stringify({ action, params, version: 6 })
		});
	} catch (e) {
		const error = new Error('Anki connection failure');
		error.data = { action, params, originalError: e };
		throw error;
	}

	if (!response.ok) {
		const error = new Error(`Anki connection error: ${response.status}`);
		error.data = { action, params, status: response.status };
		throw error;
	}

	let responseText = null;
	let result;
	try {
		responseText = await response.text();
		result = JSON.parse(responseText);
	} catch (e) {
		const error = new Error('Invalid Anki response');
		error.data = { action, params, status: response.status, responseText, originalError: e };
		throw error;
	}
	if (isObject(result)) {
		const apiError = result.error;
		if (apiError) {
			const error = new Error(`Anki error: ${apiError}`);
			error.data = { action, params, status: response.status, apiError };
			throw error;
		}
	}
	return result;
}

function escapeAnkiSearch(text) {
	text = text.replace('"', '\\"');
	text = text.replace('_', '\_');
	text = text.replace('*', '\*');
	text = `"${text}"`;
	return text;
}

chrome.commands.onCommand.addListener((command) => {
	chrome.tabs.query({ active: true, currentWindow: true, }, (tabs) => {
		const activeTab = tabs[0];
		chrome.tabs.sendMessage(
			activeTab.id,
			true, (response) => {
				if (!response.selection) return;
				const text = escapeAnkiSearch(response.selection);
				invokeAnki('guiBrowse', { query: text });
			}
		);
	});
});
