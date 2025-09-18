// Adds an event listener to the dropdown button (element with class 'dropbtn')
// When clicked, it toggles the visibility of the dropdown content
document.querySelector('.dropbtn').addEventListener('click', function(event) {
  // Prevents the click event from bubbling up to the window, which would close the dropdown
  event.stopPropagation();

  // Toggles the 'show' class on the dropdown content to show/hide it
  document.querySelector('.dropdown-content').classList.toggle('show');
});

// Adds an event listener to the whole window
// If the user clicks anywhere outside the dropdown, it closes the dropdown
window.addEventListener('click', function() {
  const dropdown = document.querySelector('.dropdown-content');
  
  // If the dropdown is currently shown, remove the 'show' class to hide it
  if (dropdown.classList.contains('show')) {
    dropdown.classList.remove('show');
  }
});
