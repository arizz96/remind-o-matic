var Message;
Message = function (arg) {
    this.text = arg.text, this.message_side = arg.message_side;
    this.draw = function (_this) {
        return function () {
            var $message;
            $message = $($('.message_template').clone().html());
            $message.addClass(_this.message_side).find('.text').html(_this.text);
            $('.messages').append($message);
            return setTimeout(function () {
                return $message.addClass('appeared');
            }, 0);
        };
    }(this);
    return this;
};

function writeMessage (text, side) {
  alert("writing message " + text);
  var $messages, message;
  if (text.trim() === '') {
      return;
  }
  $('.message_input').val('');
  $messages = $('.messages');
  message_side = side;
  message = new Message({
      text: text,
      message_side: message_side
  });
  message.draw();
  return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
};

function readRequest(){
  message_input = document.getElementsByClassName("message_input")[0];
  if(message_input != ""){
    writeMessage(message_input.value, 'right');
    message_input.innerHTML = "";
    // writeMessage('response', 'left');
  }
}


function checkSend(e){
  if (e.keyCode == 13 && document.getElementsByClassName("message_input")[0].value != "")
    readRequest();
}
