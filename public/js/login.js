// THIS IS FOR THE LOGIN FORM
document.addEventListener('DOMContentLoaded', () => {
  // Select the login form element by its ID
  const loginForm = document.getElementById('login-form');

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