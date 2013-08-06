var tabid_key = {};
var socket = io.connect('https://localhost:9129');

// this function is global since it should not be overwritten
// on every tab creation!
socket.on('url_client_sync', function (data) {
  // check if the key is mine!
  console.log(data);
  for (tab_id in tabid_key) {
    if (tabid_key[tab_id] == data.key) {
      console.log('came in for tab: ' + tab_id);
      chrome.tabs.update(parseInt(tab_id, 10), {url: data.session.url});
    }
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log(tabId);
  if (tabid_key[tab.id] && changeInfo.status == 'complete') {
    socket.emit('url_server_sync', {
      session:  {
        url:  tab.url
      }, key:  tabid_key[tab.id][0]
    });
  }
});

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    // open a new tab to which we attach
    chrome.tabs.create({}, function (tab) {
      var msg = {
        'type': request.msg,
        'key':  request.key || 0
      };
      // now we need to send this data to the server, get a response
      // start a new tab accordingly and sync it up
      //var socket = io.connect('https://10.66.58.34:9129');
      

      socket.emit('first_request', msg, function (key, resp_url) {
        // if hosting, this is the key
        msg.key = key;
        tabid_key[tab.id] = [key];
        console.log(msg);
        chrome.tabs.update(tab.id, {url: resp_url});
        
      });

    });
  }
);
