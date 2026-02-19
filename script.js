/* ===============================
   NAVIGATION
================================= */

function goToUser(name){
    localStorage.setItem("selectedUser", name);
    window.location.href = "dashboard.html";
}

function goBack(){
    window.location.href = "index.html";
}


/* ===============================
   GLOBAL MODE
================================= */

let mode = "present";


/* ===============================
   PAGE LOAD
================================= */

window.addEventListener("load", initPage);

async function initPage(){

    const totalDays = 45;
    const user = localStorage.getItem("selectedUser");
    if(!user) return;


    /* ---------- SUBJECTS ---------- */

    let subjects = [
        "SE","DAA","CN","ENG","CV","KAN","DAA LAB","CN LAB","WP"
    ];

    if(user === "pandi"){
        subjects = subjects.filter(s => s !== "KAN");
    }


    /* ---------- MODE BUTTON ---------- */

    const modeBtn = document.getElementById("modeBtn");

    window.toggleMode = function(){
        if(mode === "present"){
            mode = "absent";
            modeBtn.innerText = "Mode: ✖ Absent";
        }else{
            mode = "present";
            modeBtn.innerText = "Mode: ✔ Present";
        }
    };


    /* ---------- CREATE DATE HEADER ---------- */

    const dateRow = document.getElementById("dateRow");

    for(let i=1;i<=totalDays;i++){
        dateRow.innerHTML += `<th>${i}</th>`;
    }
    dateRow.innerHTML += `<th></th><th></th>`;


    /* ---------- CREATE SUBJECT ROWS ---------- */

    const subjectRows = document.getElementById("subjectRows");

    subjects.forEach(sub=>{

        let row = `<tr class="subject-row">
        <td>${sub}</td>`;

        for(let i=1;i<=totalDays;i++){
            row += `<td class="attendance-box"
                     data-id="${sub}-${i}"
                     onclick="markCell(this)"></td>`;
        }

        row += `<td class="attended">0</td>
                <td class="percent">0%</td>
                </tr>`;

        subjectRows.innerHTML += row;
    });


    /* ---------- WAIT FOR FIREBASE THEN LOAD ---------- */

    setTimeout(loadAttendance, 1000);
}


/* ===============================
   MARK CELL
================================= */

function markCell(cell){

    if(cell.innerText==="✔" && mode==="present"){
        cell.innerText="";
        cell.className="attendance-box";
    }
    else if(cell.innerText==="✖" && mode==="absent"){
        cell.innerText="";
        cell.className="attendance-box";
    }
    else if(mode==="present"){
        cell.innerText="✔";
        cell.className="attendance-box present";
    }
    else{
        cell.innerText="✖";
        cell.className="attendance-box absent";
    }

    calculate();
    saveAttendance();   // ⭐ AUTO SAVE
}


/* ===============================
   CALCULATE %
================================= */

function calculate(){

const rows = document.querySelectorAll(".subject-row");

rows.forEach(row=>{

const boxes = row.querySelectorAll(".attendance-box");

let attended = 0;
let conducted = 0;

boxes.forEach(b=>{
if(b.innerText==="✔"){
attended++;
conducted++;
}
else if(b.innerText==="✖"){
conducted++;
}
});

row.querySelector(".attended").innerText = attended;

let percent = conducted===0 ? 0 : ((attended/conducted)*100).toFixed(1);
row.querySelector(".percent").innerText = percent+"%";

if(percent<75) row.classList.add("warning");
else row.classList.remove("warning");

});
}


/* ===============================
   SAVE TO FIREBASE
================================= */

async function saveAttendance(){

if(!window.db) return;

const user = localStorage.getItem("selectedUser");
const data={};

document.querySelectorAll(".attendance-box").forEach(box=>{
data[box.dataset.id]=box.innerText;
});

await window.setDoc(window.doc(window.db,"attendance",user),data);

console.log("Saved ✔");
}


/* ===============================
   LOAD FROM FIREBASE
================================= */

async function loadAttendance(){

if(!window.db) return;

const user = localStorage.getItem("selectedUser");
const snap = await window.getDoc(window.doc(window.db,"attendance",user));

if(snap.exists()){

const data = snap.data();

document.querySelectorAll(".attendance-box").forEach(box=>{

if(data[box.dataset.id]){

box.innerText=data[box.dataset.id];

if(box.innerText==="✔")
box.classList.add("present");

if(box.innerText==="✖")
box.classList.add("absent");

}
});

}

calculate();
}
