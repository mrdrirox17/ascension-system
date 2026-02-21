let data = JSON.parse(localStorage.getItem("ascension")) || {
xp:0, level:1, streak:0,
done:{}, sideToday:[], sideDone:[],
startTime:null, lastDay:null,
boss:null, urgent:null
};

const sidePool = [
"Marcher 30 min","Lire 10 pages","Apprendre 15 min",
"Escaliers","Respiration","Footing léger"
];

const bosses = [
"💀 Courir 5km",
"💀 150 pompes",
"💀 200 squats",
"💀 20 min cardio"
];

const urgents = [
"⚡ 30 pompes maintenant",
"⚡ marcher 10 min",
"⚡ 1 min gainage"
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

function showMsg(text){
let overlay = document.getElementById("overlay");
let msg = document.getElementById("systemMsg");

overlay.style.opacity = 1;
msg.innerText = text;
msg.style.opacity = 1;

setTimeout(()=>{
overlay.style.opacity = 0;
msg.style.opacity = 0;
},1500);
}

function startDay(){

if(data.startTime){
showMsg("⚠️ JOURNÉE DÉJÀ ACTIVE");
return;
}

data.startTime = Date.now();

showMsg("⚔️ SYSTÈME ACTIVÉ");

save();
update();
}

function resetDay(){

if(Object.keys(data.done).length === 0){
data.xp -= 50;
data.streak = 0;
showMsg("💀 AUCUNE ACTION");
}

if(data.boss){
data.xp -= 100;
showMsg("💀 BOSS IGNORÉ");
}

if(data.urgent){
data.xp -= 50;
showMsg("⚠️ URGENCE IGNORÉE");
}

data.done = {};
data.sideDone = [];
data.sideToday = shuffle(sidePool).slice(0,4);
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

function action(type){

if(data.done[type]){
showMsg("Déjà fait");
return;
}

let xp = 80 + data.level*5;

data.done[type] = true;
data.xp += xp;
data.streak++;

showMsg("MISSION VALIDÉE");

levelUp();
save();
update();
}

function completeSide(i){

if(data.sideDone.includes(i)) return;

data.sideDone.push(i);
data.xp += 40;

save();
update();
}

function completeBoss(){

if(!data.boss){
showMsg("Aucun boss");
return;
}

data.xp += 200;
data.boss = null;

showMsg("👑 BOSS VAINCU");

save();
update();
}

function completeUrgent(){

if(!data.urgent){
showMsg("Aucune urgence");
return;
}

data.xp += 100;
data.urgent = null;

showMsg("⚡ URGENCE TERMINÉE");

save();
update();
}

function spawnEvents(){

if(!data.boss && Math.random() < 0.2){
data.boss = bosses[Math.floor(Math.random()*bosses.length)];
showMsg("👑 BOSS APPARU");
}

if(!data.urgent && Math.random() < 0.3){
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
][Math.floor(data.level/5)] || "Transcendant";
}

function updateTime(){

let el = document.getElementById("timeLeft");

if(!data.startTime){
el.innerText = "Journée non commencée";
return;
}

let now = new Date();
let midnight = new Date();
midnight.setHours(23,59,59,999);

let diff = midnight - now;

let h = Math.floor(diff/3600000);
let m = Math.floor((diff%3600000)/60000);

el.innerText = "⏱️ " + h + "h " + m + "m";
}

function update(){

checkNewDay();

if(!data.sideToday.length){
data.sideToday = shuffle(sidePool).slice(0,4);
save();
}

spawnEvents();

document.getElementById("rank").innerText = "Rang : " + getRank();
document.getElementById("level").innerText = "Niveau " + data.level;
document.getElementById("title").innerText = "Titre : " + getTitle();

document.getElementById("xp").innerText = "XP " + data.xp;
document.getElementById("streak").innerText = "Streak " + data.streak;

document.getElementById("xpfill").style.width =
(data.xp/(100+data.level*80)*100) + "%";

let runDistance = 2 + Math.floor(data.level/5);

document.getElementById("main").innerHTML = `
${data.done.run?"✔️":"❌"} Courir ${runDistance} km<br>
${data.done.steps?"✔️":"❌"} 10 000 pas<br>
${data.done.push?"✔️":"❌"} Pompes<br>
${data.done.squat?"✔️":"❌"} Squats<br>
${data.done.plank?"✔️":"❌"} Gainage
`;

let side = document.getElementById("side");
side.innerHTML = "";

data.sideToday.forEach((q,i)=>{
let btn = document.createElement("button");
btn.innerText = (data.sideDone.includes(i)?"✔️ ":"❌ ") + q;
btn.onclick = ()=>completeSide(i);
side.appendChild(btn);
side.appendChild(document.createElement("br"));
});

document.getElementById("urgentBox").innerText = data.urgent || "";
document.getElementById("bossBox").innerText = data.boss || "";

updateTime();
}

update();
