let data = JSON.parse(localStorage.getItem("ascension")) || {
xp:0,
level:1,
streak:0,
done:{},
sideToday:[],
sideDone:[],
startTime:null,
lastDay:null,
boss:null,
urgent:null,
penalty:0
};

const sidePool = [
"Marcher 30 min","Sortir prendre l’air","Apprendre 15 min",
"Lire 10 pages","Escaliers","Corde à sauter",
"Footing léger","Planifier ta journée","Respiration",
"Gainage bonus","Pompes bonus","Squats bonus"
];

const bosses = [
"💀 5 km run",
"💀 200 squats",
"💀 150 pompes",
"💀 20 min cardio",
"💀 combo : run + gainage"
];

const urgents = [
"⚡ 30 pompes maintenant",
"⚡ 10 min marche",
"⚡ 1 min gainage",
"⚡ 40 squats"
];

function save(){
localStorage.setItem("ascension",JSON.stringify(data));
}

function today(){
return new Date().toDateString();
}

function shuffle(arr){
return arr.sort(()=>Math.random()-0.5);
}

function resetDay(){

// pénalité si rien fait
if(Object.keys(data.done).length === 0){
data.xp -= 50;
data.streak = 0;
data.penalty++;
showMsg("💀 AUCUNE ACTION - PÉNALITÉ");
}

data.done = {};
data.sideDone = [];
data.sideToday = shuffle(sidePool).slice(0,5);
data.startTime = null;
data.lastDay = today();
data.boss = null;
data.urgent = null;

save();
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
showMsg("Déjà validé");
return;
}

let xp = 80 + data.level*5;

data.done[type]=true;
data.xp+=xp;
data.streak++;

showMsg("MISSION VALIDÉE");

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

save();
update();
}

function spawnBoss(){
if(!data.boss && Math.random()<0.3){
data.boss = bosses[Math.floor(Math.random()*bosses.length)];
showMsg("👑 BOSS APPARU");
}
}

function spawnUrgent(){
if(!data.urgent && Math.random()<0.4){
data.urgent = urgents[Math.floor(Math.random()*urgents.length)];
showMsg("⚡ URGENCE");
}
}

function levelUp(){
let need = 100 + data.level*80;

if(data.xp >= need){
data.xp -= need;
data.level++;
showMsg("🔥 LEVEL UP");
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
"⏱️ "+h+"h "+m+"m restantes";
}

function getRank(){
if(data.level<10)return"E";
if(data.level<20)return"D";
if(data.level<35)return"C";
if(data.level<50)return"B";
if(data.level<80)return"A";
return"S";
}

function getTitle(){
return [
"Recrue","Garde","Chevalier",
"Vétéran","Seigneur","Monarque","Empereur"
][Math.floor(data.level/5)]||"Transcendant";
}

function update(){

checkNewDay();

if(!data.sideToday || data.sideToday.length===0){
data.sideToday = shuffle(sidePool).slice(0,5);
save();
}

spawnBoss();
spawnUrgent();

document.getElementById("rank").innerText="Rang : "+getRank();
document.getElementById("level").innerText="Niveau "+data.level;
document.getElementById("title").innerText="Titre : "+getTitle();

document.getElementById("xp").innerText="XP "+data.xp;
document.getElementById("streak").innerText="Streak "+data.streak;

document.getElementById("xpfill").style.width=
(data.xp/(100+data.level*80)*100)+"%";

let main=document.getElementById("main");

main.innerHTML=`
${data.done.run?"✔️":"❌"} Courir ${2+Math.floor(data.level/5)} km<br>
${data.done.steps?"✔️":"❌"} 10 000 pas<br>
${data.done.push?"✔️":"❌"} 100 pompes<br>
${data.done.squat?"✔️":"❌"} 100 squats<br>
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

document.getElementById("urgent").innerText=
data.urgent ? data.urgent : "";

document.getElementById("bossBox").innerText=
data.boss ? data.boss : "";

updateTime();
}

update();
