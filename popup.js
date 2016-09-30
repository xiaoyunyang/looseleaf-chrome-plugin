$('.dropdown-button').dropdown({
    inDuration: 300,
    outDuration: 225,
    constrain_width: false, // Does not change width of dropdown to that of the activator
    hover: true, // Activate on hover
    gutter: 0, // Spacing from edge
    belowOrigin: false, // Displays dropdown below the button
    alignment: 'left' // Displays dropdown with edge aligned to the left of button
});
$('select').material_select();
/*
$('input.autocomplete').autocomplete({
    data: {
      "Idea": null,
      "Guide": null,
      "Protip": null,
      "Example": null,
      "Resource": null,
      "Reference": null,
      "Hack": null,
    }
  });
  */

var currentTab, // result of chrome.tabs.query of current active tab
    resultWindowId; // window id for putting resulting images

function $_id(id) { return document.getElementById(id); }
function show(id) { $_id(id).style.display = 'block'; }
function hide(id) { $_id(id).style.display = 'none'; }

function getFilename(contentURL) {
    var name = contentURL.split('?')[0].split('#')[0];
    if (name) {
        name = name
            .replace(/^https?:\/\//, '')
            .replace(/[^A-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^[_\-]+/, '')
            .replace(/[_\-]+$/, '');
        name = '-' + name;
    } else {
        name = '';
    }
    return 'screencapture' + name + '-' + Date.now() + '.png';
}


function displayCaptures(filenames) {
    if (!filenames || !filenames.length) {
        show('uh-oh');
        return;
    }

    _displayCapture(filenames);
}

function _displayCapture(filenames, index) {
    index = index || 0;

    var filename = filenames[index];
    var last = index === filenames.length - 1;

    if (currentTab.incognito && index === 0) {
        // cannot access file system in incognito, so open in non-incognito
        // window and add any additional tabs to that window.
        //
        // we have to be careful with focused too, because that will close
        // the popup.
        chrome.windows.create({
            url: filename,
            incognito: false,
            focused: last
        }, function(win) {
            resultWindowId = win.id;
        });
    } else {
        chrome.tabs.create({
            url: filename,
            active: last,
            windowId: resultWindowId,
            openerTabId: currentTab.id,
            index: (currentTab.incognito ? 0 : currentTab.index) + 1 + index
        });
    }

    if (!last) {
        _displayCapture(filenames, index + 1);
    }
}


function errorHandler(reason) {
    show('uh-oh'); // TODO - extra uh-oh info?
}


function progress(complete) {
    if (complete === 0) {
        // Page capture has just been initiated.
        //show('loading');
    }
    else {
        //$('bar').style.width = parseInt(complete * 100, 10) + '%';
    }
}


function splitnotifier() {
    //show('split-image');
}





/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(tab);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

/* Returns a canvas containing a screenshot of $element */

/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
/*
 takeScreenshot: function(callback) {
     chrome.extension.sendMessage({name: 'screenshot'}, function(response) {
         var data = response.screenshotUrl;
         var canvas = document.createElement('canvas');
         var img = new Image();
         img.onload = function() {
             canvas.width = $(window).width();
             canvas.height = $(window).height()
             canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);

             var $canvas = $(canvas);
             $canvas.data('scrollLeft', $(document.body).scrollLeft());
             $canvas.data('scrollTop', $(document.body).scrollTop());

             // Perform callback after image loads
             callback($canvas);
         }
         img.src = data;
     });
 }
*/

function screenshotPage() {

  getCurrentTabUrl(function(tab) {
    var filename = getFilename(tab.url);
    currentTab = tab;
    CaptureAPI.captureToFiles(tab, filename, displayCaptures,
                              errorHandler, progress, splitnotifier);
  });
}

document.addEventListener('DOMContentLoaded', function() {

  var screenshotClick = $_id("screenshot-btn");

  screenshotClick.addEventListener('click', function() {
    screenshotPage();
  });

  getCurrentTabUrl(function(tab) {
    var url = ""+tab.url;
    d3.select("#page-url").attr("value", tab.url);
    console.log(d3.select("#page-url"))
    d3.select("#page-title").text(tab.title);
  });
});
