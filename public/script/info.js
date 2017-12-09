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
    document.getElementById('popupTitle').innerHTML = title;
    // var para = document.createElement("P");
    // var t = document.createTextNode(text);
    // para.appendChild(t);
    // document.getElementById("infobox").innerHTML = "Hello World";
    document.getElementById("infobox").innerHTML = ('<p>' + text + '</p');
    document.getElementById('nextButton').innerHTML = buttonLabel;
    document.getElementById('nextButton').onclick = function() {
        location.href= next;
    }
}
