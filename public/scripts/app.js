// Client facing scripts here
$(document).ready(function() {
  const max_number_of_event_dates = 5;
  let event_date_count = 0;
  let timeslots = [];


//nav bar create event button
$(".nav-create-event").on("click", function () {
  $(".welcome").hide();
  $(".calendar").hide();
  $(".new-event").show();
})

//continue button on the create event page
$("#continue-btn").on("click", function () {
  let title = $('#title').val().length;
  let description = $('#description').val().length;
  let name = $('#name').val().length;
  let email = $('#email').val().length;
  if (title === 0 || description === 0 || name === 0 || email === 0) {
    alert("Please fill all the fields before continuing");
  }
  else{
    $(".welcome").hide();
    $(".calendar").show();
  }
})

//show today`s date function
const getTodaysDate = function() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + '-' + mm + '-' + dd;
  return today;
}

//adding event dates and times
$(".add-btn").on("click", function () {
  let startDate = $('#start-date').val();
  let endDate = $('#end-date').val();
  //format dates into timestamps
  let currentDate = getTodaysDate();
  const startTimestamp = formatDate(startDate);
  const endTimestamp = formatDate(endDate);

  if (startTimestamp < currentDate || endTimestamp < currentDate  ) {
    alert("Please enter a date after today's date");
    return
  }

  timeslots.push({
    startDate: startTimestamp,
    endDate: endTimestamp
  });


  // date validations - dates/times must not be empty
  // start date must before the end date
  // use timestamps to do the comparisons
  if (startDate >= endDate || startDate === "" || endDate === "") {
    alert("Please enter proper time values");
  } else {
    event_date_count++;

    if (event_date_count >= max_number_of_event_dates){
      alert("You've reached the maximum number of event timeslots.");
    } else {
      const $entry = createDateEntry(startTimestamp, endTimestamp);
      // show event date table with newly added date
      $("#date-entries").show();
      $("#date-entries").append($entry);
      // clear input fields to be able to add more event dates
      $('#start-date').val("");
      $('#end-date').val("");
      // assign timeslot to hidden textarea value in order to pass timeslots to the form
      $('#timeslots').val(timeslots);
    }
  }
});

const formatDate = function (inputDate) {
  let date = inputDate.split('');
  let dateDay = date.slice(8, 10).join('');
  let dateMonth = date.slice(5, 7).join('');
  let dateYear = date.slice(0, 4).join('');
  let dateTime = date.slice(11, 16).join('');

  return `${dateYear}-${dateMonth}-${dateDay} ${dateTime}`
};

$("#date-entries").on("click",".minus-btn", function(e){ //user click on remove text

  alert(`Allloo`)
  e.preventDefault();
  let tableRow = $(this).closest('tr');

  var a = tableRow.children();
  let timeslots = $("#timeslots").val();
  // console.log(`${inspect(timeslots)}`)

  alert(`${timeslots}`)
  alert(`StartTime ${a[0].innerText} EndTime ${a[1].innerText}`)


  tableRow.remove();
  event_date_count--;
});


$("#continue-btn2").on("click", function () {
  // get form data $(#id-val).val()

  someFunction(data)
});

$("#submitForm").submit(function(event) {
  event.preventDefault();

  let finaldataToPass = {
    title: $("#title").val(),
    name: $("#name").val(),
    description: $("#description").val() ,
    email: $("#email").val() ,
    timeslots: timeslots
  }

  let json_data = JSON.stringify(finaldataToPass);
  console.log(json_data)

  alert(`${json_data}`)
  $.ajax({
    method: "POST",
    url: "/create",
    data: json_data,
    contentType: "application/json"
  }).then(function(response) {
    render(response);
  });

});

const createDateEntry = function(startTime, endTime) {
  const entry = $(`<tr>
  <td>${startTime}</td>
  <td>${endTime}</td>
  <td><button class="minus-btn" type="button" ><i class="fa-solid fa-minus"> </i></button></td>
  </tr>`);
  return entry;
};

const data =[
{
  "email" : "test2@gmail.com",
  "name" : "Rabhas2",
  "resposne" : "false"
}]

//
const createAttendeeEntry = function(data) {
  const entry = $(`<tr>
  <td>${data.email}</td>
  <td>${data.name}</td>
  <td>${data.response}</td>
  </tr>
`);
  return entry;
};

//function to load single entry after user confirms attendance
//add just a single entry to table dynamically
const someFunction = function(dataFromForm) {
  const $entry = createAttendeeEntry(dataFromForm);
  $(".attendee-entry").append($entry)
}


//function to load all entries from db
//hardcoded data is being fed to this function
//data should be retrived from the dartabase as an array of objects which will dynamically populate the attendee table
const loadEntries = function(data) {
  for(let attendeeData of data) {
    const $entry = createAttendeeEntry(attendeeData);
    $(".attendee-entry").append($entry)
  }
}

loadEntries(data);





































});
