// Adds an event listener to the dropdown button (element with class 'dropbtn')
// When clicked, it toggles the visibility of the dropdown content
document.querySelector('.dropbtn').addEventListener('click', function(event) {
  // Toggles the 'show' class on the dropdown content to show/hide it
  document.querySelector('.dropdown-content').classList.toggle('show');
});
