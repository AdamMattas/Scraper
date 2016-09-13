$(document).on('ready', function(){

  //initialize vars and call functions to set the slider up
  var slideIndex = 1,
  infoAuxIndex = 1,
  infoTitleIndex = 1,
  infoTitleDesc = 1;
  showImages(slideIndex);
  showInfoAux(infoAuxIndex);
  showInfoTitle(infoTitleIndex);
  showInfoDesc(infoTitleDesc);

  //listens for click to move to the next or prev article
  $('.move-btns').on('click', function(){

    var direction = $(this).attr('data-move');
    var move = Number(direction);
    console.log(move);

    showImages(slideIndex += move); //moves to the next or prev article image
    showInfoAux(infoAuxIndex += move); //moves to the next or prev article written by
    showInfoTitle(infoTitleIndex += move); //moves to the next or prev article title
    showInfoDesc(infoTitleDesc += move); //moves to the next or prev article description
    emptyComments(); //empty in case comments are open

  });

  //moves to the next or prev article image
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

  //moves to the next or prev article written by
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

  //moves to the next or prev article title
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

  //moves to the next or prev article description
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

  //reset comments section when moving to a new article
  function emptyComments(){
    $('.extra-margin').removeClass('hide');
    $('.comment-container').empty();
    $('.comment-container').addClass('hide');
    $('.input-container').addClass('hide');
    $('.show-comment-form').removeClass('hide');
    $('.show-comments').removeClass('hide');
    $('.show-comments').addClass('comment-pos-before');
  }

  // when you click the savenote button
  $(document).on('click', '.savenote', function(){
    // grab the id associated with the article from the submit button
    var thisId = $(this).attr('data-id');

    var titleInput = $('#title' + thisId).val();
    var bodyInput = $('#body' + thisId).val();

    console.log(titleInput, bodyInput);

    //make sure form isn't empty
    if(titleInput == '' || bodyInput == ''){
      alert('All fields required');
    }else{

      //get dropdown menu value
      var type = $('.partyinput').val();

      //assign image url based on value
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

      // run a POST request to add the comment, using what's entered in the inputs
      $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
          title: $('#title' + thisId).val(), // value taken from title input
          body: $('#body' + thisId).val(), // value taken from note textarea
          party: typeImage, // value taken from note dropdown
          artId: thisId
        }
      })
        // when that done
        .done(function( data ) {
          // log the response
          console.log(data);
          // empty the notes section
          $('.notes').empty();
        });

      // Also, remove the values entered in the input and textarea for note entry
      $('#title' + thisId).val();
      $('#body' + thisId).val();

      showComments(thisId);

    }

  });

  //change classes to show the post comment form
  $(document).on('click', '.show-comment-form', function(){

    $('.input-container').removeClass('hide');
    $('.show-comment-form').addClass('hide');
    $('.extra-margin').addClass('hide');
    $('.show-comments').removeClass('comment-pos-before');

  });

  //when show comments button clicked
  //get id saved in data-id and send as parameter to showComments function
  $(document).on('click', '.show-comments', function(){

    var slug = $(this).attr('data-id');
    showComments(slug);

  });

  function showComments(slug){

    var queryURL = "/notes/" + slug;

    $('.comment-container').empty();

    //ajax makes request and returns the response
    $.ajax({url: queryURL, method: 'GET'}).done(function(response) {

      console.log(response);

      var arr = [];

      for(var i = 0; i < response.length; i++){
        arr.push(response[i]);
      }

        var comment;
        var name;
        var image;

        //loop through comments and build dynamic elements to hold them
        for(var i = 0; i < arr.length; i++){

          console.log(arr[i]);
          var rawDate = arr[i].date;
          var correctDate = moment(rawDate).format('lll');

          comment = $('<div>'); //creates a span element
          comment.addClass('comment-wrap'); //added class to span

          image = $('<img>');
          image.attr('src', arr[i].party);
          image.addClass('comment-image');

          name = $('<h3>');
          name.text(arr[i].title);
          name.addClass('comment-name');

          body = $('<p>');
          body.text(arr[i].body);
          body.addClass('comment-body');

          date = $('<p>');
          date.text(correctDate);
          date.addClass('comment-date');

          remove = $('<a>');
          remove.text('Delete Comment');
          remove.attr('href', '/delete/note/' + arr[i]._id);
          remove.addClass('comment-delete');

          comment.append(image);
          comment.append(name);
          comment.append(body);
          comment.append(date);

          $('.comment-container').append(comment); //appends each notification to the marquee
          $('.comment-container').append(remove); //appends each notification to the marquee

        }

        $('.show-comments').addClass('hide');
        $('.comment-container').removeClass('hide');
        $('.extra-margin').addClass('hide');
        
    });

  }

});



