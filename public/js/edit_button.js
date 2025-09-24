// THIS IS USED FOR THE EDIT BUTTON
//with this way i make the input with id="input" and the button with id="done" visible
function handler(id) {
  document.getElementById(`input${id}`).hidden = false;
  document.getElementById(`done${id}`).hidden = false;
}
