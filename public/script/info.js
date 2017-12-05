function getInfo() {
  $.ajax({
      type: 'GET',
      url: 'api/v1/help',
      acceptedLanguage: 'it',
      contentType: 'application/json',
      data: '',
      success: function (data) {
          // use data
          console.log(data.action);
          console.log("RICEVUTA RICHIESTA");
      }
    });
};
