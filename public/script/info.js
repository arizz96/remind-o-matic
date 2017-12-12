function getInfo() {
  $.ajax({
      type: 'GET',
      url: 'api/v1/help',
      acceptedLanguage: 'it',
      contentType: 'application/json',
      data: '',
      success: function (data) {
          writeInfo('Aiuto', data.body, 'Più informazioni', 'info.html');
      }
    });
}

function writeInfo(title, text, buttonLabel, next) {
  if(title == 'Aiuto')
    document.getElementById('popupClose').style.visibility = 'visible';
  else
    document.getElementById('popupClose').style.visibility = 'hidden';
  document.getElementById('popupTitle').innerHTML = title;
  document.getElementById("infobox").innerHTML = ('<p>' + text + '</p');
  document.getElementById('nextButton').innerHTML = buttonLabel;
  document.getElementById('nextButton').onclick = function() {
      location.href= next;
  }
}
