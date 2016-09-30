chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
console.log(request.type)
console.log(request.name)
    switch(request.type) {
        case "dom-loaded":
          console.log(request.data.myProperty);
        break;
    }
    if (request.name == 'screenshot') {
      chrome.tabs.captureVisibleTab(null, null, function(dataUrl) {
        sendResponse({ screenshotUrl: dataUrl });
      });
    }
    return true;
});
