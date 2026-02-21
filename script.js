// ⚔️ ASCENSION SYSTEM V5.1 (STABLE FINAL)

let data;

function defaultData(){
return {
xp:0,
level:1,
streak:0,
done:{},
sideToday:[],
sideDone:[],
startTime:null,
lastDay:null,
boss:null,
urgent:null
};
}

function save(){
localStorage.setItem("ascension", JSON.stringify(data));
localStorage.setItem("ascension_backup", JSON.stringify(data));
}

function loadData(){
let saved = localStorage.getItem("ascension");
let backup = localStorage.getItem("ascension_backup");

try{
if(saved){
data = JSON.parse(saved);
}
}catch{
data = null;
}

if(!data && backup){
try{
data = JSON.parse(backup);
}catch{
data = null;
}
}

if(!data){
data = defaultData();
save();
}

// sécurisation
if(!data.sideToday) data.sideToday=[];
if(!data.sideDone) data.sideDone=[];
if(!data.done) data.done={};
}

function today(){
return new Date().toDateString();
}

function shuffle(arr){
return [...arr].sort(()=>Math.random()-0.5);
}

const sidePool = [
"Marcher 30 min","Lire 10 pages","Apprendre 15 min",
"Escaliers","Respiration","Footing léger"
];

const bosses = [
"💀 Courir 5km","💀 150 pompes","💀 200 squats","💀 20 min cardio"
];

const urgents = [
"⚡ 30 pompes","⚡ marcher 10 min","⚡ 1 min gainage"
];

function showMsg(text){
let o=document.getElementById("overlay");
let m=document.getElementById("systemMsg");

if(!o || !m) return;

o.style.opacity=1;
m.innerText=text;
m.style.opacity=1;

setTimeout(()=>{
o.style.opacity=0;
m.style.opacity=0;
},1500);
}

function startDay(){

if(data.startTime){
showMsg("⚠️ DÉJÀ LANCÉ");
return;
}

data.startTime = Date.now();
showMsg("⚔️ SYSTÈME ACTIVÉ");

save();
update();
}

function resetDay(){

if(Object.keys(data.done).length===0){
data.xp = Math.max(0, data.xp-50);
data.streak=0;
showMsg("💀 INACTIVITÉ");
}

if(data.boss){
data.xp = Math.max(0, data.xp-100);
}

if(data.urgent){
data.xp = Math.max(0, data.xp-50);
}

data.done={};
data.sideDone=[];
data.sideToday=shuffle(sidePool).slice(0,4);
data.lastDay=today();
data.boss=null;
data.urgent=null;

save();
}

function checkNewDay(){
if(!data.lastDay){
data.lastDay=today();
save();
return;
}
if(data.lastDay!==today()){
resetDay();
}
}

