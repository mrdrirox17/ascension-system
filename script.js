let data = JSON.parse(localStorage.getItem("ascension")) || {
xp:0, level:1, streak:0,
done:{},
sideToday:[],
sideDone:[],
startTime:null,
lastDay:null,
bossActive:false,
urgentActive:false,
difficulty:0,
performance:"low"
};

const sidePool = [
"Marcher 30 min dehors","Sortir prendre l’air","Apprendre 15 min",
"Lire 10 pages","Escaliers","Corde à sauter",
"Footing léger","Planifier ta journée",
"Sortie active","Respiration","Focus sans téléphone"
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

let xp=0;

if(type==="run") xp=100 + data.level*5 + data.difficulty*10;
if(type==="steps") xp=80;
if(type==="push") xp=80;
if(type==="squat") xp=80;
if(type==="plank") xp=60;

data.xp+=xp;
data.done[type]=true;
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

function analyzePlayer(){

let completed = Object.keys(data.done).length;

if(completed >= 4){
data.performance = "high";
}
else if(completed >= 2){
data.performance = "medium";
}
else{
data.performance = "low";
}
}

function adaptSystem(){

if(data.performance === "high"){
data.difficulty++;
showMsg("⚡ DIFFICULTÉ AUGMENTÉE");
}

if(data.performance === "low"){
showMsg("⚠️ PERFORMANCE FAIBLE");
}
}

function spawnBoss(){

if(data.bossActive) return;

data.bossActive=true;

if(data.performance==="high"){
data.boss="Course longue";
}
else{
data.boss="Pompes intensives";
}

showMsg("👑 BOSS DÉTECTÉ");
}

function spawnUrgent(){

if(data.urgentActive) return;

data.urgentActive=true;

if(data.performance==="low"){
data.urgentTask="Faire 20 pompes maintenant";
}
else{
data.urgentTask="Marcher 10 min";
}

showMsg("⚡ URGENCE");

setTimeout(()=>{
data.urgentActive=false;
update();
},600000);
}

function levelUp(){
let need=100+data.level*60+data.level*data.level;

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

if(Math.random()<0.01) spawnBoss();
if(Math.random()<0.02) spawnUrgent();

analyzePlayer();
adaptSystem();

document.getElementById("level").innerText="Niveau "+data.level;
document.getElementById("xp").innerText="XP "+data.xp;
document.getElementById("streak").innerText="Streak "+data.streak;

document.getElementById("rank").innerText="Rang "+getRank();
document.getElementById("title").innerText="Titre "+getTitle();

document.getElementById("xpfill").style.width=
(data.xp/(100+data.level*60)*100)+"%";

let main=document.getElementById("main");

main.innerHTML=`
${data.done.run?"✔️":"❌"} Courir ${2+Math.floor(data.level/5)+data.difficulty} km<br>
${data.done.steps?"✔️":"❌"} 10 000 pas<br>
${data.done.push?"✔️":"❌"} 100 pompes<br>
${data.done.squat?"✔️":"❌"} 100 squats<br>
${data.done.plank?"✔️":"❌"} Gainage 2 min
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
data.urgentActive?"⚡ "+data.urgentTask:"";

document.getElementById("bossBox").innerText=
data.bossActive?"👑 "+data.boss:"";

updateTime();
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
"Seigneur","Monarque","Empereur"
][Math.floor(data.level/5)]||"Transcendant";
}

setInterval(updateTime,60000);

update();
