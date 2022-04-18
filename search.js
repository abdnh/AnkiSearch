chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const data = { selection: window.getSelection().toString().trim() };
    sendResponse(data);
});
