// Client facing scripts here
$(document).ready(function() {
$(function(){
  $("#date").datepicker();
  // $("#date").datepicker("show");
})

$(".nav-create-event").on("click", function () {
  $(".welcome").hide();
  $(".calendar").hide();
  $(".new-event").show();
})

$("#continue-btn").on("click", function () {
  $(".welcome").hide();
  $(".calendar").show();
})

const createDateEntry = function() {
  const entry = $(`<p>Date: <input type="text" id="date" >
  Start Time: <input type="time" id="time" min="05:00" max="24:00" required>
  End Time: <input type="time" id="time" min="05:00" max="24:00" required> </p>`);
  return entry;
};

$(".add-btn").on("click", function () {
  const $entry = createDateEntry();
  $(".date-entry").append($entry)
})









































});
