let data = JSON.parse(localStorage.getItem("ascension")) || {
xp:0,
level:1,
streak:0,
done:{},
sideToday:[],
sideDone:[],
startTime:null,
lastDay:null
};

const sidePool = [
"Marcher 30 min","Sortir","Apprendre 15 min",
"Lire","Escaliers","Corde à sauter",
"Footing","Planifier","Respiration"
];

function save(){
localStorage.setItem("ascension",JSON.stringify(data));
}

function today(){
return new Date().toDateString();
}

function resetDay(){
data.done = {};
data.sideDone = [];
data.sideToday = shuffle(sidePool).slice(0,4);
data.startTime = null;
data.lastDay = today();
save();
}

function shuffle(arr){
return arr.sort(()=>Math.random()-0.5);
}

function checkNewDay(){
if(!data.lastDay){
data.lastDay = today();
save();
return;
}

if(data.lastDay !== today()){
resetDay();
}
}

function startDay(){
data.startTime = Date.now();
save();
update();
}

function showMsg(text){
let el=document.getElementById("systemMsg");
el.innerText=text;
el.style.opacity=1;
setTimeout(()=>el.style.opacity=0,2000);
}

function action(type){

if(data.done[type]){
showMsg("Déjà fait");
return;
}

data.done[type]=true;
data.xp+=80;
data.streak++;

showMsg("MISSION ACCOMPLIE");

levelUp();
save();
update();
}

function completeSide(i){

if(data.sideDone.includes(i)){
showMsg("Déjà fait");
return;
}

data.sideDone.push(i);
data.xp+=40;

showMsg("QUÊTE VALIDÉE");

save();
update();
}

function levelUp(){
let need=100+data.level*50;

if(data.xp>=need){
data.xp-=need;
data.level++;
showMsg("LEVEL UP");
}
}

function updateTime(){

if(!data.startTime){
document.getElementById("timeLeft").innerText="Journée non commencée";
return;
}

let now=new Date();
let midnight=new Date();
midnight.setHours(23,59,59,999);

let diff=midnight-now;

let h=Math.floor(diff/3600000);
let m=Math.floor((diff%3600000)/60000);

document.getElementById("timeLeft").innerText=
"Temps restant : "+h+"h "+m+"m";
}

function update(){

checkNewDay();

if(!data.sideToday || data.sideToday.length===0){
data.sideToday = shuffle(sidePool).slice(0,4);
save();
}

document.getElementById("level").innerText="Niveau "+data.level;
document.getElementById("xp").innerText="XP "+data.xp;
document.getElementById("streak").innerText="Streak "+data.streak;

let main=document.getElementById("main");

main.innerHTML=`
${data.done.run?"✔️":"❌"} Courir<br>
${data.done.steps?"✔️":"❌"} 10 000 pas<br>
${data.done.push?"✔️":"❌"} Pompes<br>
${data.done.squat?"✔️":"❌"} Squats<br>
${data.done.plank?"✔️":"❌"} Gainage
`;

let side=document.getElementById("side");
side.innerHTML="";

data.sideToday.forEach((q,i)=>{
let done=data.sideDone.includes(i);

let btn=document.createElement("button");
btn.innerText=(done?"✔️ ":"❌ ")+q;

btn.onclick=()=>completeSide(i);

side.appendChild(btn);
side.appendChild(document.createElement("br"));
});

updateTime();
}

update();
