console.log('hello!');
$('<div/>', {
  id: 'myModal',
  html: 'Hello',
  css: {
    'display': 'none'
  }
}).appendTo('body');

$('#myModal').modal();
