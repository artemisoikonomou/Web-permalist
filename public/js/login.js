// THIS IS FOR THE LOGIN FORM
document.addEventListener('DOMContentLoaded', () => {
  // Select the login form element by its ID
  const loginForm = document.getElementById('login-form');

    //THIS GETS THE PASSWORD INPUT FIELD
    const passwordField = document.querySelector("#Password"); 
    //THIS GETS THE EYETOGGLE ,FOR TOGGLING PASSWORD VISIBILITY
    const eyeToggle = document.querySelector("#eye-toggle");

    //THIS IS USED FOR WHEN WE CLICK ON THE EYE ICON FOR THE PASSWORD INPUT
    eyeToggle.addEventListener('click',()=>{

      //THIS IS USED TO CHANGE THE TYPE OF THE INPUT BETWEEN TEXT TO PASSWORD 
      //IT CHECKS THE PASSWORDS INPUT IF ITS PASSWORD 

      if(passwordField.type==="password"){

        //AND THEN CHANGES THE TYPE INTO TEXT AND CHANGES THE EYE ICON TO THE CLOSE EYE ICON
        passwordField.setAttribute("type","text");
        eyeToggle.classList.replace('fa-eye','fa-eye-slash');

      }else{

        //OR ELSE IT CHANGES THE TYPE INTO PASSWORD AND CHANGES THE EYE ICON TO THE OPEN EYE ICON
        passwordField.setAttribute("type","password");
        eyeToggle.classList.replace('fa-eye-slash','fa-eye');

      }
    })

  // When the user submits the form
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission behavior (like page reload)

    // Get the values from the username and password input fields
    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;

    // Check if both username and password fields are filled
    if (!username || !password) {
      Swal.fire('Oops!', 'Please fill in both username and password.', 'error');
      return;
    }

    // Send login request to the backend
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      // If login is successful, redirect to homepage
      if (res.ok && data.success) {
        window.location.href = '/'; // Redirect immediately with no alert
      } else {
        // Show error if login failed
        Swal.fire('Error', data.message || 'Invalid username or password.', 'error');
      }

    } catch (error) {
      // Show network error message
      Swal.fire('Error', 'Network error, please try again later.', 'error');
    }
  });
});
