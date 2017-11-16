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
  // alert("writing message " + text);
  var $messages, message;
  if (text.trim() === '') {
      return;
  }
  //$('.message_input').val('');
  $messages = $('.messages');
  message_side = side;
  message = new Message({
      text: text,
      message_side: message_side
  });
  message.draw();
  var elem = document.getElementById('chat_body');
  elem.scrollTop = elem.scrollHeight;
  // return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function readRequest(){
  // alert("inizio read");
  // writeMessage('response', 'left');
  // alert("stampato response");
  message_input = document.getElementsByClassName("message_input")[0];
  if(message_input.value != ''){
    document.getElementsByClassName('send_message')[0].style.pointerEvents = 'none';
    console.log(message_input.value);
    writeMessage(message_input.value, 'right');
    message_input.value = '';
    await sleep(1000);
    writeMessage('response', 'left');
    document.getElementsByClassName('send_message')[0].style.pointerEvents = 'auto';
  }
}


function checkSend(e){
  if (e.keyCode == 13 && document.getElementsByClassName("message_input")[0].value != "")
    readRequest();
}
