function startSession() {
  $.ajax({
    type: 'GET',
    url: 'api/v1/welcome',
    acceptedLanguage: 'it',
    contentType: 'application/json',
    success: function (data) {
        writeMessage(data.body, 'left');
      }
  });
  _showTextInput(true);
  document.getElementsByClassName("message_input")[0].focus();
}

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
  var $messages, message;
  $messages = $('.messages');
  message_side = side;
  message = new Message({
      text: text,
      message_side: message_side
  });
  message.draw();
  var elem = document.getElementById('chat_body');
  elem.scrollTop = elem.scrollHeight;
};

var nearByData = {};

function readRequest(){
  message_input = document.getElementsByClassName("message_input")[0];
  if(message_input.value != ''){
    document.getElementsByClassName('send_message')[0].style.pointerEvents = 'none';
    writeMessage(message_input.value, 'right');
    var info = { "text" : message_input.value };
    $.ajax({
      type: 'POST',
      url: 'api/v1/ask',
      acceptedLanguage: 'it',
      contentType: 'application/json',
      data: JSON.stringify(info),
      success: function (data) {
          switch(data.action){
            case 'search':
              if(data.nearbyResults.length > 0) {
                nearByData = data;
                if(data.nearbyResults.length > 5)
                  _formatFirstButton(data);
                else
                  _formatMoreButton(true);

              } else {
                $.ajax({
                  type: 'POST',
                  url: 'api/v1/push',
                  acceptedLanguage: 'it',
                  contentType: 'application/json',
                  data: JSON.stringify({ type: 'error'}),
                  success: function (data) {
                    writeMessage("Non è stato trovato nessun posto del tipo cercato. Ricordi qualcosa altro?", 'left');
                  }
                });
                document.getElementsByClassName('send_message')[0].style.pointerEvents = 'auto';
                document.getElementsByClassName("message_input")[0].focus();
              }
              break;
            case 'finish':
              writeMessage(data.body, 'left');
              location.href='#popup';
              writeInfo('Yeees!', data.body, 'Prova di nuovo', 'index.html');
              break;
            case 'error_finish':
              writeMessage(data.body, 'left');
              location.href='#popup';
              writeInfo('Sorry', data.body, 'Prova di nuovo', 'index.html');
              break;
            case 'server_error':
              writeMessage(data.body, 'left');
              location.href='#popup';
              writeInfo('Sorry', data.body, 'Prova di nuovo', 'index.html');
              break;
            default: writeMessage(data.body, 'left');
          }
        }
    });
    message_input.value = '';
    document.getElementsByClassName('send_message')[0].style.pointerEvents = 'auto';
  }
  document.getElementsByClassName("message_input")[0].focus();
}

function _showTextInput(flag) {
  if(flag) {
    document.getElementById('button_poi_div').innerHTML = '';
    document.getElementById('button_poi_div').style.visibility = 'hidden';
    document.getElementById('text_input_div').style.visibility = 'visible';
    document.getElementById('button_send').style.visibility = 'visible';
  } else {
    document.getElementById('button_poi_div').style.visibility = 'visible';
    document.getElementById('text_input_div').style.visibility = 'hidden';
    document.getElementById('button_send').style.visibility = 'hidden';
  }
}

function _formatMoreButton(first) {
  tmp = nearByData.body + '<br />';
  button_input_div = document.getElementById('button_poi_div');
  button_input_div.innerHTML = '';
  for(i = (first?0 : 5); i < nearByData.nearbyResults.length; i++) {
    tmp += '- <b>' + _sanitizeString(nearByData.nearbyResults[i].name) + '</b>,' +  _sanitizeString(nearByData.nearbyResults[i].address) + '<br />';
    button_input_div.innerHTML += '<button class="send_poi" onclick="clickPOI(\'' + nearByData.nearbyResults[i].coords + '\', \'' + _sanitizeString(nearByData.nearbyResults[i].name) +'\')"><div class="text">' + _sanitizeString(nearByData.nearbyResults[i].name)+ '</div></div>'
  }
  if(first)
    _showTextInput(false);
  button_input_div.innerHTML += '<button class="send_poi" onclick="clickError()"><div class="text">Nessuno di questi</div></div>';
  tmp += '- Nessuno di questi<br />';
  if(first)
    _showTextInput(false);
  writeMessage(tmp, 'left');
}

