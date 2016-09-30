chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
  console.log(response.farewell);
});

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
    console.log(response.farewell);
  });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
  });

/*
chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
    switch(message.type) {
        case "colors-div":
            var divs = document.querySelectorAll("div");
            if(divs.length === 0) {
                alert("There are no any divs in the page.");
            } else {
                for(var i=0; i&lt;divs.length; i++) {
                    divs[i].style.backgroundColor = message.color;
                }
            }
        break;
    }
});
*/
