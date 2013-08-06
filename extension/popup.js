// options.js sends a message to background.js, which communicates
// with the server sending the join key if given, and then sets up
// a new tab which will be synchronized!
$(function () {

  $('#host').click(function () {
    chrome.runtime.sendMessage({
      'msg': 'host'
    });
  });

  $('#join').click(function () {
    chrome.runtime.sendMessage({
      'msg': 'join',
      'key': parseInt($('#join-id').val(), 10)
    });
  });

});