function _formatFirstButton() {
  tmp = nearByData.body + '<br />';
  button_input_div = document.getElementById('button_poi_div');
  for(i = 0; i < 5; i++) {
    tmp += '- <b>' + _sanitizeString(nearByData.nearbyResults[i].name) + '</b>,' +  _sanitizeString(nearByData.nearbyResults[i].address) + '<br />';
    button_input_div.innerHTML += '<button class="send_poi" onclick="clickPOI(\'' + nearByData.nearbyResults[i].coords + '\', \'' + _sanitizeString(nearByData.nearbyResults[i].name) +'\')"><div class="text">' + _sanitizeString(nearByData.nearbyResults[i].name)+ '</div></div>'
  }
  button_input_div.innerHTML += '<button class="send_poi" onclick="more()"><div class="text">More...</div></div>';
  _showTextInput(false);
  writeMessage(tmp, 'left');
}

function more() {
  writeMessage('Vorrei visualizzarne altri', 'right');
  _formatMoreButton(false);
}

function _sanitizeString(str) {
    str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim," ");
    return str.trim();
}

function clickPOI(coords, name) {
  _showTextInput(true);
  document.getElementsByClassName('send_message')[0].style.pointerEvents = 'none';
  writeMessage(name, 'right');
  $.ajax({
    type: 'POST',
    url: 'api/v1/push',
    acceptedLanguage: 'it',
    contentType: 'application/json',
    data: JSON.stringify({ type: 'poi', 'coords': coords, 'name': name}),
    success: function (data) {
      switch(data.action){
        case 'finish':
          writeMessage(data.body, 'left');
          location.href='#popup';
          writeInfo('Yeees!', data.body, 'Prova di nuovo', 'index.html');
          break;
        case 'error_finish':
          writeMessage(data.body, 'left');
          location.href='#popup';
          writeInfo('Sorry', data.body, 'Prova di nuovo', 'index.html');
          break;
        case 'server_error':
          writeMessage(data.body, 'left');
          location.href='#popup';
          writeInfo('Sorry', data.body, 'Prova di nuovo', 'index.html');
          break;
        default: writeMessage(data.body, 'left');
      }
    }
  });
  document.getElementsByClassName('send_message')[0].style.pointerEvents = 'auto';
  document.getElementsByClassName("message_input")[0].focus();
}

function clickError() {
  _showTextInput(true);
  document.getElementsByClassName('send_message')[0].style.pointerEvents = 'none';
  writeMessage("Nessuno di questi", 'right');
  $.ajax({
    type: 'POST',
    url: 'api/v1/push',
    acceptedLanguage: 'it',
    contentType: 'application/json',
    data: JSON.stringify({ type: 'error'}),
    success: function (data) {
      switch(data.action){
        case 'finish':
          writeMessage(data.body, 'left');
          location.href='#popup';
          writeInfo('Yeees!', data.body, 'Prova di nuovo', 'index.html');
          break;
        case 'error_finish':
          writeMessage(data.body, 'left');
          location.href='#popup';
          writeInfo('Sorry', data.body, 'Prova di nuovo', 'index.html');
          break;
        case 'server_error':
          writeMessage(data.body, 'left');
          location.href='#popup';
          writeInfo('Sorry', data.body, 'Prova di nuovo', 'index.html');
          break;
        default: writeMessage(data.body, 'left');
      }
    }
  });
  document.getElementsByClassName('send_message')[0].style.pointerEvents = 'auto';
  document.getElementsByClassName("message_input")[0].focus();
}

function checkSend(e){
  if (e.keyCode == 13 && document.getElementsByClassName("message_input")[0].value != "")
    readRequest();
}
