$(document).ready(function() {
 $("#value").on('input', function(e) {
   $('#msg').hide();
   $('#loading').show();
   if ($('#value').val() == null || $('#value').val() == "") {
     $('#msg').show();
     $("#msg").html("Username is required field.").css("color", "red"); // Set the color of the message to red
   } else {
     $.ajax({
       type: "POST",
       url: "/check",
       data: $('#addNodeform').serialize(),
       dataType: "html",
       cache: false,
       success: function(msg) {
         $('#msg').show();
         $('#loading').hide();
         $("#msg").html(msg).css("color", "green"); // Set the color of the message to green
       },
       error: function(jqXHR, textStatus, errorThrown) {
         $('#ms').show();
         $('#loading').hide();
         $("#msg").html(textStatus + " " + errorThrown).css("color", "red"); // Set the color of the message to red
       }
     });
   }
 });
});

$(document).ready(function() {
  $("#values").on('input', function(e) {
    $('#renameNode').hide();
    $('#loading').show();
    if ($('#values').val() == null || $('#values').val() == "") {
      $('#renameNode').show();
      $("#renameNode").html("Name is required field.").css("color", "red"); // Set the color of the message to red
    } else {
      $.ajax({
        type: "POST",
        url: "/check",
        data: $('#renameNodeform').serialize(),
        dataType: "html",
        cache: false,
        success: function(msg) {
          $('#renameNode').show();
          $('#loading').hide();
          $("#renameNode").html(msg).css("color", "green"); // Set the color of the message to green
        },
        error: function(jqXHR, textStatus, errorThrown) {
          $('#ms').show();
          $('#loading').hide();
          $("#renameNode").html(textStatus + " " + errorThrown).css("color", "red"); // Set the color of the message to red
        }
      });
    }
  });
 });


 $(document).ready(function() {
  $("#user-input").on('input', function(e) {
    $('#userNodeMsg').hide();
    $('#loading').show();
    if ($('#user-input').val() == null || $('#user-input').val() == "") {
      $('#userNodeMsg').show();
      $("#userNodeMsg").html("Name is required field.").css("color", "red"); // Set the color of the message to red
    } else {
      $.ajax({
        type: "POST",
        url: "/check",
        data: $('#userNodeform').serialize(),
        dataType: "html",
        cache: false,
        success: function(msg) {
          $('#userNodeMsg').show();
          $('#loading').hide();
          $("#userNodeMsg").html(msg).css("color", "green"); // Set the color of the message to green
        },
        error: function(jqXHR, textStatus, errorThrown) {
          $('#ms').show();
          $('#loading').hide();
          $("#userNodeMsg").html(textStatus + " " + errorThrown).css("color", "red"); // Set the color of the message to red
        }
      });
    }
  });
 });

