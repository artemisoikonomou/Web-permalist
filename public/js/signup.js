// THIS IS THE SIGNUP POP UP

document.addEventListener('DOMContentLoaded', () => {

  // Select all elements with the class 'signup-link'
  const signupLinks = document.querySelectorAll('.signup-link');

  // Loop through each signup link and attach a click event listener
  signupLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault(); // Prevent default link behavior (like navigating away)

      // Display a SweetAlert modal to collect signup information
      Swal.fire({
            title: 'Create your account', // Modal title
            html: `
              <!-- Username input -->
              <input type="text" id="username" class="swal2-input" placeholder="Username">
              
              <!-- Password input with eye toggle -->
              <div style="position: relative;">
                <input type="password" id="password" class="swal2-input" placeholder="Password" style="padding-right: 35px;">
                <i class="fa-solid fa-eye" id="eye-toggle" data-toggle="#password"
                  style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
                          cursor: pointer; color: #aaa;"></i>
              </div>

              <!-- Confirm password input with eye toggle -->
              <div style="position: relative;">
                <input type="password" id="confirmPassword" class="swal2-input" placeholder="Confirm Password" style="padding-right: 35px;">
                <i class="fa-solid fa-eye" id="eye-toggle-confirm" data-toggle="#confirmPassword"
                  style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
                          cursor: pointer; color: #aaa;"></i>
              </div>
            `,
            confirmButtonText: 'Sign Up',         // Text on confirm button
            showCancelButton: true,               // Show cancel button
            cancelButtonText: 'Cancel',           // Text on cancel button
            focusConfirm: false,                  // Prevent autofocus on confirm button
            
            // Once the popup is shown, attach password toggle logic
            //THIS RUNS AFTER THE POP UP IS FULLY OPENED
            didOpen: () => {

              //THIS GETS THE PASSWORD INPUT FIELD
                const passwordField = document.querySelector("#password"); 
                
                //THIS GETS THE EYETOGGLE ,FOR TOGGLING PASSWORD VISIBILITY
                const eyeToggle = document.querySelector("#eye-toggle");

                //THIS GETS THE CONFIRMM PASSWORD INPUT FIELD
                const confirmPasswordField = document.querySelector("#confirmPassword");
                
                //THIS GETS THEY EYETOGGLE FOR THE CONFIRM PASSWORD INPUT FIELD , FOR TOGGLING CONFIRM PASSWORD VISIBILITY
                const confirmEyeToggle = document.querySelector("#eye-toggle-confirm");

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

                confirmEyeToggle.addEventListener('click',()=>{

                    if(confirmPasswordField.type==="password"){
                      confirmPasswordField.setAttribute("type","text");
                      confirmEyeToggle.classList.replace("fa-eye","fa-eye-slash");
                    }else{
                      confirmPasswordField.setAttribute("type","password");
                      confirmEyeToggle.classList.replace("fa-eye-slash","fa-eye");
                    }
                })
            },

            // This function runs before confirming the form and is used for the backend connection
            preConfirm: () => {
              const username = Swal.getPopup().querySelector('#username').value;
              const password = Swal.getPopup().querySelector('#password').value;
              const confirmPassword = Swal.getPopup().querySelector('#confirmPassword').value;

              // Validate all fields are filled
              if (!username || !password || !confirmPassword) {
                Swal.showValidationMessage('Please fill all fields');
                return false;
              }

              // Ensure passwords match
              if (password !== confirmPassword) {
                Swal.showValidationMessage('Passwords do not match');
                return false;
              }

              // If validation passes, return data to use in the `.then()` block
              return { username, password };
            }
      })

      .then(result => {
            // If user confirmed the signup
            if (result.isConfirmed) {
              // Send POST request to backend to create the user
              fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result.value)
              })
              .then(async res => {
                const data = await res.json();

                if (res.ok) {
                  // Success: show message then redirect
                  Swal.fire('Success!', data.message || 'Your account has been created.', 'success').then(() => {
                    window.location.href = '/';  // Redirect to homepage
                  });
                }
                // Custom error: username already exists
                else if (res.status === 400 && data.message.includes('exists')) {
                  Swal.fire('Oops!', 'This username is already taken. Please choose another.', 'error');
                }
                // General error message
                else {
                  Swal.fire('Oops!', data.message || 'Something went wrong.', 'error');
                }
              })
              .catch(() => {
                // Network error handling
                Swal.fire('Error', 'Network issue. Try again later.', 'error');
              });
            }
      });
    });
  });
});
