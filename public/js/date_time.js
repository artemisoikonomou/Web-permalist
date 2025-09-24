//  THIS CODE IS USED FOR THE DATE  LIKE Thursday, June 19, 2025
 
//this is used for general date and time show
  const d = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById("date").innerHTML = d.toLocaleString('en-US', options);


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

  startTime(); 
