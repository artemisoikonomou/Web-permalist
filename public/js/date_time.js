//  THIS CODE IS USED FOR THE DATE  LIKE Thursday, June 19, 2025
 
 const d = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById("date").innerHTML = d.toLocaleString('en-US', options);

  document.querySelectorAll(".titles").forEach(el => {
    el.innerHTML = d.toLocaleString('en-US', options);
  });

  function handler(id) {
    document.getElementById("title" + id).setAttribute("hidden", true);
    document.getElementById("edit" + id).setAttribute("hidden", true);
    document.getElementById("done" + id).removeAttribute("hidden");
    document.getElementById("input" + id).removeAttribute("hidden");
  }


//THIS CODE IS USED FOR THE TIME LIKE  13:00 

  function startTime() {
    const today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();
    // let s = today.getSeconds();
    m = checkTime(m);
    // s = checkTime(s);
    // document.getElementById('time').innerHTML = h + ":" + m + ":" + s;
    document.getElementById('time').innerHTML = h + ":" + m ;
    setTimeout(startTime, 1000);
  }

  function checkTime(i) {
    return i < 10 ? "0" + i : i;
  }

  startTime(); // Don't forget to call it!