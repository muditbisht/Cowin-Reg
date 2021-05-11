var chosenPin = '110084';
var audioIntervalId = null;
var audio = new Audio('Clown Horn Sound.wav-23166-Free-Loops.com.mp3');
var slots = [];
var filteredSlotsId = [];


intervalFn();
window.setInterval( intervalFn, 5000);


document.getElementById('pin-chng-btn').onclick = changePin;
document.getElementById('curr-pin').innerHTML = chosenPin;


async function intervalFn(){
    const min_age = 18;
    let availableSlots = [];
    let data = await fetchData();
    if(!data) return;
    // console.log(data);

    let centers = data.centers;
    let centers18 = centers.filter((center)=>
    center.sessions.some(sess=>
        sess.min_age_limit===min_age));
    

    centers18.forEach(center=>{
        center.sessions.forEach(sess=>{
            if(sess.min_age_limit===min_age && sess.available_capacity>0 && !filteredSlotsId.some(ids=>ids===sess.session_id)){
                playAudio();
                availableSlots.push({
                    ...sess,
                    center,
                });
                if(!slots.some(s=>s.session_id===sess.session_id)){
                    pushSession(center, sess);
                }
            }
        });
    });
    console.log(availableSlots);
    document.getElementById('available-slots').innerHTML = availableSlots.length;
    
    if(availableSlots.length === 0){
        stopAudio();
    }
    
    if(availableSlots.length>0){
        playAudio();
    }
}

function pushSession(center, sess){
    slots.push(sess);
    let ul = document.getElementById('available-slots-list');
    let li = document.createElement("li");
    let box = document.createElement('input');
    box.setAttribute('type', 'checkbox');
    box.setAttribute('id', sess.session_id);
    box.onclick = (event)=>{
        // console.log();
        if(event.target.checked){
            filteredSlotsId.push(sess.session_id);
        } else {
            filteredSlotsId = filteredSlotsId.map(ids=>ids!==sess.session_id);
        }
    }

    li.appendChild(box)
    li.appendChild(document.createTextNode(`(${sess.available_capacity}) ${sess.session_id} ${sess.date} ${center.name} capacity `)
    );
    ul.appendChild(li);
}

function changePin(){
    chosenPin = document.getElementById('pin-inpt').value;
    document.getElementById('curr-pin').innerHTML = chosenPin;
}

async function fetchData(){
    let dateStr = moment().format('DD-MM-yyyy');
    url  = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${chosenPin}&date=${dateStr}`;
    let res = await fetch(url);
    // console.log('Status: ', res.status);
    if(res.status === 200){
        let jsonData = await res.json();
        // console.log('d: ', jsonData);
        return jsonData;
    } else 
        return null;
}


function stopAudio(){
    window.clearInterval(audioIntervalId);
}

function playAudio(){
    window.clearInterval(audioIntervalId);
    audio.play();
    audioIntervalId = window.setInterval(()=>{
        audio.play();
    }, 2000);
}