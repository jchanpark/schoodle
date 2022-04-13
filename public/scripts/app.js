// Client facing scripts here
$(document).ready(function() {
  const max_number_of_event_dates = 5;
  let event_date_count = 0;

  $(".date").datepicker({
    minDate: '+1D'
  });

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

//
$(".add-btn").on("click", function () {
  event_date_count++;

  var myTab = document.getElementById('date-entry');

  // LOOP THROUGH EACH ROW OF THE TABLE AFTER HEADER.
  for (i = 1; i < myTab.rows.length; i++) {

      // GET THE CELLS COLLECTION OF THE CURRENT ROW.
      var objCells = myTab.rows.item(i).cells;

      // LOOP THROUGH EACH CELL OF THE CURENT ROW TO READ CELL VALUES.
      for (var j = 0; j < objCells.length; j++) {
          alert(objCells.item(j).innerHTML);
      }
  }

  var startDate = Date.parse($('#start-time').val());
  var endDate = Date.parse($('#end-time').val());
  if (startDate >= endDate) { alert("Please enter proper date") }

  if (event_date_count >= max_number_of_event_dates){
    alert("You've reached the maximum number of event timeslots.");
  } else {
    const $entry = createDateEntry();
    $("#date-entry").append($entry)
    $(".date").datepicker({
      minDate: '+1D'
    });
  }
})

$("#continue-btn2").on("click", function () {
  test
  someFunction(data)
});


const createDateEntry = function() {
  // const entry = $(`<p>Date: <input type="text" class="date" >
  // Start Time: <input type="time" id="start-time" min="05:00" max="24:00" required>
  // End Time: <input type="time" id="end-time" min="05:00" max="24:00" required>
  // <button class="minus-btn" type="submit"> <i class="fa-solid fa-minus"> </i></button> </p>`);
  const entry = $(`<tr>
  <td><input type="text" class="date" ></td>
      <td><input type="time" id="start-time" required></td>
          <td><input type="time" id="end-time"  required></td>
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
