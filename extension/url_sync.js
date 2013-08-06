var msg = {
  'type': request.msg,
  'key':  request.key || 0
};
// now we need to send this data to the server, get a response
// start a new tab accordingly and sync it up
var socket = io.connect('http://localhost:9128');

socket.emit('first_request', msg, function (key) {
  // if hosting, this is the key
  msg.key = key;
  console.log(msg);
  chrome.tabs.update(tab.id, {url: 'http://localhost:9128/?key=' + msg.key});

  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.id == tabId && changeInfo.status == 'complete') {
      socket.emit('url_server_sync', {
        session:  {
        url:  tab.url
      }, key:  msg.key
      });
    }
  });
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
