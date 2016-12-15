// Disclaimer : I could use Angular 2 or React but because of the time, I chose the most simple way: JQuery.

function send() {
  $.ajax({
    type: "POST",
    url: '/api/cep/get',
    data: {
      cep         : $('#cep').val(),
      phoneNumber : $('#phoneNumber').val(),
    },
    success: function (result) {
      if (! result.data)
        return $('#result').val('Not found!');

      $('#result').val(JSON.stringify(result));
    },
    error : function (error) {
      if(error.responseJSON.message)
        return $('#result').val('Error: ' + error.responseJSON.message);

      $('#result').val('Error details: ' + JSON.stringify(error));
    }
  });
}

$(function() {
  $('#btSend').click(send);
});