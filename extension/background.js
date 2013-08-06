var tabid_key = {};

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tabid_key[tab.id] && tabid_key[tab.id][1] && changeInfo.status == 'complete') {
    //var socket = tabid_key[1];
    var socket = tabid_key[tab.id][1];
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
      var socket = io.connect('https://10.66.58.34:9129');

      socket.emit('first_request', msg, function (key, resp_url) {
        // if hosting, this is the key
        msg.key = key;
        tabid_key[tab.id] = [key, socket];
        console.log(msg);
        chrome.tabs.update(tab.id, {url: resp_url});
        
      });

      // now we set up a listener for url_sync, which we get
      // from the server
      socket.on('url_client_sync', function (data) {
        // check if the key is mine!
        console.log(data);
        if (data.key == msg.key) {
          chrome.tabs.update(tab.id, {url: data.session.url});
        }
      });

    });
  }
);
