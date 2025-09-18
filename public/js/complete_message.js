  // Wait until the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", function () {
    const progressBar = document.getElementById('file');

    // Check if the progress is complete (i.e., 100%)
    if (parseInt(progressBar.value) >= 100) {

        Swal.fire({
          title: 'Congratulations 🎉',
          text: 'You have completed all your tasks.',
          icon: 'success',
          iconColor:'#a683e3',
          confirmButtonText: 'Ok',
          confirmButtonColor: '#a683e3',
          customClass: {
            popup:'my-swal-border',
          }
        });
    }
  });