function action(type){

if(data.done[type]){
showMsg("Déjà fait");
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

if(data.sideDone.includes(i)) return;

data.sideDone.push(i);
data.xp+=40;

save();
update();
}

function completeBoss(){

if(!data.boss){
showMsg("Aucun boss");
return;
}

data.xp+=200;
data.boss=null;

showMsg("👑 BOSS VAINCU");

save();
update();
}

function completeUrgent(){

if(!data.urgent){
showMsg("Aucune urgence");
return;
}

data.xp+=100;
data.urgent=null;

showMsg("⚡ URGENCE TERMINÉE");

save();
update();
}

// anti spam spawn
let lastSpawn=0;

function spawnEvents(){

let now=Date.now();

if(now - lastSpawn < 15000) return;

if(!data.boss && Math.random()<0.2){
data.boss=bosses[Math.floor(Math.random()*bosses.length)];
showMsg("👑 BOSS");
lastSpawn=now;
}

if(!data.urgent && Math.random()<0.3){
data.urgent=urgents[Math.floor(Math.random()*urgents.length)];
showMsg("⚡ URGENCE");
lastSpawn=now;
}
}

function levelUp(){

let need=100+data.level*80;

if(data.xp>=need){
data.xp-=need;
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
return ["Recrue","Garde","Chevalier","Vétéran","Seigneur","Monarque","Empereur"][Math.floor(data.level/5)]||"Transcendant";
}

function updateTime(){

let el=document.getElementById("timeLeft");

if(!data.startTime){
el.innerText="Journée non commencée";
return;
}

let now=new Date();
let midnight=new Date();
midnight.setHours(23,59,59,999);

let diff=midnight-now;

let h=Math.floor(diff/3600000);
let m=Math.floor((diff%3600000)/60000);

el.innerText="⏱️ "+h+"h "+m+"m";
}

function update(){

checkNewDay();

if(!data.sideToday.length){
data.sideToday=shuffle(sidePool).slice(0,4);
save();
}

spawnEvents();

rank.innerText="Rang : "+getRank();
level.innerText="Niveau "+data.level;
title.innerText="Titre : "+getTitle();

xp.innerText="XP "+data.xp;
streak.innerText="Streak "+data.streak;

xpfill.style.width=(data.xp/(100+data.level*80)*100)+"%";

let runDistance=2+Math.floor(data.level/5);

main.innerHTML=`
${data.done.run?"✔️":"❌"} Courir ${runDistance} km<br>
${data.done.steps?"✔️":"❌"} 10 000 pas<br>
${data.done.push?"✔️":"❌"} Pompes<br>
${data.done.squat?"✔️":"❌"} Squats<br>
${data.done.plank?"✔️":"❌"} Gainage
`;

side.innerHTML="";
data.sideToday.forEach((q,i)=>{
let btn=document.createElement("button");
btn.innerText=(data.sideDone.includes(i)?"✔️ ":"❌ ")+q;
btn.onclick=()=>completeSide(i);
side.appendChild(btn);
side.appendChild(document.createElement("br"));
});

urgentBox.innerText=data.urgent||"";
bossBox.innerText=data.boss||"";

updateTime();
}

// autosave
setInterval(save,5000);

// protection iPhone
document.addEventListener("visibilitychange",()=>{
if(document.hidden){
save();
}else{
loadData();
update();
}
});

// init
loadData();
update();
function exportSave(){

let saveData = JSON.stringify(data);

navigator.clipboard.writeText(saveData);

showMsg("💾 SAUVEGARDE COPIÉE");
}

function importSave(){

let input = prompt("Colle ta sauvegarde ici");

if(!input) return;

try{
data = JSON.parse(input);
save();
update();
showMsg("♻️ SAUVEGARDE RESTAURÉE");
}catch{
showMsg("❌ ERREUR");
}
}
function exportSave(){

let saveData = JSON.stringify(data);

prompt("Copie ta sauvegarde :", saveData);

showMsg("💾 SAUVEGARDE PRÊTE");
}

function importSave(){

let input = prompt("Colle ta sauvegarde ici");

if(!input) return;

try{
data = JSON.parse(input);
save();
update();
showMsg("♻️ SAUVEGARDE RESTAURÉE");
}catch{
showMsg("❌ ERREUR DE SAUVEGARDE");
}
}
function applyAura(){

document.body.className = ""; // reset

let rank = getRank();

document.body.classList.add("rank-" + rank);
}
function applyPressure(){

if(!data.startTime) return;

let now = new Date();
let midnight = new Date();
midnight.setHours(23,59,59,999);

let diff = midnight - now;

if(diff < 2 * 60 * 60 * 1000){ // moins de 2h
document.body.classList.add("danger");
}else{
document.body.classList.remove("danger");
}
}
function levelUp(){

let need = 100 + data.level*80;

if(data.xp >= need){
data.xp -= need;
data.level++;

showMsg("🔥 LEVEL UP");

let el = document.createElement("div");
el.className = "levelup";
el.innerText = "LEVEL UP";

document.body.appendChild(el);

setTimeout(()=>el.remove(),1000);

document.body.classList.add("flash");
setTimeout(()=>document.body.classList.remove("flash"),300);
}
}
