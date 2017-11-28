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
  // if (text.trim() === '') {
  //     return;
  // }
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

function readRequest(){
  // alert("inizio read");
  // writeMessage('response', 'left');
  // alert("stampato response");
  message_input = document.getElementsByClassName("message_input")[0];
  if(message_input.value != ''){
    document.getElementsByClassName('send_message')[0].style.pointerEvents = 'none';
    console.log(message_input.value);
    writeMessage(message_input.value, 'right');
    var info = { "text" : message_input.value };
    // console.log(info);

    $.ajax({
      type: 'POST',
      url: 'api/v1/ask',
      acceptedLanguage: 'it',
      contentType: 'application/json',
      data: JSON.stringify(info),
      success: function (data) {
          // use data
          console.log(data.action);
          switch(data.action){
            case 'place':
              // console.log(data.nearbyResults);
              var tmp = '';
              if(data.nearbyResults.length > 0){
                tmp = 'Abbiamo trovato: <br />';
                for(i = 0; i < data.nearbyResults.length; i++)
                  tmp += ' - <b>' + data.nearbyResults[i].name + '</b>, ' + data.nearbyResults[i].address + ' <br />';
                tmp += 'Potrebbe essere uno di questi?';
                writeMessage(tmp, 'left');
              } else {
                writeMessage(data.body, 'left');
              }; break;
              default: writeMessage(data.body, 'left');
          }

        }
    });
    message_input.value = '';

    document.getElementsByClassName('send_message')[0].style.pointerEvents = 'auto';
  }
}


function checkSend(e){
  if (e.keyCode == 13 && document.getElementsByClassName("message_input")[0].value != "")
    readRequest();
}
