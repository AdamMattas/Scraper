$(document).on('ready', function(){

  var slideIndex = 1,
  infoAuxIndex = 1,
  infoTitleIndex = 1,
  infoTitleDesc = 1;
  showImages(slideIndex);
  showInfoAux(infoAuxIndex);
  showInfoTitle(infoTitleIndex);
  showInfoDesc(infoTitleDesc);

  $('.move-btns').on('click', function(){

    var direction = $(this).attr('data-move');
    var move = Number(direction);
    console.log(move);

    showImages(slideIndex += move);
    showInfoAux(infoAuxIndex += move);
    showInfoTitle(infoTitleIndex += move);
    showInfoDesc(infoTitleDesc += move);

  });

  function showImages(n) {
    var i;
    var x = document.getElementsByClassName("slides");
    if (n > x.length) {slideIndex = 1}
    if (n < 1) {slideIndex = x.length}
    for (i = 0; i < x.length; i++) {
       x[i].style.display = "none";
    }
    x[slideIndex-1].style.display = "block";
  }

  function showInfoAux(n) {
    var i;
    var y = document.getElementsByClassName("info-aux");
    if (n > y.length) {infoAuxIndex = 1}
    if (n < 1) {infoAuxIndex = y.length}
    for (i = 0; i < y.length; i++) {
       y[i].style.display = "none";
    }
    y[infoAuxIndex-1].style.display = "block";
  }

  function showInfoTitle(n) {
    var i;
    var y = document.getElementsByClassName("info-title");
    if (n > y.length) {infoTitleIndex = 1}
    if (n < 1) {infoTitleIndex = y.length}
    for (i = 0; i < y.length; i++) {
       y[i].style.display = "none";
    }
    y[infoTitleIndex-1].style.display = "block";
  }

  function showInfoDesc(n) {
    var i;
    var y = document.getElementsByClassName("info-description");
    if (n > y.length) {infoTitleDesc = 1}
    if (n < 1) {infoTitleDesc = y.length}
    for (i = 0; i < y.length; i++) {
       y[i].style.display = "none";
    }
    y[infoTitleDesc-1].style.display = "block";
  }

  // whenever someone clicks a p tag
  $(document).on('click', 'p', function(){
    // empty the notes from the note section
    $('#notes').empty();
    // save the id from the p tag
    var thisId = $(this).attr('data-id');

    // now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId,
    })
      // with that done, add the note information to the page
      .done(function( data ) {
        console.log(data);
        // the title of the article
        $('#notes').append('<h2>' + data.title + '</h2>'); 
        // an input to enter a new title
        $('#notes').append('<input id="titleinput" name="title" >'); 
        // a textarea to add a new note body
        $('#notes').append('<textarea id="bodyinput" name="body"></textarea>'); 
        // a button to submit a new note, with the id of the article saved to it
        $('#notes').append('<button data-id="' + data._id + '" id="savenote">Save Note</button>');

        // if there's a note in the article
        if(data.note){
          // place the title of the note in the title input
          $('#titleinput').val(data.note.title);
          // place the body of the note in the body textarea
          $('#bodyinput').val(data.note.body);
        }
      });
  });

  // when you click the savenote button
  $(document).on('click', '.savenote', function(){
    // grab the id associated with the article from the submit button
    var thisId = $(this).attr('data-id');

    if($('.titleinput').val() == '' || $('.bodyinput').val() == ''){
      alert('All fields required');
    }else{

      var type = $('.partyinput').val();

      switch (type) {
        case '1':
          typeImage = "/assets/images/democrat.jpg";
          break;
        case '2':
          typeImage = "/assets/images/republican.jpg";
          break;
        case '3':
          typeImage = "/assets/images/libertarian.jpg";
          break;
        case '4':
          typeImage = "/assets/images/green.jpg";
          break;
        case '5':
          typeImage = "/assets/images/constitution.jpg";
          break;
        case '6':
          typeImage = "/assets/images/independent.jpg";
          break;
        case '7':
          typeImage = "/assets/images/none.jpg";
          break;
        default:
            typeImage = "/assets/images/none.jpg";
      }

      // run a POST request to change the note, using what's entered in the inputs
      $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
          title: $('.titleinput').val(), // value taken from title input
          body: $('.bodyinput').val(), // value taken from note textarea
          party: typeImage, // value taken from note dropdown
          artId: thisId
        }
      })
        // with that done
        .done(function( data ) {
          // log the response
          console.log(data);
          // empty the notes section
          $('.notes').empty();
        });

      // Also, remove the values entered in the input and textarea for note entry
      $('.titleinput').val("");
      $('.bodyinput').val("");

    }

  });

  $(document).on('click', '.show-comment-form', function(){

    $('.input-container').removeClass('hide');
    $('.show-comment-form').addClass('hide');
    $('.extra-margin').addClass('hide');
    $('.show-comments').removeClass('comment-pos-before');

  });

  $(document).on('click', '.show-comments', function(){

    var slug = $(this).attr('data-id');

    var queryURL = "/notes/" + slug;

    //ajax makes request and returns the response
    $.ajax({url: queryURL, method: 'GET'}).done(function(response) {

      console.log(response);

      var arr = [];

      for(var i = 0; i < response.length; i++){
        arr.push(response[i]);
      }

      //var arr = Object.keys(response).map(function(k) { console.log(response[k]) });
      //var arr = [response];

      //if (response) {

        var comment;
        var name;
        var image;

        for(var i = 0; i < arr.length; i++){

          console.log(arr[i]);
          var rawDate = arr[i].date;
          var correctDate = moment(rawDate).format('lll');

          comment = $('<div>'); //creates a span element
          comment.addClass('comment-wrap'); //added class to span

          image = $('<img>');
          image.attr('src', arr[i].party);

          name = $('<h3>');
          name.text(arr[i].title);

          body = $('<p>');
          body.text(arr[i].body);

          date = $('<p>');
          date.text(correctDate);

          comment.append(image);
          comment.append(name);
          comment.append(body);
          comment.append(date);

          $('.comment-container').append(comment); //appends each notification to the marquee

        }

        $('.show-comments').addClass('hide');
        $('.comment-container').removeClass('hide');
        $('.extra-margin').addClass('hide');

      //}
        
    });

  });

});



