// Client facing scripts here
$(document).ready(function() {
$(function(){
  $(".date").datepicker();
  // $("#date").datepicker("show");
})

//nav bar create event button
$(".nav-create-event").on("click", function () {
  $(".welcome").hide();
  $(".calendar").hide();
  $(".new-event").show();
})

//continue button on the create event page
$("#continue-btn").on("click", function () {
  $(".welcome").hide();
  $(".calendar").show();
})

//
$(".add-btn").on("click", function () {
  const $entry = createDateEntry();
  $(".date-entry").append($entry)
})




//nav create event click
$(".nav-create-event").on("click", function () {})


const createDateEntry = function() {
  const entry = $(`<p>Date: <input type="text" class="date" >
  Start Time: <input type="time" id="time" min="05:00" max="24:00" required>
  End Time: <input type="time" id="time" min="05:00" max="24:00" required>
  <button class="minus-btn" type="submit"> <i class="fa-solid fa-minus"> </i></button> </p>`);
  return entry;
};


const data = [{
  "email" : "test@gmail.com",
  "name" : "Rabhas",
  "response" : "true"
},
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
