function getInfo() {
  $.ajax({
      type: 'GET',
      url: 'api/v1/help',
      acceptedLanguage: 'it',
      contentType: 'application/json',
      data: '',
      success: function (data) {
          writeInfo(data.body);
      }
    });
}

function writeInfo(text) {
    var para = document.createElement("P");
    var t = document.createTextNode(text);
    para.appendChild(t);
    // document.getElementById("infobox").innerHTML = "Hello World";
    document.getElementById("infobox").appendChild(para);
}
