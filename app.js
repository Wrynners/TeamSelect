/* TeamSelect: line-ups for soccer, Gaelic football and hurling.
   Data lives on the device (localStorage) and moves between devices through links and backup files.
   Structure: constants → storage/model → pitch drawing → board (render + drag) → panels → sheets → sharing → player card. */
(function(){
"use strict";

/* ================= Constants ================= */
const GK=['GK',50,91];
const B4=[['LB',14,72],['CB',37,76],['CB',63,76],['RB',86,72]];
const B3=[['CB',25,75],['CB',50,78],['CB',75,75]];
/* Formations: [label, x%, y% from top]. Soccer attacks upward; GAA is drawn like a team sheet (keeper at top, 2-3-4 left to right). */
const SOCCER_F={
  11:{
    '4-4-2':[GK,...B4,['LM',14,48],['CM',37,52],['CM',63,52],['RM',86,48],['ST',37,22],['ST',63,22]],
    '4-3-3':[GK,...B4,['CM',28,52],['CM',50,57],['CM',72,52],['LW',16,26],['ST',50,18],['RW',84,26]],
    '4-2-3-1':[GK,...B4,['DM',37,60],['DM',63,60],['LAM',16,37],['CAM',50,39],['RAM',84,37],['ST',50,17]],
    '4-1-4-1':[GK,...B4,['DM',50,61],['LM',14,42],['CM',37,45],['CM',63,45],['RM',86,42],['ST',50,18]],
    '4-5-1':[GK,...B4,['LM',12,46],['CM',32,52],['CM',50,57],['CM',68,52],['RM',88,46],['ST',50,18]],
    '3-5-2':[GK,...B3,['LWB',10,50],['CM',32,53],['DM',50,60],['CM',68,53],['RWB',90,50],['ST',37,22],['ST',63,22]],
    '3-4-3':[GK,...B3,['LM',12,50],['CM',38,54],['CM',62,54],['RM',88,50],['LW',18,25],['ST',50,18],['RW',82,25]],
    '5-3-2':[GK,['LWB',10,65],['CB',30,76],['CB',50,78],['CB',70,76],['RWB',90,65],['CM',28,50],['CM',50,54],['CM',72,50],['ST',37,22],['ST',63,22]]
  },
  9:{
    '3-3-2':[GK,['LB',20,74],['CB',50,77],['RB',80,74],['LM',18,50],['CM',50,53],['RM',82,50],['ST',36,24],['ST',64,24]],
    '3-2-3':[GK,['LB',20,74],['CB',50,77],['RB',80,74],['CM',35,54],['CM',65,54],['LW',18,28],['ST',50,21],['RW',82,28]],
    '2-4-2':[GK,['CB',33,76],['CB',67,76],['LM',12,50],['CM',37,54],['CM',63,54],['RM',88,50],['ST',36,24],['ST',64,24]],
    '3-4-1':[GK,['LB',20,74],['CB',50,77],['RB',80,74],['LM',14,50],['CM',38,54],['CM',62,54],['RM',86,50],['ST',50,22]]
  },
  7:{
    '2-3-1':[GK,['CB',30,74],['CB',70,74],['LM',16,50],['CM',50,52],['RM',84,50],['ST',50,22]],
    '3-2-1':[GK,['LB',20,74],['CB',50,77],['RB',80,74],['CM',33,50],['CM',67,50],['ST',50,22]],
    '2-1-2-1':[GK,['CB',30,76],['CB',70,76],['DM',50,60],['LM',22,42],['RM',78,42],['ST',50,20]],
    '3-1-2':[GK,['LB',20,74],['CB',50,77],['RB',80,74],['CM',50,52],['ST',33,24],['ST',67,24]]
  },
  5:{
    '1-2-1':[GK,['DEF',50,72],['LM',20,50],['RM',80,50],['ST',50,24]],
    '2-2':[GK,['DEF',30,70],['DEF',70,70],['ATT',30,32],['ATT',70,32]],
    '2-1-1':[GK,['DEF',30,72],['DEF',70,72],['MID',50,48],['ST',50,22]],
    '3-1':[GK,['DEF',20,68],['DEF',50,72],['DEF',80,68],['ST',50,26]]
  }
};
const GAA_F={
  15:{
    'Standard':[['GK',50,6],['RCB',20,20],['FB',50,20],['LCB',80,20],['RHB',16,35],['CHB',50,35],['LHB',84,35],['MF',37,50],['MF',63,50],['RHF',16,65],['CHF',50,65],['LHF',84,65],['RCF',20,80],['FF',50,80],['LCF',80,80]],
    'Sweeper':[['GK',50,7],['RCB',20,21],['FB',50,21],['LCB',80,21],['RHB',16,41],['CHB',50,42],['LHB',84,41],['MF',37,54],['MF',63,54],['RHF',16,66],['SW',50,30],['LHF',84,66],['RCF',20,79],['FF',50,79],['LCF',80,79]],
    'Defensive':[['GK',50,7],['RCB',20,20],['FB',50,20],['LCB',80,20],['RHB',16,40],['CHB',50,41],['LHB',84,40],['MF',37,53],['MF',63,53],['RHF',13,56],['SW',50,29],['LHF',87,56],['RCF',24,76],['FF',50,78],['LCF',76,76]],
    'Push up':[['GK',50,7],['RCB',20,30],['FB',50,30],['LCB',80,30],['RHB',16,44],['CHB',50,44],['LHB',84,44],['MF',37,57],['MF',63,57],['RHF',16,69],['CHF',50,69],['LHF',84,69],['RCF',20,83],['FF',50,83],['LCF',80,83]],
    'Two inside':[['GK',50,7],['RCB',20,22],['FB',50,22],['LCB',80,22],['RHB',16,36],['CHB',50,36],['LHB',84,36],['MF',33,49],['MF',67,49],['RHF',14,62],['CHF',50,59],['LHF',86,62],['RCF',32,83],['FF',50,71],['LCF',68,83]]
  },
  13:{
    'Standard':[['GK',50,7],['RCB',22,22],['FB',50,22],['LCB',78,22],['RHB',26,37],['LHB',74,37],['MF',37,50],['MF',63,50],['RHF',26,63],['LHF',74,63],['RCF',22,78],['FF',50,78],['LCF',78,78]],
    'Push up':[['GK',50,7],['RCB',22,30],['FB',50,30],['LCB',78,30],['RHB',26,44],['LHB',74,44],['MF',37,56],['MF',63,56],['RHF',26,68],['LHF',74,68],['RCF',22,82],['FF',50,82],['LCF',78,82]]
  },
  11:{
    'Standard':[['GK',50,7],['RB',30,23],['LB',70,23],['RHB',18,38],['CHB',50,38],['LHB',82,38],['MF',37,52],['MF',63,52],['RF',22,72],['FF',50,74],['LF',78,72]],
    'Three back':[['GK',50,7],['RCB',22,23],['FB',50,24],['LCB',78,23],['RHB',28,40],['LHB',72,40],['MF',37,52],['MF',63,52],['CHF',50,64],['RF',32,78],['LF',68,78]]
  },
  9:{
    'Standard':[['GK',50,8],['RB',30,25],['LB',70,25],['CHB',50,39],['MF',30,52],['MF',70,52],['CHF',50,65],['RF',30,78],['LF',70,78]],
    'Three back':[['GK',50,8],['RB',22,25],['FB',50,27],['LB',78,25],['MF',32,48],['MF',68,48],['RF',22,72],['FF',50,75],['LF',78,72]]
  },
  7:{
    'Standard':[['GK',50,8],['RB',30,27],['LB',70,27],['MF',30,52],['MF',70,52],['RF',30,76],['LF',70,76]],
    'Diamond':[['GK',50,8],['FB',50,26],['RHB',22,42],['LHB',78,42],['MF',50,54],['RF',32,76],['LF',68,76]]
  }
};
const SPORT_NAME={soccer:'Soccer',football:'Gaelic football',hurling:'Hurling'};
const isGAA=sp=>sp==='football'||sp==='hurling';
const formatsFor=sp=>isGAA(sp)?[7,9,11,13,15]:[5,7,9,11];
const formsFor=(sp,f)=>(isGAA(sp)?GAA_F:SOCCER_F)[f]||{};
const TAGS_BY={
  soccer:['Press high','Stay compact','Play out from the back','Go long early','Counter quickly','Full-backs overlap','Track your runner','Win the second ball','Talk to each other','Keep it simple'],
  football:['Win our own kick-outs','Press their kick-out','Drop a sweeper','Get bodies behind the ball','Support the runner','Kick it in early','Work it through the hands','Shoot when it\'s on','Tackle in numbers','No cheap frees','Talk to each other'],
  hurling:['Win our own puck-outs','Press their puck-out','Win the breaking ball','Hook and block','Use the short puck-out','Hit the full-forward early','Ground hurling in the square','Mind your man','No cheap frees','Talk to each other']
};
const ROLES={
  soccer:[['corners','Corners'],['freeKicks','Free kicks'],['penalties','Penalties']],
  football:[['frees','Frees'],['fortyfives','45s'],['kickouts','Kick-outs'],['penalties','Penalties']],
  hurling:[['frees','Frees'],['sixtyfives','65s'],['puckouts','Puck-outs'],['penalties','Penalties']]
};
const KITS=[['#d6262f','Red'],['#1f4fbf','Royal blue'],['#6fb7e8','Sky blue'],['#127a3e','Green'],['#f2c12e','Yellow'],['#ef7d1a','Orange'],['#6b2d8c','Purple'],['#7a1f35','Maroon'],['#161616','Black'],['#f4f4f2','White']];
const GK_KITS=[['#f2c12e','Yellow'],['#2fd16b','Green'],['#ef7d1a','Orange'],['#e04694','Pink'],['#161616','Black'],['#8a8f98','Grey']];
const EXAMPLE_NAMES=[['Seán Kelly',1],['Darragh Moore',2],['Liam Doyle',4],['Cian Walsh',5],['Mark Brennan',3],['Eoin Fitzgerald',7],['Ryan Nolan',8],['Jamie Quinn',6],['Shane Murphy',11],['Aaron Flood',9],['Niall Kearney',10],['Ben Gallagher',12],['Kevin Dunne',14],['Oisín Ryan',15],['Paddy Hogan',16],['Tommy Byrne',17],['Fionn Carey',18],['Cathal Reilly',19],['Dara Phelan',20],['Rory Maher',21],['Colm Tierney',22],['Ciarán Lynch',23],['Odhrán Daly',24],['Donal Hennessy',25]];
const PERIOD_NAMES={2:['1st half','2nd half'],3:['1st third','2nd third','3rd third'],4:['Q1','Q2','Q3','Q4']};
const KEY='teamselect.v2', OLD_KEY='matchday.lineup.v1', OLD_SAVED='matchday.lineup.saved.v1';
const APP_URL=location.origin+location.pathname;

/* ================= Small helpers ================= */
const $=id=>document.getElementById(id);
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
const clone=o=>JSON.parse(JSON.stringify(o));
const store={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}};
function esc(t){return String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function inkFor(hex){const n=parseInt(String(hex).slice(1),16),r=n>>16,g=n>>8&255,b=n&255;return (0.299*r+0.587*g+0.114*b)>160?'#121212':'#ffffff'}
function fmtDate(d,long){if(!d)return'';const t=new Date(d+'T12:00:00');if(isNaN(t))return d;return t.toLocaleDateString(undefined,long?{weekday:'long',day:'numeric',month:'long'}:{weekday:'short',day:'numeric',month:'short'})}
function nextSaturday(){const d=new Date();d.setDate(d.getDate()+((6-d.getDay()+7)%7||7));return d.toISOString().slice(0,10)}
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
let toastT;function toast(t){const el=$('toast');el.textContent=t;el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,2400)}
function copyText(text,okMsg,fallbackEl){
  try{navigator.clipboard.writeText(text).then(()=>toast(okMsg||'Copied'),()=>selectEl(fallbackEl))}catch(e){selectEl(fallbackEl)}
}
function selectEl(el){if(!el)return;const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);toast('Select all and copy')}
async function deliverFile(blob,name,title,preferDownload){
  const f=new File([blob],name,{type:blob.type});
  if(!preferDownload&&navigator.canShare&&navigator.canShare({files:[f]})){
    try{await navigator.share({files:[f],title});return true}catch(e){if(e&&e.name==='AbortError')return false}
  }
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),5000);return true;
}

/* ================= Model ================= */
function blankMatch(team,opts={}){
  const m={id:uid(),opp:'',ha:'Home',date:nextSaturday(),ko:'11:00',meet:'10:15',venue:'',format:opts.format||(isGAA(team.sport)?15:11),
    formation:opts.formation||'',slots:[],bench:new Array(opts.bench??(isGAA(team.sport)?8:5)).fill(null),captain:null,roles:{},tags:[],notes:'',
    pnotes:{},avail:{},plan:{on:false,periods:2,mins:isGAA(team.sport)?30:30,fixGK:true},played:false,created:Date.now()};
  applyFormation(m,team.sport,false);return m;
}
function blankTeam(name,sport){return{id:uid(),name:name||'My team',sport:sport||'soccer',kit:'#d6262f',gkKit:'#f2c12e',crest:null,players:[],matches:[],activeMatch:null}}
function applyFormation(m,sport,keep){
  const F=formsFor(sport,m.format);
  if(!F[m.formation])m.formation=Object.keys(F)[0];
  const old=m.slots||[];
  m.slots=F[m.formation].map(([label,x,y],i)=>({label,x,y,row:y,pid:keep&&old[i]?old[i].pid:null}));
  if(keep)old.slice(m.slots.length).forEach(s=>{if(s.pid){const j=m.bench.indexOf(null);if(j>=0)m.bench[j]=s.pid}});
}
function autoFill(t,m){
  const placed=new Set([...m.slots.map(s=>s.pid),...m.bench].filter(Boolean));
  const pool=t.players.filter(p=>!placed.has(p.id)&&m.avail[p.id]!=='n').sort(byNum);
  m.slots.forEach(s=>{if(!s.pid&&pool.length)s.pid=pool.shift().id});
  m.bench=m.bench.map(b=>b||(pool.length?pool.shift().id:null));
}
function exampleDB(){
  const t=blankTeam('Riverside Rovers','soccer');t.example=true;
  t.players=EXAMPLE_NAMES.slice(0,18).map(([name,num])=>({id:uid(),name,num:String(num)}));
  const m=blankMatch(t,{format:11,formation:'4-4-2',bench:5});
  Object.assign(m,{opp:'Kilbrook Athletic',venue:'Riverside Park, Pitch 2',tags:['Press high','Talk to each other'],notes:'Warm-up starts 10:20. Shin pads and both kits, please.'});
  m.slots.forEach((s,i)=>s.pid=t.players[i].id);m.bench=m.bench.map((_,i)=>t.players[11+i].id);
  m.captain=t.players[3].id;m.roles={corners:t.players[10].id,freeKicks:t.players[10].id,penalties:t.players[9].id};
  m.pnotes[t.players[3].id]='Organise the back line and call the offside.';
  t.players.forEach((p,i)=>m.avail[p.id]=i===16?'n':i<14?'y':undefined);
  Object.keys(m.avail).forEach(k=>m.avail[k]===undefined&&delete m.avail[k]);
  t.matches=[m];t.activeMatch=m.id;
  return{v:2,activeTeam:t.id,teams:[t]};
}
/* Version 1 kept one flat object; turn it into a team with one match, plus any saved line-ups as extra matches. */
function migrateV1(S,saved){
  const t=blankTeam(S.team||'My team',S.sport||'soccer');
  Object.assign(t,{kit:S.kit||t.kit,gkKit:S.gkKit||t.gkKit,example:!!S.example,players:(S.players||[]).map(p=>({id:p.id,name:p.name,num:p.num||''}))});
  const toMatch=s=>{const m=blankMatch(t,{format:s.format,formation:s.formation,bench:(s.bench||[]).length});
    Object.assign(m,{opp:s.opp||'',ha:s.ha||'Home',date:s.date||'',ko:s.ko||'',meet:s.meet||'',venue:s.venue||'',slots:(s.slots||m.slots).map(x=>({...x,row:x.row??x.y})),bench:s.bench||[],captain:s.captain||null,
      roles:s.roles||{corners:s.corners||null,freeKicks:s.freeKicks||null,penalties:s.penalties||null},tags:s.tags||[],notes:s.notes||''});
    (s.players||[]).forEach(p=>{if(p.note)m.pnotes[p.id]=p.note;if(!t.players.find(q=>q.id===p.id))t.players.push({id:p.id,name:p.name,num:p.num||''})});
    return m};
  const m=toMatch(S);t.matches=[m];
  (saved||[]).forEach(x=>{if(x&&x.state){const mm=toMatch(x.state);mm.created=x.at||Date.now();t.matches.push(mm)}});
  t.activeMatch=m.id;return{v:2,activeTeam:t.id,teams:[t]};
}
function load(){
  const d=store.get(KEY);
  if(d&&d.v===2&&d.teams&&d.teams.length)return{db:d,first:false};
  const old=store.get(OLD_KEY);
  if(old&&old.v)return{db:migrateV1(old,store.get(OLD_SAVED)),first:false,migrated:true};
  return{db:exampleDB(),first:true};
}
let DB, firstRun=false;
const T=()=>DB.teams.find(t=>t.id===DB.activeTeam)||DB.teams[0];
const M=()=>{const t=T();return t.matches.find(m=>m.id===t.activeMatch)||t.matches[0]};
const P=id=>T().players.find(p=>p.id===id)||null;
function save(){if(!store.set(KEY,DB))toast('Could not save on this device. Storage may be full.')}

/* Undo: a snapshot of everything before each change. */
const undoStack=[];
function snap(){undoStack.push(JSON.stringify(DB));if(undoStack.length>40)undoStack.shift();$('undoBtn').disabled=false}
function change(fn){snap();fn();save();render()}
function undo(){if(!undoStack.length)return;DB=JSON.parse(undoStack.pop());sel=null;save();render();$('undoBtn').disabled=!undoStack.length;toast('Undone')}

/* ================= Names, numbers, locations ================= */
function byNum(a,b){return (parseInt(a.num)||999)-(parseInt(b.num)||999)||a.name.localeCompare(b.name)}
function shortName(p){if(!p)return'';const parts=p.name.trim().split(/\s+/);if(parts.length<2)return parts[0];
  const sur=parts[parts.length-1],low=norm(sur);
  const clash=T().players.some(q=>q!==p&&norm(q.name.trim().split(/\s+/).pop())===low);
  return clash?parts[0][0]+'. '+sur:sur}
/* GAA jerseys follow position (1-15, subs carry on); soccer uses each player's own number. */
function dispNum(pid,m=M()){const p=P(pid);if(!p)return'';if(!isGAA(T().sport))return p.num||'';
  const i=m.slots.findIndex(s=>s.pid===pid);if(i>=0)return String(i+1);
  const b=m.bench.indexOf(pid);if(b>=0)return String(m.slots.length+1+m.bench.slice(0,b).filter(Boolean).length);return''}
const sameLoc=(a,b)=>a&&b&&a.kind===b.kind&&a.i===b.i&&a.pid===b.pid;
function getPid(l){const m=M();if(l.kind==='pitch')return m.slots[l.i].pid;if(l.kind==='bench')return m.bench[l.i];if(l.kind==='pool')return l.pid;return null}
function setPid(l,pid){const m=M();if(l.kind==='pitch')m.slots[l.i].pid=pid;else if(l.kind==='bench')m.bench[l.i]=pid}
function locOf(pid){const m=M();let i=m.slots.findIndex(s=>s.pid===pid);if(i>=0)return{kind:'pitch',i};i=m.bench.indexOf(pid);if(i>=0)return{kind:'bench',i};return{kind:'pool',pid}}
function swap(a,b){
  if(sameLoc(a,b))return;
  if(a.kind==='pool')a=locOf(a.pid);if(b.kind==='pool')b=locOf(b.pid);
  if(a.kind==='pool'&&b.kind==='pool')return;
  const pa=getPid(a),pb=getPid(b);setPid(a,pb);setPid(b,pa);
}
function parseLoc(str){if(!str)return null;const [k,v]=str.split(':');if(k==='pitch'||k==='bench')return{kind:k,i:+v};if(k==='pool')return{kind:'pool',pid:v};return{kind:k}}
const koWord=()=>isGAA(T().sport)?'Throw-in':'KO';
const roleList=(m=M())=>ROLES[T().sport].map(([k,l])=>[l,m.roles[k]]);
const isOut=pid=>M().avail[pid]==='n';

/* ================= Pitch drawing (shared by the board, the player card and the share picture) ================= */
function pitchSpec(sp){
  if(!isGAA(sp))return{w:68,items:[
    {t:'rect',x:2,y:2,w:64,h:96},{t:'line',x1:2,y1:50,x2:66,y2:50},{t:'circle',cx:34,cy:50,r:8.7},
    {t:'rect',x:13.85,y:2,w:40.3,h:15.7},{t:'rect',x:24.85,y:2,w:18.3,h:5.2},{t:'rect',x:13.85,y:82.3,w:40.3,h:15.7},{t:'rect',x:24.85,y:92.8,w:18.3,h:5.2},
    {t:'arc',cx:34,cy:12,r:8.7,a0:40.9,a1:139.1},{t:'arc',cx:34,cy:88,r:8.7,a0:220.9,a1:319.1},
    {t:'dot',cx:34,cy:50,r:.6},{t:'dot',cx:34,cy:12,r:.5},{t:'dot',cx:34,cy:88,r:.5}]};
  const u=v=>v/1.458,it=[{t:'rect',x:2,y:2,w:57,h:96},{t:'line',x1:2,y1:50,x2:59,y2:50}];
  [13,20,45,65].forEach(d=>it.push({t:'line',x1:2,y1:2+u(d),x2:59,y2:2+u(d)},{t:'line',x1:2,y1:98-u(d),x2:59,y2:98-u(d)}));
  it.push({t:'rect',x:30.5-u(9.5),y:2,w:u(19),h:u(13)},{t:'rect',x:30.5-u(7),y:2,w:u(14),h:u(4.5)},
    {t:'rect',x:30.5-u(9.5),y:98-u(13),w:u(19),h:u(13)},{t:'rect',x:30.5-u(7),y:98-u(4.5),w:u(14),h:u(4.5)},
    {t:'arc',cx:30.5,cy:2+u(20),r:u(13),a0:0,a1:180},{t:'arc',cx:30.5,cy:98-u(20),r:u(13),a0:180,a1:360},
    {t:'line',x1:30.5-u(3.25),y1:2,x2:30.5+u(3.25),y2:2,lw:3},{t:'line',x1:30.5-u(3.25),y1:98,x2:30.5+u(3.25),y2:98,lw:3},
    {t:'dot',cx:30.5,cy:2+u(11),r:.5},{t:'dot',cx:30.5,cy:98-u(11),r:.5});
  return{w:61,items:it};
}
function drawPitch(pitchEl,svgEl,labelEl,sport){
  const spec=pitchSpec(sport),pt=(cx,cy,r,a)=>[cx+r*Math.cos(a*Math.PI/180),cy+r*Math.sin(a*Math.PI/180)].map(v=>v.toFixed(2)).join(' ');
  const out=spec.items.map(o=>{
    if(o.t==='rect')return `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}"/>`;
    if(o.t==='line')return `<line x1="${o.x1}" y1="${o.y1}" x2="${o.x2}" y2="${o.y2}"${o.lw?` stroke-width="${.35*o.lw}"`:''}/>`;
    if(o.t==='circle')return `<circle cx="${o.cx}" cy="${o.cy}" r="${o.r}"/>`;
    if(o.t==='arc')return `<path d="M${pt(o.cx,o.cy,o.r,o.a0)} A${o.r} ${o.r} 0 ${o.a1-o.a0>180?1:0} 1 ${pt(o.cx,o.cy,o.r,o.a1)}"/>`;
    return `<circle cx="${o.cx}" cy="${o.cy}" r="${o.r}" fill="rgba(255,255,255,.88)" stroke="none"/>`;
  }).join('');
  svgEl.setAttribute('viewBox',`0 0 ${spec.w} 100`);
  svgEl.innerHTML=`<g fill="none" stroke="rgba(255,255,255,.88)" stroke-width=".35">${out}</g>`;
  pitchEl.style.setProperty('--pa',`${spec.w}/100`);pitchEl.style.setProperty('--pf',String(spec.w/100));
  if(labelEl){const down=isGAA(sport);labelEl.textContent=down?'Attacking ↓':'Attacking ↑';labelEl.style.top=down?'auto':'10px';labelEl.style.bottom=down?'10px':'auto'}
}
function strokePitch(ctx,sport,px,py,pw,ph){
  const spec=pitchSpec(sport),k=pw/spec.w,X=v=>px+v*k,Y=v=>py+v/100*ph;
  ctx.strokeStyle='rgba(255,255,255,.85)';ctx.fillStyle='rgba(255,255,255,.85)';
  spec.items.forEach(o=>{ctx.lineWidth=3*(o.lw||1);ctx.beginPath();
    if(o.t==='rect')ctx.strokeRect(X(o.x),Y(o.y),o.w*k,o.h/100*ph);
    else if(o.t==='line'){ctx.moveTo(X(o.x1),Y(o.y1));ctx.lineTo(X(o.x2),Y(o.y2));ctx.stroke()}
    else if(o.t==='circle'){ctx.arc(X(o.cx),Y(o.cy),o.r*k,0,Math.PI*2);ctx.stroke()}
    else if(o.t==='arc'){ctx.arc(X(o.cx),Y(o.cy),o.r*k,o.a0*Math.PI/180,o.a1*Math.PI/180);ctx.stroke()}
    else{ctx.arc(X(o.cx),Y(o.cy),Math.max(3,o.r*k),0,Math.PI*2);ctx.fill()}
  });
}

/* ================= Minutes planner =================
   Each period, the players with the fewest minutes so far play; ties go to whoever sat out last.
   Players coming on take the positions of those going off. The keeper can be fixed. */
function rotation(m=M()){
  const p=m.plan;if(!p||!p.on)return null;
  const K=Math.max(1,+p.periods||2),L=Math.max(1,+p.mins||30),out=pid=>m.avail[pid]==='n';
  const gkIdx=m.slots.findIndex(s=>s.label==='GK');
  const fixed=p.fixGK&&gkIdx>=0&&m.slots[gkIdx].pid&&!out(m.slots[gkIdx].pid)?m.slots[gkIdx].pid:null;
  const slotsOut=m.slots.map((_,i)=>i).filter(i=>!(fixed&&i===gkIdx));
  const pool=[...m.slots.map(s=>s.pid),...m.bench].filter(pid=>pid&&!out(pid)&&pid!==fixed);
  const mins={},grid={};[fixed,...pool].filter(Boolean).forEach(pid=>{mins[pid]=0;grid[pid]=new Array(K).fill(-1)});
  const assign={};slotsOut.forEach(i=>{const pid=m.slots[i].pid;assign[i]=pid&&!out(pid)?pid:null});
  const changes=[];
  for(let k=0;k<K;k++){
    if(k>0){
      const onNow=Object.values(assign).filter(Boolean);
      const want=Math.min(slotsOut.length,pool.length);
      const ranked=pool.slice().sort((a,b)=>mins[a]-mins[b]||(onNow.includes(a)-onNow.includes(b)));
      const chosen=new Set(ranked.slice(0,want));
      const off=onNow.filter(pid=>!chosen.has(pid)),on=[...chosen].filter(pid=>!onNow.includes(pid));
      const free=slotsOut.filter(i=>!assign[i]||off.includes(assign[i]));
      free.forEach(i=>assign[i]=null);on.forEach((pid,j)=>{if(free[j]!==undefined)assign[free[j]]=pid});
      if(off.length||on.length)changes.push({k,off,on});
    }
    Object.entries(assign).forEach(([i,pid])=>{if(pid){grid[pid][k]=+i;mins[pid]+=L}});
    if(fixed){grid[fixed][k]=gkIdx;mins[fixed]+=L}
  }
  return{K,L,grid,mins,changes,fixed,order:[fixed,...pool].filter(Boolean),target:pool.length?Math.round(slotsOut.length*K*L/pool.length):0};
}
const periodName=(K,k)=>(PERIOD_NAMES[K]||[])[k]||`Period ${k+1}`;
function rotationLines(m=M()){
  const r=rotation(m);if(!r||!r.changes.length)return[];
  return r.changes.map(c=>`${periodName(r.K,c.k)}: on ${c.on.map(id=>P(id)?.name).join(', ')||'nobody'}; off ${c.off.map(id=>P(id)?.name).join(', ')||'nobody'}`);
}

/* ================= Season stats ================= */
function seasonStats(t){
  const rows=Object.fromEntries(t.players.map(p=>[p.id,{p,starts:0,bench:0,out:0,mins:0,hasMins:false}]));
  const played=t.matches.filter(m=>m.played);
  const prevT=DB.activeTeam;DB.activeTeam=t.id;
  played.forEach(m=>{
    const r=rotation(m);
    m.slots.forEach(s=>{if(s.pid&&rows[s.pid]&&m.avail[s.pid]!=='n')rows[s.pid].starts++});
    m.bench.forEach(pid=>{if(pid&&rows[pid]&&m.avail[pid]!=='n')rows[pid].bench++});
    Object.entries(m.avail).forEach(([pid,v])=>{if(v==='n'&&rows[pid])rows[pid].out++});
    if(r)Object.entries(r.mins).forEach(([pid,v])=>{if(rows[pid]){rows[pid].mins+=v;rows[pid].hasMins=true}});
  });
  DB.activeTeam=prevT;
  return{played:played.length,rows:Object.values(rows)};
}

/* ================= Board render ================= */
let sel=null,tab='squad',drag=null,pendingConfirm=null;
function render(){
  const t=T(),m=M();
  document.documentElement.style.setProperty('--kit',t.kit);
  document.documentElement.style.setProperty('--kit-ink',inkFor(t.kit));
  $('title').innerHTML=m.opp?`${esc(t.name)} <span class="vs">v</span> ${esc(m.opp)}`:esc(t.name);
  const when=[fmtDate(m.date),m.ko&&(koWord()+' '+m.ko)].filter(Boolean).join(' · ');
  $('eyebrow').textContent=[SPORT_NAME[t.sport],m.format+'-a-side',m.ha,when].filter(Boolean).join(' · ');
  const cr=$('crest');cr.hidden=!t.crest;if(t.crest)cr.src=t.crest;
  $('teamSel').innerHTML=DB.teams.map(x=>`<option value="${x.id}" ${x.id===t.id?'selected':''}>${esc(x.name)}</option>`).join('')+'<option value="__new">+ New team…</option>';
  $('formationSel').innerHTML=Object.keys(formsFor(t.sport,m.format)).map(f=>`<option ${f===m.formation?'selected':''}>${esc(f)}</option>`).join('');
  drawPitch($('pitch'),$('pitchLines'),$('attackLbl'),t.sport);
  renderTokens();renderBench();renderPanel();renderHint();
}
function discStyle(gk){const k=gk?T().gkKit:T().kit;return `--kit:${k};--kit-ink:${inkFor(k)}`}
function capBadge(pid){return M().captain===pid?'<span class="cap">C</span>':''}
function renderTokens(){
  const m=M();
  $('tokens').innerHTML=m.slots.map((s,i)=>{
    const p=P(s.pid),isSel=sel&&sameLoc(sel,{kind:'pitch',i});
    if(!p)return `<div class="tok empty${isSel?' sel':''}" role="button" tabindex="0" aria-label="Empty ${esc(s.label)}" data-loc="pitch:${i}" style="left:${s.x}%;top:${s.y}%"><div class="disc">${esc(s.label)}</div><span class="pos">Tap to fill</span></div>`;
    return `<div class="tok${isSel?' sel':''}${isOut(p.id)?' out':''}" role="button" tabindex="0" data-loc="pitch:${i}" style="left:${s.x}%;top:${s.y}%;${discStyle(s.label==='GK')}" aria-label="${esc(s.label)}, ${esc(p.name)}${isOut(p.id)?', marked unavailable':''}">
      <div class="disc">${esc(dispNum(p.id))}${capBadge(p.id)}</div><span class="name">${esc(shortName(p))}</span><span class="pos">${esc(s.label)}</span></div>`;
  }).join('');
}
function renderBench(){
  const m=M();
  $('benchCount').textContent=m.bench.length;
  $('benchLabel').textContent=`Bench · ${m.bench.filter(Boolean).length}/${m.bench.length}`;
  if(!m.bench.length){$('bench').innerHTML='<p class="muted">No bench slots. Use + to add some.</p>';return}
  $('bench').innerHTML=m.bench.map((pid,i)=>{
    const p=P(pid),isSel=sel&&sameLoc(sel,{kind:'bench',i});
    if(!p)return `<div class="bench-slot empty${isSel?' sel':''}" role="button" tabindex="0" aria-label="Empty bench slot" data-loc="bench:${i}"><div class="disc">SUB</div><span class="bname">Empty</span></div>`;
    return `<div class="bench-slot${isSel?' sel':''}${isOut(p.id)?' out':''}" role="button" tabindex="0" aria-label="Bench, ${esc(p.name)}" data-loc="bench:${i}"><div class="disc" style="${discStyle(false)}">${esc(dispNum(p.id))}${capBadge(p.id)}</div><span class="bname">${esc(shortName(p))}</span></div>`;
  }).join('');
}
function renderHint(){
  if(!sel){$('hint').hidden=true;return}
  const pid=getPid(sel);
  $('hintText').textContent=pid?`${shortName(P(pid))} selected · tap another spot to swap`:'Empty spot selected · tap a player to put them here';
  $('hint').hidden=false;
}

/* ================= Panels ================= */
function renderPanel(){
  document.querySelectorAll('.tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===tab)));
  const body=$('panelBody');const scroll=body.scrollTop;
  body.innerHTML=tab==='squad'?squadHTML():tab==='plan'?planHTML():tab==='match'?matchHTML():seasonHTML();
  body.scrollTop=scroll;
}
function avBtn(p){const v=M().avail[p.id];return `<button type="button" class="av ${v||''}" data-av="${p.id}" aria-label="${esc(p.name)} availability: ${v==='y'?'in':v==='n'?'out':'no reply'}">${v==='y'?'IN':v==='n'?'OUT':'?'}</button>`}
function poolItem(p){
  const l=locOf(p.id),m=M();const where=l.kind==='pitch'?m.slots[l.i].label:l.kind==='bench'?'Bench':'';
  const isSel=sel&&((sel.kind==='pool'&&sel.pid===p.id)||sameLoc(sel,l));
  return `<div class="pool-item${where?' assigned':''}${isOut(p.id)?' is-out':''}${isSel?' sel':''}" data-loc="pool:${p.id}"><span class="num">${esc(dispNum(p.id)||'–')}</span><span class="pname">${esc(p.name)}</span>${where?`<span class="where">${esc(where)}</span>`:''}${avBtn(p)}</div>`;
}
function squadHTML(){
  const t=T(),m=M();
  const placed=new Set([...m.slots.map(s=>s.pid),...m.bench].filter(Boolean));
  const counts={y:0,n:0,q:0};t.players.forEach(p=>{const v=m.avail[p.id];if(v==='y')counts.y++;else if(v==='n')counts.n++;else counts.q++});
  const pickedOut=t.players.filter(p=>placed.has(p.id)&&m.avail[p.id]==='n');
  const avOrder=p=>m.avail[p.id]==='y'?0:m.avail[p.id]==='n'?2:1;
  const free=t.players.filter(p=>!placed.has(p.id)&&m.avail[p.id]!=='n').sort((a,b)=>avOrder(a)-avOrder(b)||byNum(a,b));
  const outs=t.players.filter(p=>!placed.has(p.id)&&m.avail[p.id]==='n').sort(byNum);
  const picked=t.players.filter(p=>placed.has(p.id)).sort(isGAA(t.sport)?(a,b)=>(+dispNum(a.id))-(+dispNum(b.id)):byNum);
  return `${t.example?`<div class="notice"><p>This is an example squad. Clear it and add your own players.</p><button class="btn small" data-act="clearExample">Clear example</button></div>`:''}
  ${!t.players.length?`<div class="notice"><p>No players yet. Paste your squad list from WhatsApp or notes to get started.</p><button class="btn small primary" data-act="bulk">Paste a list</button></div>`:''}
  <div class="section"><div class="section-head"><span class="label">Availability</span><div class="row"><button class="btn small" data-act="askGroup">Ask the group</button><button class="btn small" data-act="pasteReplies">Paste replies</button></div></div>
    <div class="summary"><div class="stat y"><b>${counts.y}</b><span>In</span></div><div class="stat n"><b>${counts.n}</b><span>Out</span></div><div class="stat"><b>${counts.q}</b><span>No reply</span></div></div>
    ${pickedOut.length?`<div class="notice bad"><p>${pickedOut.map(p=>esc(shortName(p))).join(', ')} ${pickedOut.length>1?'are':'is'} picked but marked out.</p></div>`:''}
    <p class="muted">Tap IN / OUT / ? beside a name to change it.</p></div>
  <div class="section"><span class="label">Not picked · ${free.length}</span>
    <div class="pool" data-loc="poolarea">${free.map(poolItem).join('')||'<p class="muted" style="padding:8px">Everyone available is picked. Drag a player here to take them out of the team.</p>'}</div></div>
  <div class="section"><span class="label">Picked · ${picked.length}</span><div class="pool">${picked.map(poolItem).join('')||'<p class="muted" style="padding:8px">No one picked yet.</p>'}</div></div>
  ${outs.length?`<div class="section"><span class="label">Not available · ${outs.length}</span><div class="pool">${outs.map(poolItem).join('')}</div></div>`:''}
  <div class="section"><span class="label">Add players</span>
    <div class="row">${isGAA(t.sport)?'':'<div class="field" style="flex:0 0 70px"><label for="newNum">No.</label><input id="newNum" inputmode="numeric" maxlength="3"></div>'}
    <div class="field"><label for="newName">Name</label><input id="newName" autocomplete="off" placeholder="e.g. Jack Ryan"></div></div>
    <div class="row"><button class="btn small primary" data-act="addPlayer">Add player</button><button class="btn small" data-act="bulk">Paste a list</button></div></div>`;
}
function playerOptions(cur){return `<option value="">—</option>`+T().players.slice().sort(byNum).map(p=>`<option value="${p.id}" ${p.id===cur?'selected':''}>${esc(p.name)}</option>`).join('')}
function planHTML(){
  const t=T(),m=M(),r=rotation(m),pl=m.plan;
  const notes=Object.entries(m.pnotes).filter(([pid,v])=>v&&P(pid));
  let rotHTML='';
  if(pl.on&&r){
    const cols=Array.from({length:r.K},(_,k)=>`<th class="c">${esc(periodName(r.K,k))}</th>`).join('');
    const rows=r.order.map(pid=>{const p=P(pid);const cells=r.grid[pid].map(i=>i>=0?`<td class="c on">${esc(m.slots[i].label)}</td>`:'<td class="c">–</td>').join('');
      const low=r.mins[pid]<r.target*0.75;return `<tr><td>${esc(shortName(p))}</td>${cells}<td class="c ${low?'low':''}">${r.mins[pid]}</td></tr>`}).join('');
    rotHTML=`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Player</th>${cols}<th class="c">Mins</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="muted">Fair share is about ${r.target} minutes each${r.fixed?', with the keeper on throughout':''}. ${r.changes.length?'':'Everyone available plays the whole match.'}</p>
      ${r.changes.map(c=>`<div class="list-item"><div class="grow"><div class="t1">${esc(periodName(r.K,c.k))}</div><div class="t2">On: ${esc(c.on.map(id=>shortName(P(id))).join(', '))} · Off: ${esc(c.off.map(id=>shortName(P(id))).join(', '))}</div></div></div>`).join('')}`;
  }
  return `<div class="section"><span class="label">Team instructions</span>
    <div class="chips">${TAGS_BY[t.sport].map(x=>`<button class="chip" data-tag="${esc(x)}" aria-pressed="${m.tags.includes(x)}">${esc(x)}</button>`).join('')}</div></div>
  <div class="section"><div class="field"><label for="notes">Notes for the group</label><textarea id="notes" data-bind="notes" placeholder="Meeting point, what to bring, focus for the day">${esc(m.notes)}</textarea></div></div>
  <div class="section"><span class="label">Captain, ${isGAA(t.sport)?'frees and restarts':'set pieces'}</span>
    <div class="row"><div class="field"><label for="captain">Captain</label><select id="captain" data-bind="captain">${playerOptions(m.captain)}</select></div></div>
    <div class="row">${ROLES[t.sport].map(([k,l])=>`<div class="field"><label for="role-${k}">${l}</label><select id="role-${k}" data-bind="role:${k}">${playerOptions(m.roles[k])}</select></div>`).join('')}</div></div>
  <div class="section"><span class="label">Individual instructions</span>
    <p class="muted">Tap a player twice on the pitch to write one. These stay with this match only.</p>
    ${notes.map(([pid,v])=>`<div class="list-item"><div class="grow"><div class="t1">${esc(P(pid).name)}</div><div class="t2">${esc(v)}</div></div></div>`).join('')}</div>
  <div class="section"><div class="section-head"><span class="label">Minutes planner</span></div>
    <label class="check"><input type="checkbox" id="planOn" ${pl.on?'checked':''}> Plan subs so everyone gets fair minutes</label>
    ${pl.on?`<div class="row"><div class="field"><label for="planPeriods">Periods</label><select id="planPeriods">${[2,3,4].map(n=>`<option value="${n}" ${+pl.periods===n?'selected':''}>${n===2?'Halves':n===3?'Thirds':'Quarters'}</option>`).join('')}</select></div>
    <div class="field"><label for="planMins">Minutes each</label><input id="planMins" type="number" min="5" max="60" inputmode="numeric" value="${esc(pl.mins)}"></div></div>
    <label class="check"><input type="checkbox" id="planGK" ${pl.fixGK?'checked':''}> Keep the same goalkeeper all match</label>${rotHTML}`:'<p class="muted">Useful for underage teams where everyone should get a similar share of the game. The plan goes out with the player link.</p>'}</div>`;
}
function matchHTML(){
  const t=T(),m=M();
  return `<div class="section"><span class="label">Fixture</span>
    <div class="row"><div class="field"><label for="opp">Opponent</label><input id="opp" data-bind="opp" value="${esc(m.opp)}"></div>
    <div class="field"><label for="ha">Home or away</label><select id="ha" data-bind="ha">${['Home','Away','Neutral'].map(o=>`<option ${o===m.ha?'selected':''}>${o}</option>`).join('')}</select></div></div>
    <div class="row"><div class="field"><label for="date">Date</label><input id="date" type="date" data-bind="date" value="${esc(m.date)}"></div>
    <div class="field"><label for="meet">Meet time</label><input id="meet" type="time" data-bind="meet" value="${esc(m.meet)}"></div>
    <div class="field"><label for="ko">${isGAA(t.sport)?'Throw-in':'Kick-off'}</label><input id="ko" type="time" data-bind="ko" value="${esc(m.ko)}"></div></div>
    <div class="field"><label for="venue">Venue</label><input id="venue" data-bind="venue" value="${esc(m.venue)}" placeholder="Ground, pitch number or Eircode"></div></div>
  <div class="section"><span class="label">Format</span>
    <div class="row"><div class="field"><label for="fmtSel">Players a side</label><select id="fmtSel">${formatsFor(t.sport).map(n=>`<option value="${n}" ${n===m.format?'selected':''}>${n}-a-side</option>`).join('')}</select></div></div>
    <div class="row"><button class="btn small" data-act="resetPos">Reset positions</button><button class="btn small" data-act="clearPitch">Clear the pitch</button><button class="btn small" data-act="autoFill">Fill from available</button></div></div>
  <div class="section"><span class="label">Kit</span>
    <div class="swatches">${KITS.map(([c,n])=>`<button class="swatch" style="background:${c}" data-kit="${c}" aria-label="${n}" aria-pressed="${c===t.kit}"></button>`).join('')}</div>
    <span class="label" style="margin-top:6px">Goalkeeper</span>
    <div class="swatches">${GK_KITS.map(([c,n])=>`<button class="swatch" style="background:${c}" data-gkkit="${c}" aria-label="${n}" aria-pressed="${c===t.gkKit}"></button>`).join('')}</div></div>`;
}
function seasonHTML(){
  const t=T(),m=M();
  const list=t.matches.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')||b.created-a.created);
  const st=seasonStats(t);
  const rows=st.rows.slice().sort((a,b)=>a.starts-b.starts||a.p.name.localeCompare(b.p.name));
  const anyMins=rows.some(r=>r.hasMins);
  const avgStarts=st.played?rows.reduce((s,r)=>s+r.starts,0)/Math.max(1,rows.length):0;
  return `<div class="section"><div class="section-head"><span class="label">Fixtures · ${t.matches.length}</span><button class="btn small primary" data-act="newMatch">New match</button></div>
    ${list.map(x=>`<div class="list-item${x.id===m.id?' current':''}"><div class="grow"><div class="t1">${x.opp?'v '+esc(x.opp):'Opponent not set'}</div><div class="t2">${esc(fmtDate(x.date)||'No date')} · ${esc(x.ha)} · ${x.format}-a-side ${x.played?'<span class="tag played">Played</span>':''}</div></div>
      ${x.id===m.id?'<span class="tag">Open</span>':`<button class="btn small" data-act="openMatch" data-id="${x.id}">Open</button>`}
      <button class="btn small" data-act="matchMenu" data-id="${x.id}" aria-label="More for this match">More</button></div>`).join('')}</div>
  <div class="section"><span class="label">Season so far</span>
    ${st.played?`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Player</th><th class="c">Starts</th><th class="c">Bench</th><th class="c">Out</th>${anyMins?'<th class="c">Mins</th>':''}</tr></thead><tbody>
      ${rows.map(r=>`<tr><td>${esc(r.p.name)}</td><td class="c ${st.played>1&&r.starts<avgStarts*0.6?'low':''}">${r.starts}</td><td class="c">${r.bench}</td><td class="c">${r.out}</td>${anyMins?`<td class="c">${r.hasMins?r.mins:'–'}</td>`:''}</tr>`).join('')}</tbody></table></div>
      <p class="muted">From ${st.played} match${st.played===1?'':'es'} marked as played. Fewest starts at the top, so nobody gets left out by accident.</p>`
      :'<p class="muted">Mark a match as played (More, then Mark as played) and starts, bench and minutes are counted here.</p>'}</div>
  <div class="section"><span class="label">Team</span>
    <div class="row"><div class="field"><label for="teamName">Team name</label><input id="teamName" value="${esc(t.name)}"></div></div>
    <p class="muted">${SPORT_NAME[t.sport]} · ${t.players.length} players</p>
    <div class="row"><button class="btn small" data-act="crest">${t.crest?'Change crest':'Add club crest'}</button>${t.crest?'<button class="btn small" data-act="crestOff">Remove crest</button>':''}</div>
    <div class="row"><button class="btn small" data-act="teamLink">Send team to a co-coach</button><button class="btn small" data-act="newTeam">Add another team</button></div>
    ${DB.teams.length>1?`<button class="btn small danger" data-act="delTeam" style="align-self:flex-start">${pendingConfirm==='delTeam'?'Tap again to delete '+esc(t.name):'Delete this team'}</button>`:''}</div>
  <div class="section"><span class="label">Backup</span>
    <p class="muted">Everything is kept on this device. Save a backup now and then, or before changing iPad.</p>
    <div class="row"><button class="btn small" data-act="exportAll">Save backup</button><button class="btn small" data-act="importAll">Restore from backup</button></div></div>`;
}

/* ================= Pointer: drag to move/swap, tap to select/swap ================= */
function onDown(e){
  if(e.target.closest('[data-av]'))return;
  const el=e.target.closest('[data-loc]');if(!el)return;
  const loc=parseLoc(el.dataset.loc);
  if(!loc||loc.kind==='pitcharea'||loc.kind==='poolarea'){if(loc&&loc.kind==='pitcharea'&&sel){sel=null;render()}return}
  if(e.button>0)return;
  drag={loc,el,x0:e.clientX,y0:e.clientY,moved:false,ghost:null,over:null,id:e.pointerId};
  if(loc.kind!=='pool')e.preventDefault();
  window.addEventListener('pointermove',onMove,{passive:false});
  window.addEventListener('pointerup',onUp);
  window.addEventListener('pointercancel',onCancel);
}
function makeGhost(loc){
  const pid=getPid(loc),p=P(pid),g=document.createElement('div');g.className='ghost';
  const gk=loc.kind==='pitch'&&M().slots[loc.i].label==='GK';
  g.innerHTML=p?`<div class="disc" style="${discStyle(gk)}">${esc(dispNum(p.id))}</div><span class="name">${esc(shortName(p))}</span>`:`<div class="disc" style="background:rgba(0,0,0,.25);border-style:dashed">${loc.kind==='pitch'?esc(M().slots[loc.i].label):'SUB'}</div>`;
  document.body.appendChild(g);return g;
}
function onMove(e){
  if(!drag||e.pointerId!==drag.id)return;
  if(!drag.moved){
    if(Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)<8)return;
    if(!getPid(drag.loc)&&drag.loc.kind!=='pitch')return;
    drag.moved=true;drag.ghost=makeGhost(drag.loc);drag.el.classList.add('dragging');
  }
  e.preventDefault();
  drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';
  const t=targetEl(e.clientX,e.clientY);
  if(drag.over&&drag.over!==t)drag.over.classList.remove('over');
  if(t&&t!==drag.over)t.classList.add('over');
  drag.over=t;
}
function targetEl(x,y){
  const el=document.elementFromPoint(x,y);if(!el)return null;
  const t=el.closest('[data-loc]');if(!t||t===drag.el)return null;
  const l=parseLoc(t.dataset.loc);if(!l||l.kind==='pitcharea')return null;return t;
}
function onCancel(){cleanupDrag();drag=null;render()}
function cleanupDrag(){
  window.removeEventListener('pointermove',onMove);window.removeEventListener('pointerup',onUp);window.removeEventListener('pointercancel',onCancel);
  if(drag){if(drag.ghost)drag.ghost.remove();if(drag.over)drag.over.classList.remove('over');drag.el.classList.remove('dragging')}
}
function inPitch(e){const r=$('pitch').getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom?r:null}
function onUp(e){
  if(!drag||e.pointerId!==drag.id)return;
  const d=drag;cleanupDrag();drag=null;
  if(!d.moved){tap(d.loc);return}
  snap();const m=M();
  if(d.over){
    const l=parseLoc(d.over.dataset.loc);
    if(l.kind==='poolarea'){if(d.loc.kind!=='pool')setPid(d.loc,null)}
    else swap(d.loc,l);
  } else {
    const r=inPitch(e);
    if(r&&d.loc.kind==='pitch'){
      const s=m.slots[d.loc.i];
      s.x=Math.round(Math.min(95,Math.max(5,(e.clientX-r.left)/r.width*100))*10)/10;
      s.y=Math.round(Math.min(96,Math.max(4,(e.clientY-r.top)/r.height*100))*10)/10;
    } else if(r){
      /* A squad or bench player dropped on open grass fills the nearest empty position. */
      const px=(e.clientX-r.left)/r.width*100,py=(e.clientY-r.top)/r.height*100;
      let best=-1,bd=1e9;m.slots.forEach((s,i)=>{if(!s.pid){const dd=(s.x-px)**2+(s.y-py)**2;if(dd<bd){bd=dd;best=i}}});
      if(best>=0)swap(d.loc,{kind:'pitch',i:best});else toast('Every position is filled. Drop onto a player to swap.');
    }
  }
  sel=null;save();render();
}
function tap(loc){
  if(sel&&sameLoc(sel,loc)){openEditor(loc);return}
  if(sel){
    if(sel.kind==='pool'&&loc.kind==='pool'){sel=loc;render();return}
    change(()=>{swap(sel,loc);sel=null});return;
  }
  sel=loc;render();
}

/* ================= Sheets ================= */
function openSheet(html,onMount,opts={}){
  const root=$('sheetRoot');
  root.innerHTML=`<div class="sheet-wrap" id="sheetWrap"><div class="sheet" role="dialog" aria-modal="true">${html}</div></div>`;
  if(!opts.sticky)$('sheetWrap').addEventListener('pointerdown',e=>{if(e.target.id==='sheetWrap')closeSheet()});
  onMount&&onMount(root);
  const f=root.querySelector('input:not([type=checkbox]),select,button');f&&f.focus({preventScroll:true});
}
function closeSheet(){$('sheetRoot').innerHTML=''}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if($('sheetRoot').innerHTML&&!$('sheetRoot').querySelector('[data-sticky]'))closeSheet();else if(sel){sel=null;render()}}
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'&&!e.target.matches('input,textarea')){e.preventDefault();undo()}
  if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.tok,.bench-slot')){e.preventDefault();tap(parseLoc(e.target.dataset.loc))}
});

function openEditor(loc){
  if(loc.kind==='pool')loc=locOf(loc.pid);
  const m=M(),pid=getPid(loc),p=P(pid),slot=loc.kind==='pitch'?m.slots[loc.i]:null,gaa=isGAA(T().sport);
  const where=slot?slot.label:loc.kind==='bench'?'Bench':'Not picked';
  openSheet(`<h2>${p?esc(p.name):'Empty '+esc(where)}</h2><p class="sub">${esc(where)}${p&&dispNum(p.id)?' · No. '+esc(dispNum(p.id)):''}</p>
    ${slot?`<div class="field"><label for="edLabel">Position label</label><input id="edLabel" maxlength="5" value="${esc(slot.label)}"></div>`:''}
    ${loc.kind!=='pool'?`<div class="field"><label for="edPlayer">Player in this spot</label><select id="edPlayer">${playerOptions(pid)}</select></div>`:''}
    ${p?`<div class="row">${gaa?'':`<div class="field" style="flex:0 0 80px"><label for="edNum">No.</label><input id="edNum" inputmode="numeric" maxlength="3" value="${esc(p.num)}"></div>`}
      <div class="field"><label for="edName">Name</label><input id="edName" value="${esc(p.name)}"></div></div>
      <div class="field"><label for="edNote">Instruction for ${esc(shortName(p))} (this match)</label><textarea id="edNote" placeholder="e.g. Mark their number 9 at set pieces">${esc(m.pnotes[p.id]||'')}</textarea></div>
      <div class="row"><label class="check"><input type="checkbox" id="edCap" ${m.captain===p.id?'checked':''}> Captain</label>
      <div class="field" style="flex:0 0 auto"><label for="edAv">Available</label><select id="edAv"><option value="">No reply</option><option value="y" ${m.avail[p.id]==='y'?'selected':''}>In</option><option value="n" ${m.avail[p.id]==='n'?'selected':''}>Out</option></select></div></div>`:''}
    <div class="sheet-actions">
      ${p&&loc.kind!=='pool'?`<button class="btn danger" id="edRemove">Take out of ${loc.kind==='bench'?'bench':'team'}</button>`:''}
      ${p&&loc.kind==='pool'?`<button class="btn danger" id="edDelete">Delete from squad</button>`:''}
      <button class="btn" id="edCancel">Cancel</button><button class="btn primary" id="edSave">Save</button></div>`,()=>{
    $('edCancel').onclick=()=>{closeSheet();sel=null;render()};
    if($('edRemove'))$('edRemove').onclick=()=>finish(()=>setPid(loc,null));
    if($('edDelete'))$('edDelete').onclick=()=>{
      if($('edDelete').dataset.armed)finish(()=>{const t=T();t.players=t.players.filter(x=>x.id!==p.id);t.matches.forEach(mm=>{if(mm.captain===p.id)mm.captain=null;Object.keys(mm.roles).forEach(k=>{if(mm.roles[k]===p.id)mm.roles[k]=null});mm.slots.forEach(s=>{if(s.pid===p.id)s.pid=null});mm.bench=mm.bench.map(b=>b===p.id?null:b)})});
      else{$('edDelete').dataset.armed='1';$('edDelete').textContent='Tap again to delete'}};
    $('edSave').onclick=()=>finish(()=>{
      if(slot&&$('edLabel').value.trim())slot.label=$('edLabel').value.trim().toUpperCase();
      if(p){if($('edNum'))p.num=$('edNum').value.trim();p.name=$('edName').value.trim()||p.name;
        const n=$('edNote').value.trim();if(n)m.pnotes[p.id]=n;else delete m.pnotes[p.id];
        if($('edCap').checked)m.captain=p.id;else if(m.captain===p.id)m.captain=null;
        const av=$('edAv').value;if(av)m.avail[p.id]=av;else delete m.avail[p.id];}
      if($('edPlayer')){const np=$('edPlayer').value||null;if(np!==pid){if(np)swap(loc,locOf(np));else setPid(loc,null)}}
    });
  });
  function finish(fn){closeSheet();sel=null;change(fn)}
}

/* Setup: first run, a new team, or a new match. */
function openSetup(mode){
  const t=T(),m=M(),first=mode==='first',isTeam=mode==='team'||first;
  const st={name:first?t.name:mode==='team'?'':t.name,sport:mode==='match'?t.sport:t.sport,format:m.format,formation:m.formation,bench:m.bench.length||5,opp:'',date:nextSaturday(),copy:true};
  const draw=()=>{
    const fmts=formatsFor(st.sport);if(!fmts.includes(st.format))st.format=isGAA(st.sport)?15:11;
    const forms=Object.keys(formsFor(st.sport,st.format));if(!forms.includes(st.formation))st.formation=forms[0];
    openSheet(`${first?'<div data-sticky></div>':''}<h2>${first?'Set up your team':isTeam?'Add a team':'New match'}</h2>
      <p class="sub">${isTeam?'Pick the sport, format and a starting shape. You can change all of this later.':'Set the fixture. The squad stays the same.'}</p>
      ${isTeam?`<div class="field"><label for="suTeam">Team name</label><input id="suTeam" value="${esc(st.name)}" placeholder="e.g. Riverside U12s"></div>
      <div class="section"><span class="label">Sport</span><div class="seg">${Object.keys(SPORT_NAME).map(k=>`<button data-sport="${k}" aria-pressed="${k===st.sport}">${SPORT_NAME[k]}</button>`).join('')}</div></div>`
      :`<div class="row"><div class="field"><label for="suOpp">Opponent</label><input id="suOpp" value="${esc(st.opp)}"></div><div class="field"><label for="suDate">Date</label><input id="suDate" type="date" value="${esc(st.date)}"></div></div>`}
      <div class="section"><span class="label">Format</span><div class="seg">${fmts.map(n=>`<button data-fmt="${n}" aria-pressed="${n===st.format}">${n}<span class="hide-narrow">-a-side</span></button>`).join('')}</div></div>
      <div class="section"><span class="label">${isGAA(st.sport)?'Shape':'Formation'}</span><div class="chips">${forms.map(f=>`<button class="chip" data-form="${esc(f)}" aria-pressed="${f===st.formation}">${esc(f)}</button>`).join('')}</div></div>
      <div class="section"><span class="label">Bench slots</span><div class="row"><div class="stepper"><button id="suMinus" aria-label="Fewer">−</button><span id="suBench">${st.bench}</span><button id="suPlus" aria-label="More">+</button></div><span class="muted">Check your ${isGAA(st.sport)?'county board':'league'}'s limit on named subs.</span></div></div>
      ${mode==='match'?`<label class="check"><input type="checkbox" id="suCopy" ${st.copy?'checked':''}> Start from the current line-up</label>`:''}
      ${isGAA(st.sport)&&isTeam?'<p class="muted">Jersey numbers follow position: the keeper wears 1, full-back 3, full-forward 14, and subs carry on from there.</p>':''}
      <div class="sheet-actions">${first?'':'<button class="btn" id="suCancel">Cancel</button>'}<button class="btn primary" id="suGo">${first?'Open the board':isTeam?'Create team':'Create match'}</button></div>`,(root)=>{
      const keep=()=>{if($('suTeam'))st.name=$('suTeam').value;if($('suOpp'))st.opp=$('suOpp').value;if($('suDate'))st.date=$('suDate').value;if($('suCopy'))st.copy=$('suCopy').checked};
      root.querySelectorAll('[data-sport]').forEach(b=>b.onclick=()=>{keep();const was=isGAA(st.sport);st.sport=b.dataset.sport;if(was!==isGAA(st.sport)){st.bench=isGAA(st.sport)?8:5;st.format=isGAA(st.sport)?15:11}draw()});
      root.querySelectorAll('[data-fmt]').forEach(b=>b.onclick=()=>{keep();st.format=+b.dataset.fmt;draw()});
      root.querySelectorAll('[data-form]').forEach(b=>b.onclick=()=>{keep();st.formation=b.dataset.form;draw()});
      $('suMinus').onclick=()=>{st.bench=Math.max(0,st.bench-1);$('suBench').textContent=st.bench};
      $('suPlus').onclick=()=>{st.bench=Math.min(20,st.bench+1);$('suBench').textContent=st.bench};
      if($('suCancel'))$('suCancel').onclick=closeSheet;
      $('suGo').onclick=()=>{keep();closeSheet();change(()=>createFrom(mode,st))};
    },{sticky:first});
  };
  draw();
}
function createFrom(mode,st){
  if(mode==='first'){
    const t=T(),m=M(),toGAA=isGAA(st.sport)&&!isGAA(t.sport);
    if(t.example&&toGAA){if(t.name==='Riverside Rovers'&&st.name==='Riverside Rovers')st.name='Riverside Gaels';m.opp='Kilbrook';m.venue='Riverside Park';m.roles={};
      const w=t.players[3];if(w)m.pnotes[w.id]='Organise the full-back line and talk to the keeper.';
      m.notes=st.sport==='hurling'?'Warm-up starts 10:20. Bring your helmet, a spare hurl and both jerseys.':'Warm-up starts 10:20. Bring boots for both surfaces and both jerseys.';
      t.players=t.players.concat(EXAMPLE_NAMES.slice(18).map(([name,num])=>({id:uid(),name,num:String(num)})));}
    t.name=st.name.trim()||t.name;
    const layout=isGAA(st.sport)!==isGAA(t.sport)||st.format!==m.format;
    t.sport=st.sport;m.tags=m.tags.filter(x=>TAGS_BY[t.sport].includes(x));m.format=st.format;m.formation=st.formation;
    if(!layout){applyFormation(m,t.sport,true);resizeBench(m,st.bench)}
    else{m.slots=[];applyFormation(m,t.sport,false);m.bench=new Array(st.bench).fill(null);autoFill(t,m)}
    return;
  }
  if(mode==='team'){
    const t=blankTeam(st.name.trim()||'New team',st.sport);
    const m=blankMatch(t,{format:st.format,formation:st.formation,bench:st.bench});
    t.matches=[m];t.activeMatch=m.id;DB.teams.push(t);DB.activeTeam=t.id;tab='squad';
    setTimeout(()=>toast('Team added. Now add your players.'),50);return;
  }
  const t=T(),cur=M();
  const m=blankMatch(t,{format:st.format,formation:st.formation,bench:st.bench});
  Object.assign(m,{opp:st.opp.trim(),date:st.date,ko:cur.ko,meet:cur.meet,venue:'',ha:'Home'});
  if(st.copy&&cur.format===st.format){
    m.slots=cur.slots.map(s=>({...s}));if(cur.formation!==st.formation)applyFormation(m,t.sport,true);
    m.bench=cur.bench.slice(0,st.bench);while(m.bench.length<st.bench)m.bench.push(null);
    Object.assign(m,{captain:cur.captain,roles:{...cur.roles},tags:cur.tags.slice(),plan:{...cur.plan}});
  } else autoFill(t,m);
  t.matches.push(m);t.activeMatch=m.id;tab='squad';
}
function resizeBench(m,n){
  const dropped=m.bench.slice(n).filter(Boolean);
  if(n>m.bench.length)m.bench=m.bench.concat(new Array(n-m.bench.length).fill(null));else m.bench=m.bench.slice(0,n);
  if(dropped.length)toast(`${dropped.map(id=>shortName(P(id))).join(', ')} moved back to the squad`);
}

function bulkSheet(){
  openSheet(`<h2>Paste your squad</h2><p class="sub">One player per line. ${isGAA(T().sport)?'':'Put the shirt number first if you have it, e.g. “7 Jack Ryan”. '}A copied WhatsApp member list works too.</p>
    <div class="field"><label for="bulkText">Players</label><textarea id="bulkText" style="min-height:200px" placeholder="1 Seán Kelly&#10;2 Darragh Moore&#10;Liam Doyle"></textarea></div>
    <label class="check"><input type="checkbox" id="bulkReplace"> Replace the current squad</label>
    <div class="sheet-actions"><button class="btn" id="bkCancel">Cancel</button><button class="btn primary" id="bkGo">Add players</button></div>`,()=>{
    $('bkCancel').onclick=closeSheet;
    $('bkGo').onclick=()=>{
      const have=new Set(T().players.map(p=>norm(p.name)));
      const lines=$('bulkText').value.split(/\n/).map(l=>l.replace(/^[-•*\s]+/,'').replace(/\s*\(.*?\)\s*$/,'').trim()).filter(l=>l&&!/^\+?\d[\d\s]{6,}$/.test(l));
      const replace=$('bulkReplace').checked;closeSheet();
      change(()=>{const t=T();if(replace)clearSquad(t);let n=0;
        lines.forEach(l=>{const mm=l.match(/^#?(\d{1,3})[\s.\-–:)]+(.+)$/);const name=(mm?mm[2]:l).trim(),num=mm?mm[1]:'';if(!replace&&have.has(norm(name)))return;t.players.push({id:uid(),name,num});n++});
        t.example=false;toast(`Added ${n} player${n===1?'':'s'}`)});
    };
  });
}
function clearSquad(t){t.players=[];t.matches.forEach(m=>{m.slots.forEach(s=>s.pid=null);m.bench=m.bench.map(()=>null);m.captain=null;m.roles={};m.avail={};m.pnotes={}});t.example=false}

/* ================= Availability through WhatsApp ================= */
function fixtureLines(m=M()){const t=T();
  return [`*${t.name}${m.opp?' v '+m.opp:''}*`,[fmtDate(m.date,true),m.meet&&('Meet '+m.meet),m.ko&&(koWord()+' '+m.ko)].filter(Boolean).join(' · '),m.venue?m.venue+(m.ha?` (${m.ha})`:''):m.ha].filter(Boolean)}
function askGroupSheet(){
  const msg=[...fixtureLines(),'','Are you available? Reply *IN* or *OUT* so we can pick the team.'].join('\n');
  openSheet(`<h2>Ask the group</h2><p class="sub">Post this in the team chat. When the replies are in, copy them and use Paste replies.</p>
    <pre class="mono" id="askMsg">${esc(msg)}</pre>
    <div class="sheet-actions" style="justify-content:flex-start"><button class="btn primary" id="askCopy">Copy message</button><a class="btn" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Open in WhatsApp</a></div>
    <div class="sheet-actions"><button class="btn" id="askClose">Close</button></div>`,()=>{
    $('askClose').onclick=closeSheet;$('askCopy').onclick=()=>copyText(msg,'Message copied',$('askMsg'));
  });
}
/* Reads pasted chat text. Handles WhatsApp's "[date, time] Name: text" and "date, time - Name: text" lines,
   and typed lists like "Seán in, Liam out". Matches names on full name, then first+last, then a unique first or last name. */
const OUT_RE=/\b(out|no|nope|cant|can t|cannot|not available|unavailable|injured|sick|away|busy|miss|missing)\b|❌|👎|✖/;
const IN_RE=/\b(in|yes|yep|yeah|available|count me in|there|grand|will be)\b|✅|👍|✔|💪/;
function statusOf(text){const s=' '+norm(text.replace(/can't|can’t/gi,'cant'))+' ';const raw=text;
  if(OUT_RE.test(s)||/❌|👎|✖/.test(raw))return'n';if(IN_RE.test(s)||/✅|👍|✔|💪/.test(raw))return'y';return null}
function findPlayer(text){
  const ps=T().players,q=norm(text);if(!q)return null;
  let hit=ps.filter(p=>q===norm(p.name)||q.includes(norm(p.name)));if(hit.length===1)return hit[0];
  const words=q.split(' ');
  hit=ps.filter(p=>{const n=norm(p.name).split(' ');return n.length>1&&words.includes(n[0])&&words.includes(n[n.length-1])});if(hit.length===1)return hit[0];
  hit=ps.filter(p=>words.includes(norm(p.name).split(' ')[0]));if(hit.length===1)return hit[0];
  hit=ps.filter(p=>{const n=norm(p.name).split(' ');return n.length>1&&words.includes(n[n.length-1])});if(hit.length===1)return hit[0];
  return null;
}
function parseReplies(text){
  const res=new Map(),miss=[];
  text.split(/\r?\n/).forEach(line=>{
    const l=line.replace(/^‎/,'').trim();if(!l)return;
    const wa=l.match(/^\[?\d{1,4}[\/.\-]\d{1,2}[\/.\-]\d{1,4},?\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:[ap]\.?m\.?)?\]?\s*-?\s*([^:]{1,60}):\s*(.*)$/i);
    if(wa){const p=findPlayer(wa[1]),s=statusOf(wa[2]);if(p&&s)res.set(p.id,s);else if(s&&!p)miss.push(wa[1].trim()+': '+wa[2]);return}
    const named=l.match(/^([^:]{1,60}):\s*(.+)$/);
    if(named){const p=findPlayer(named[1]),s=statusOf(named[2]);if(p&&s){res.set(p.id,s);return}}
    l.split(/[,;]|\band\b/).forEach(frag=>{const p=findPlayer(frag),s=statusOf(frag);if(p&&s)res.set(p.id,s);else if(s&&!p&&frag.trim())miss.push(frag.trim())});
  });
  return{res,miss:[...new Set(miss)].slice(0,12)};
}
function pasteRepliesSheet(){
  openSheet(`<h2>Paste replies</h2><p class="sub">Copy the replies from the WhatsApp chat (press and hold a message, Select, then Copy) and paste them here. You can also type a list like “Seán in, Liam out”.</p>
    <div class="field"><label for="repText">Replies</label><textarea id="repText" style="min-height:160px"></textarea></div>
    <div id="repOut"></div>
    <div class="sheet-actions"><button class="btn" id="repCancel">Cancel</button><button class="btn primary" id="repGo" disabled>Apply</button></div>`,()=>{
    let parsed=null;
    const run=()=>{parsed=parseReplies($('repText').value);const rows=[...parsed.res.entries()];
      $('repOut').innerHTML=(rows.length?`<span class="label">Found ${rows.length}</span><div>${rows.map(([pid,s])=>`<div class="parse-row"><span class="av ${s}" style="display:grid;place-items:center">${s==='y'?'IN':'OUT'}</span>${esc(P(pid).name)}</div>`).join('')}</div>`:'')
        +(parsed.miss.length?`<p class="muted" style="margin-top:8px">Couldn't match: ${esc(parsed.miss.join(' · '))}. Set these by hand with the IN / OUT buttons.</p>`:'');
      $('repGo').disabled=!rows.length};
    $('repText').addEventListener('input',run);
    $('repCancel').onclick=closeSheet;
    $('repGo').onclick=()=>{const n=parsed.res.size;closeSheet();change(()=>{parsed.res.forEach((s,pid)=>M().avail[pid]=s)});toast(`Updated ${n} player${n===1?'':'s'}`)};
  });
}

/* ================= Links: player card and team copy, packed into the URL (no server) ================= */
function b64u(bytes){let s='';for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function unb64u(s){const b=atob(s.replace(/-/g,'+').replace(/_/g,'/'));const out=new Uint8Array(b.length);for(let i=0;i<b.length;i++)out[i]=b.charCodeAt(i);return out}
async function pack(obj){
  const bytes=new TextEncoder().encode(JSON.stringify(obj));
  if(window.CompressionStream){try{const z=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());return 'z'+b64u(z)}catch(e){}}
  return 'j'+b64u(bytes);
}
async function unpack(s){
  const bytes=unb64u(s.slice(1));
  if(s[0]==='z')return JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text());
  return JSON.parse(new TextDecoder().decode(bytes));
}
function matchPayload(){
  const t=T(),m=M();
  return{v:1,sp:t.sport,tn:t.name,k:t.kit,g:t.gkKit,o:m.opp,ha:m.ha,d:m.date,ko:m.ko,me:m.meet,vn:m.venue,f:m.format,fm:m.formation,
    s:m.slots.map(s=>{const p=P(s.pid);return[s.label,s.x,s.y,p?p.name:'',p?dispNum(p.id):'',p?(m.pnotes[p.id]||''):'',p&&m.captain===p.id?1:0]}),
    b:m.bench.map(P).filter(Boolean).map(p=>[p.name,dispNum(p.id),m.captain===p.id?1:0,m.pnotes[p.id]||'']),
    r:roleList().filter(x=>P(x[1])).map(([l,pid])=>[l,P(pid).name]),tg:m.tags,n:m.notes,rot:rotationLines()};
}
async function matchLink(){return APP_URL+'#m='+await pack(matchPayload())}
async function teamLink(){
  const t=clone(T());delete t.crest;t.matches=t.matches.slice(-3);
  return APP_URL+'#t='+await pack(t);
}

/* ================= Share ================= */
function messageText(link){
  const t=T(),m=M(),L=[...fixtureLines(m),''];
  const cap=p=>m.captain===p.id?' (C)':'';
  if(isGAA(t.sport)){
    L.push(`*${SPORT_NAME[t.sport]} team · ${m.format}-a-side, ${m.formation}*`);
    const rows=[];m.slots.forEach((s,i)=>{const key=Math.round(s.row??s.y);let r=rows.find(x=>x.key===key);if(!r){r={key,items:[]};rows.push(r)}const p=P(s.pid);r.items.push(`${i+1} ${p?p.name+cap(p):'TBC'}`)});
    rows.forEach(r=>L.push(r.items.join(' · ')));
  } else {
    L.push(`*Starting ${m.format} (${m.formation})*`);
    m.slots.map((s,i)=>({s,i})).sort((a,b)=>b.s.y-a.s.y||a.s.x-b.s.x).forEach(({s})=>{const p=P(s.pid);L.push(`${s.label} – ${p?(p.num?p.num+' ':'')+p.name+cap(p):'TBC'}`)});
  }
  const subs=m.bench.map(P).filter(Boolean);
  if(subs.length){L.push('','*Subs*');subs.forEach(p=>L.push(`${dispNum(p.id)?dispNum(p.id)+' ':''}${p.name}${cap(p)}`))}
  const rot=rotationLines(m);if(rot.length){L.push('','*Sub plan*');rot.forEach(x=>L.push(x))}
  const sp=roleList(m).filter(x=>P(x[1]));
  if(sp.length){L.push('',isGAA(t.sport)?'*Frees & restarts*':'*Set pieces*');sp.forEach(([k,v])=>L.push(`${k}: ${P(v).name}`))}
  const notes=Object.entries(m.pnotes).filter(([pid,v])=>v&&P(pid)&&locOf(pid).kind!=='pool');
  if(m.tags.length||m.notes||notes.length){L.push('','*Instructions*');m.tags.forEach(x=>L.push('• '+x));notes.forEach(([pid,v])=>L.push(`• ${shortName(P(pid))}: ${v}`));if(m.notes)L.push(m.notes)}
  if(link)L.push('','Your position, the details and add to calendar:',link);
  return L.join('\n');
}
function wrapLines(ctx,text,maxW){const out=[];String(text).split('\n').forEach(par=>{let line='';par.split(' ').forEach(w=>{const tt=line?line+' '+w:w;if(ctx.measureText(tt).width>maxW&&line){out.push(line);line=w}else line=tt});out.push(line)});return out}
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function loadImg(src){return new Promise(res=>{if(!src)return res(null);const i=new Image();i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src})}
async function buildImage(){
  try{await document.fonts.load('700 40px "Barlow Condensed"');await document.fonts.load('500 24px "Barlow"')}catch(e){}
  const t=T(),m=M(),W=1080,pad=56,DF='"Barlow Condensed","Arial Narrow",sans-serif',BF='"Barlow",system-ui,sans-serif';
  const PW=pitchSpec(t.sport).w,pw=W-pad*2-120,ph=Math.round(pw*100/PW),px=(W-pw)/2;
  const meas=document.createElement('canvas').getContext('2d');meas.font=`500 30px ${BF}`;
  const instr=[...m.tags.map(x=>'• '+x),...Object.entries(m.pnotes).filter(([pid,v])=>v&&P(pid)&&locOf(pid).kind!=='pool').map(([pid,v])=>`• ${shortName(P(pid))}: ${v}`)];
  if(m.notes)instr.push(m.notes);
  const instrLines=instr.flatMap(x=>wrapLines(meas,x,W-pad*2));
  const rotL=rotationLines(m).flatMap(x=>wrapLines(meas,x,W-pad*2));
  const subs=m.bench.map(P).filter(Boolean);
  const sp=[['Captain',m.captain],...roleList(m)].filter(x=>P(x[1]));
  meas.font=`500 30px ${BF}`;
  const info1=[fmtDate(m.date),m.meet&&('Meet '+m.meet),m.ko&&(koWord()+' '+m.ko)].filter(Boolean).join('  ·  ');
  const venueLines=m.venue?wrapLines(meas,m.venue+(m.ha?` (${m.ha})`:''),W-pad*2-130).slice(0,2):[];
  const headH=210+venueLines.length*40,subsH=subs.length?60+Math.ceil(subs.length/2)*46:0,spH=sp.length?60+Math.ceil(sp.length/2)*44:0,
    rotH=rotL.length?70+rotL.length*42:0,instrH=instrLines.length?70+instrLines.length*42:0;
  const H=headH+ph+50+subsH+spH+rotH+instrH+110;
  const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
  ctx.fillStyle='#0f1a14';ctx.fillRect(0,0,W,H);ctx.fillStyle=t.kit;ctx.fillRect(0,0,W,14);
  const crest=await loadImg(t.crest);if(crest){const s=110,r=Math.min(s/crest.width,s/crest.height);ctx.drawImage(crest,W-pad-crest.width*r,40,crest.width*r,crest.height*r)}
  ctx.fillStyle='#9fb4a6';ctx.font=`600 28px ${DF}`;
  ctx.fillText(`${SPORT_NAME[t.sport].toUpperCase()} · ${m.format}-A-SIDE · ${m.formation.toUpperCase()}`,pad,78);
  ctx.fillStyle='#ffffff';let sz=64;ctx.font=`700 ${sz}px ${DF}`;
  const title=t.name+(m.opp?' v '+m.opp:'');const maxT=W-pad*2-(crest?130:0);
  while(ctx.measureText(title).width>maxT&&sz>36){sz-=4;ctx.font=`700 ${sz}px ${DF}`}
  ctx.fillText(title,pad,148);
  ctx.fillStyle='#d7e3da';ctx.font=`500 30px ${BF}`;ctx.fillText(info1,pad,192);
  venueLines.forEach((l,i)=>ctx.fillText(l,pad,232+i*40));
  const py=headH;
  ctx.save();rr(ctx,px,py,pw,ph,16);ctx.clip();for(let i=0;i<10;i++){ctx.fillStyle=i%2?'#297a42':'#2e8549';ctx.fillRect(px,py+ph*i/10,pw,ph/10+1)}ctx.restore();
  strokePitch(ctx,t.sport,px,py,pw,ph);
  const tr=Math.round(pw*0.055);
  m.slots.forEach(s=>{
    const x=px+s.x/100*pw,y=py+s.y/100*ph,p=P(s.pid),kit=s.label==='GK'?t.gkKit:t.kit;
    ctx.save();ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=10;ctx.shadowOffsetY=3;
    ctx.beginPath();ctx.arc(x,y-10,tr,0,Math.PI*2);ctx.fillStyle=p?kit:'rgba(255,255,255,.15)';ctx.fill();ctx.restore();
    ctx.lineWidth=4;ctx.strokeStyle='#fff';ctx.setLineDash(p?[]:[8,6]);ctx.beginPath();ctx.arc(x,y-10,tr,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle=p?inkFor(kit):'#fff';ctx.font=`700 ${p?34:24}px ${DF}`;ctx.fillText(p?dispNum(p.id):s.label,x,y-8);
    if(p&&m.captain===p.id){ctx.fillStyle='#f2c12e';rr(ctx,x+tr-14,y-10-tr-6,30,26,6);ctx.fill();ctx.fillStyle='#1b1500';ctx.font=`700 20px ${DF}`;ctx.fillText('C',x+tr+1,y-10-tr+8)}
    const nm=p?shortName(p):'TBC';ctx.font=`600 28px ${DF}`;const w=ctx.measureText(nm).width+20;
    ctx.fillStyle='rgba(8,25,14,.78)';rr(ctx,x-w/2,y+tr-2,w,36,8);ctx.fill();ctx.fillStyle='#fff';ctx.fillText(nm,x,y+tr+17);
    ctx.fillStyle='rgba(255,255,255,.8)';ctx.font=`600 18px ${DF}`;ctx.fillText(s.label,x,y+tr+48);
    ctx.textAlign='left';ctx.textBaseline='alphabetic';
  });
  let y=py+ph+50;
  const heading=x=>{ctx.fillStyle='#9fb4a6';ctx.font=`600 26px ${DF}`;ctx.fillText(x.toUpperCase(),pad,y+26);y+=60};
  if(subs.length){heading('Subs');subs.forEach((p,i)=>{const cx=pad+(i%2)*((W-pad*2)/2),cy=y+Math.floor(i/2)*46;
    ctx.fillStyle=t.kit;ctx.beginPath();ctx.arc(cx+17,cy+4,17,0,Math.PI*2);ctx.fill();ctx.fillStyle=inkFor(t.kit);ctx.font=`700 20px ${DF}`;ctx.textAlign='center';ctx.fillText(dispNum(p.id),cx+17,cy+11);ctx.textAlign='left';
    ctx.fillStyle='#fff';ctx.font=`500 30px ${BF}`;ctx.fillText(p.name,cx+48,cy+14)});y+=Math.ceil(subs.length/2)*46}
  if(sp.length){heading(isGAA(t.sport)?'Captain, frees & restarts':'Roles & set pieces');sp.forEach(([k,v],i)=>{const cx=pad+(i%2)*((W-pad*2)/2),cy=y+Math.floor(i/2)*44;ctx.fillStyle='#9fb4a6';ctx.font=`500 26px ${BF}`;ctx.fillText(k,cx,cy+12);ctx.fillStyle='#fff';ctx.font=`600 28px ${BF}`;ctx.fillText(shortName(P(v)),cx+185,cy+12)});y+=Math.ceil(sp.length/2)*44}
  if(rotL.length){heading('Sub plan');ctx.fillStyle='#e8efe9';ctx.font=`500 30px ${BF}`;rotL.forEach((l,i)=>ctx.fillText(l,pad,y+12+i*42));y+=rotL.length*42+10}
  if(instrLines.length){heading('Instructions');ctx.fillStyle='#e8efe9';ctx.font=`500 30px ${BF}`;instrLines.forEach((l,i)=>ctx.fillText(l,pad,y+12+i*42));}
  ctx.fillStyle='#6f8577';ctx.font=`500 24px ${BF}`;ctx.textAlign='center';ctx.fillText('Made with TeamSelect · '+APP_URL.replace(/^https?:\/\//,'').replace(/\/$/,''),W/2,H-40);ctx.textAlign='left';
  return c;
}
async function openShare(){
  let link='';try{link=await matchLink()}catch(e){}
  const msg=messageText(link);
  openSheet(`<h2>Share line-up</h2><p class="sub">Send the picture, the player link, or both to your team's WhatsApp group.</p>
    <img class="share-img" id="shImg" alt="Line-up picture">
    <div class="sheet-actions" style="justify-content:flex-start"><button class="btn primary" id="shSave" disabled>Preparing picture…</button><button class="btn" id="shLink">Copy player link</button><button class="btn" id="shCopy">Copy message</button>
      <a class="btn" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Open in WhatsApp</a></div>
    <p class="muted" id="shNote">The player link opens the team in any browser, with no app or login. Each player can find their position and add the match to their calendar.</p>
    <pre class="mono" id="shMsg">${esc(msg)}</pre>
    <div class="sheet-actions"><a class="btn" href="${esc(link)}" target="_blank" rel="noopener">Preview player link</a><button class="btn" id="shClose">Close</button></div>`,()=>{
    $('shClose').onclick=closeSheet;
    $('shCopy').onclick=()=>copyText(msg,'Message copied',$('shMsg'));
    $('shLink').onclick=()=>copyText(link,'Player link copied',$('shMsg'));
  });
  const canvas=await buildImage();const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));
  const img=$('shImg');if(!img)return;img.src=URL.createObjectURL(blob);
  const t=T(),m=M(),fname=`teamselect-${(m.opp||t.name||'team').replace(/[^\w]+/g,'-').toLowerCase()}${m.date?'-'+m.date:''}.png`;
  const f=new File([blob],fname,{type:'image/png'}),canShare=!!(navigator.canShare&&navigator.canShare({files:[f]}));
  $('shSave').textContent=canShare?'Share picture':'Save picture';$('shSave').disabled=false;
  $('shSave').onclick=()=>deliverFile(blob,fname,t.name);
}
async function openTeamLink(){
  let link='';try{link=await teamLink()}catch(e){toast('Could not make the link on this device');return}
  openSheet(`<h2>Send team to a co-coach</h2><p class="sub">This link copies ${esc(T().name)} (squad, kit and recent matches) onto another phone or iPad. After that, each copy is separate: changes don't sync until accounts arrive.</p>
    <pre class="mono" id="tlMsg">${esc(link)}</pre><p class="muted">The link holds your players' names. Send it only to people you trust with them.</p>
    <div class="sheet-actions"><button class="btn" id="tlClose">Close</button><button class="btn primary" id="tlCopy">Copy link</button></div>`,()=>{
    $('tlClose').onclick=closeSheet;$('tlCopy').onclick=()=>copyText(link,'Team link copied',$('tlMsg'));
  });
}

/* ================= Backup ================= */
function exportAll(){
  const blob=new Blob([JSON.stringify({app:'TeamSelect',exported:new Date().toISOString(),...DB},null,1)],{type:'application/json'});
  deliverFile(blob,`teamselect-backup-${new Date().toISOString().slice(0,10)}.json`,'TeamSelect backup');
}
function importAll(){
  const fi=$('fileIn');fi.accept='application/json,.json';fi.value='';
  fi.onchange=async()=>{const file=fi.files[0];if(!file)return;
    try{const d=JSON.parse(await file.text());if(d.v!==2||!Array.isArray(d.teams))throw new Error('format');
      openSheet(`<h2>Restore backup</h2><p class="sub">This backup has ${d.teams.length} team${d.teams.length===1?'':'s'}: ${esc(d.teams.map(x=>x.name).join(', '))}.</p>
        <div class="sheet-actions"><button class="btn" id="imCancel">Cancel</button><button class="btn" id="imMerge">Add to my teams</button><button class="btn primary" id="imReplace">Replace everything</button></div>`,()=>{
        $('imCancel').onclick=closeSheet;
        $('imMerge').onclick=()=>{closeSheet();change(()=>{d.teams.forEach(t=>{if(DB.teams.find(x=>x.id===t.id))t.id=uid();DB.teams.push(t)})});toast('Teams added')};
        $('imReplace').onclick=()=>{closeSheet();change(()=>{DB={v:2,activeTeam:d.activeTeam||d.teams[0].id,teams:d.teams}});toast('Backup restored')};
      });
    }catch(e){toast('That file is not a TeamSelect backup')}
  };
  fi.click();
}
function pickCrest(){
  const fi=$('fileIn');fi.accept='image/*';fi.value='';
  fi.onchange=async()=>{const file=fi.files[0];if(!file)return;const url=URL.createObjectURL(file);const img=await loadImg(url);URL.revokeObjectURL(url);if(!img){toast('Could not read that picture');return}
    const s=192,r=Math.min(s/img.width,s/img.height),c=document.createElement('canvas');c.width=Math.round(img.width*r);c.height=Math.round(img.height*r);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    change(()=>{T().crest=c.toDataURL('image/png')})};
  fi.click();
}

/* ================= Match menu ================= */
function matchMenu(id){
  const t=T(),m=t.matches.find(x=>x.id===id);if(!m)return;
  openSheet(`<h2>${m.opp?'v '+esc(m.opp):'Match'}</h2><p class="sub">${esc(fmtDate(m.date)||'No date')}</p>
    <div class="sheet-actions" style="justify-content:flex-start;flex-direction:column;align-items:stretch">
      <button class="btn" id="mmPlayed">${m.played?'Mark as not played':'Mark as played'}</button>
      <button class="btn" id="mmDup">Copy as a new match</button>
      ${t.matches.length>1?'<button class="btn danger" id="mmDel">Delete match</button>':''}
      <button class="btn" id="mmClose">Close</button></div>`,()=>{
    $('mmClose').onclick=closeSheet;
    $('mmPlayed').onclick=()=>{closeSheet();change(()=>{m.played=!m.played})};
    $('mmDup').onclick=()=>{closeSheet();change(()=>{const c=clone(m);c.id=uid();c.played=false;c.created=Date.now();c.date=nextSaturday();c.opp='';c.avail={};t.matches.push(c);t.activeMatch=c.id;tab='match'})};
    if($('mmDel'))$('mmDel').onclick=()=>{if($('mmDel').dataset.armed){closeSheet();change(()=>{t.matches=t.matches.filter(x=>x.id!==id);if(t.activeMatch===id)t.activeMatch=t.matches[t.matches.length-1].id})}else{$('mmDel').dataset.armed='1';$('mmDel').textContent='Tap again to delete'}};
  });
}

/* ================= Wiring ================= */
function wire(){
  $('pitch').addEventListener('pointerdown',onDown);
  $('bench').addEventListener('pointerdown',onDown);
  $('panelBody').addEventListener('pointerdown',e=>{if(e.target.closest('.pool-item'))onDown(e)});
  $('formationSel').onchange=e=>change(()=>{M().formation=e.target.value;applyFormation(M(),T().sport,true)});
  $('teamSel').onchange=e=>{if(e.target.value==='__new'){render();openSetup('team');return}DB.activeTeam=e.target.value;sel=null;save();render()};
  $('undoBtn').onclick=undo;
  $('shareBtn').onclick=openShare;
  $('benchMinus').onclick=()=>change(()=>{resizeBench(M(),Math.max(0,M().bench.length-1));sel=null});
  $('benchPlus').onclick=()=>change(()=>resizeBench(M(),Math.min(20,M().bench.length+1)));
  $('hintCancel').onclick=()=>{sel=null;render()};
  $('hintEdit').onclick=()=>{const l=sel;sel=null;openEditor(l)};
  document.querySelector('.tabs').onclick=e=>{const b=e.target.closest('[data-tab]');if(b){tab=b.dataset.tab;pendingConfirm=null;renderPanel()}};
  const pb=$('panelBody');
  pb.addEventListener('click',e=>{
    const av=e.target.closest('[data-av]');
    if(av){const id=av.dataset.av;change(()=>{const m=M(),v=m.avail[id];if(!v)m.avail[id]='y';else if(v==='y')m.avail[id]='n';else delete m.avail[id]});return}
    const t=e.target.closest('[data-tag],[data-kit],[data-gkkit],[data-act]');if(!t)return;
    if(t.dataset.tag){const g=t.dataset.tag;change(()=>{const m=M();m.tags=m.tags.includes(g)?m.tags.filter(x=>x!==g):[...m.tags,g]});return}
    if(t.dataset.kit){change(()=>T().kit=t.dataset.kit);return}
    if(t.dataset.gkkit){change(()=>T().gkKit=t.dataset.gkkit);return}
    const a=t.dataset.act;
    if(a!=='delTeam')pendingConfirm=null;
    if(a==='addPlayer'){const n=$('newName').value.trim();if(!n){$('newName').focus();return}change(()=>{T().players.push({id:uid(),name:n,num:$('newNum')?$('newNum').value.trim():''});T().example=false});$('newName').focus()}
    else if(a==='bulk')bulkSheet();
    else if(a==='askGroup')askGroupSheet();
    else if(a==='pasteReplies')pasteRepliesSheet();
    else if(a==='clearExample'){change(()=>{const t=T();clearSquad(t);t.name='My team';const m=M();Object.assign(m,{opp:'',venue:'',notes:'',tags:[]})});bulkSheet()}
    else if(a==='resetPos'){change(()=>applyFormation(M(),T().sport,true));toast('Positions reset')}
    else if(a==='clearPitch')change(()=>M().slots.forEach(s=>s.pid=null));
    else if(a==='autoFill')change(()=>autoFill(T(),M()));
    else if(a==='newMatch')openSetup('match');
    else if(a==='newTeam')openSetup('team');
    else if(a==='openMatch'){T().activeMatch=t.dataset.id;sel=null;save();tab='squad';render()}
    else if(a==='matchMenu')matchMenu(t.dataset.id);
    else if(a==='teamLink')openTeamLink();
    else if(a==='exportAll')exportAll();
    else if(a==='importAll')importAll();
    else if(a==='crest')pickCrest();
    else if(a==='crestOff')change(()=>T().crest=null);
    else if(a==='delTeam'){if(pendingConfirm==='delTeam'){pendingConfirm=null;change(()=>{DB.teams=DB.teams.filter(x=>x.id!==DB.activeTeam);DB.activeTeam=DB.teams[0].id})}else{pendingConfirm='delTeam';renderPanel()}}
  });
  pb.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.target.id==='newName'||e.target.id==='newNum')){e.preventDefault();pb.querySelector('[data-act="addPlayer"]').click()}});
  pb.addEventListener('change',e=>{
    const id=e.target.id,m=M();
    if(id==='teamName'){change(()=>T().name=e.target.value.trim()||T().name);return}
    if(id==='fmtSel'){change(()=>{m.format=+e.target.value;m.slots=[];applyFormation(m,T().sport,false);autoFill(T(),m)});return}
    if(id==='planOn'){change(()=>m.plan.on=e.target.checked);return}
    if(id==='planPeriods'){change(()=>m.plan.periods=+e.target.value);return}
    if(id==='planMins'){change(()=>m.plan.mins=Math.min(60,Math.max(5,+e.target.value||30)));return}
    if(id==='planGK'){change(()=>m.plan.fixGK=e.target.checked);return}
    const k=e.target.dataset.bind;if(!k)return;
    snap();
    if(k.startsWith('role:'))m.roles[k.slice(5)]=e.target.value||null;
    else m[k]=e.target.value||(k==='captain'?null:'');
    save();
    if(['opp','date','ko','ha','captain'].includes(k)){const keep=document.activeElement&&document.activeElement.id;render();if(keep&&$(keep))$(keep).focus({preventScroll:true})}
  });
  pb.addEventListener('input',e=>{const k=e.target.dataset.bind;if(k==='notes'||k==='venue'){M()[k]=e.target.value;save()}});
}

/* ================= Player card (opened from a #m= link) ================= */
function icsFor(o){
  if(!o.d)return null;
  const e=s=>String(s||'').replace(/\\/g,'\\\\').replace(/[,;]/g,m=>'\\'+m).replace(/\n/g,'\\n');
  const start=(o.me||o.ko||'10:00').replace(':','')+'00',stamp=new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//TeamSelect//EN','BEGIN:VEVENT',`UID:${o.d}-${norm(o.tn+o.o).replace(/ /g,'')}@teamselect`,`DTSTAMP:${stamp}`,
    `DTSTART:${o.d.replace(/-/g,'')}T${start}`,'DURATION:PT2H30M',`SUMMARY:${e(o.tn+(o.o?' v '+o.o:''))}`,o.vn?`LOCATION:${e(o.vn)}`:'',
    `DESCRIPTION:${e([o.me&&'Meet '+o.me,o.ko&&(isGAA(o.sp)?'Throw-in ':'KO ')+o.ko].filter(Boolean).join('. '))}`,'END:VEVENT','END:VCALENDAR'].filter(Boolean).join('\r\n');
}
function renderViewer(o){
  document.title=`${o.tn}${o.o?' v '+o.o:''} · TeamSelect`;
  document.documentElement.style.setProperty('--kit',o.k);document.documentElement.style.setProperty('--kit-ink',inkFor(o.k));
  const gaa=isGAA(o.sp),names=[...o.s.filter(s=>s[3]).map(s=>s[3]),...o.b.map(b=>b[0])];
  const v=$('viewer');v.hidden=false;
  v.innerHTML=`<div><span class="eyebrow">${esc([SPORT_NAME[o.sp],o.f+'-a-side',o.ha].filter(Boolean).join(' · '))}</span><h1>${esc(o.tn)}${o.o?` <span class="muted" style="font-size:inherit">v</span> ${esc(o.o)}`:''}</h1></div>
    <div class="facts">${o.d?`<div class="fact"><span>Date</span><b>${esc(fmtDate(o.d,true))}</b></div>`:''}${o.me?`<div class="fact"><span>Meet</span><b>${esc(o.me)}</b></div>`:''}${o.ko?`<div class="fact"><span>${gaa?'Throw-in':'Kick-off'}</span><b>${esc(o.ko)}</b></div>`:''}${o.vn?`<div class="fact" style="grid-column:1/-1"><span>Venue</span><b>${esc(o.vn)}</b></div>`:''}</div>
    <div class="field"><label for="findMe">Find me</label><select id="findMe"><option value="">Choose your name</option>${names.map(n=>`<option>${esc(n)}</option>`).join('')}</select></div>
    <div id="youBox" class="you" hidden></div>
    <div class="pitch" id="vPitch"><svg class="lines" id="vLines" preserveAspectRatio="none" aria-hidden="true"></svg><span class="attack" id="vAttack"></span><div id="vTokens"></div></div>
    ${o.b.length?`<div class="section"><span class="label">Subs</span><div class="chips">${o.b.map(b=>`<span class="chip">${b[1]?esc(b[1])+' · ':''}${esc(b[0])}${b[2]?' (C)':''}</span>`).join('')}</div></div>`:''}
    ${o.rot&&o.rot.length?`<div class="section"><span class="label">Sub plan</span>${o.rot.map(x=>`<p class="muted" style="color:var(--ink)">${esc(x)}</p>`).join('')}</div>`:''}
    ${o.r.length?`<div class="section"><span class="label">${gaa?'Frees & restarts':'Set pieces'}</span>${o.r.map(([l,n])=>`<p class="muted" style="color:var(--ink)">${esc(l)}: ${esc(n)}</p>`).join('')}</div>`:''}
    ${o.tg.length||o.n?`<div class="section"><span class="label">Instructions</span>${o.tg.map(x=>`<p class="muted" style="color:var(--ink)">• ${esc(x)}</p>`).join('')}${o.n?`<p class="muted" style="color:var(--ink)">${esc(o.n)}</p>`:''}</div>`:''}
    <div class="row">${o.d?'<button class="btn primary" id="vCal">Add to calendar</button>':''}<a class="btn" id="vIn" target="_blank" rel="noopener">I'm in</a><a class="btn" id="vOut" target="_blank" rel="noopener">Can't make it</a></div>
    <p class="foot">Made with <a href="${esc(APP_URL)}">TeamSelect</a>, free team selection for soccer and GAA.</p>`;
  drawPitch($('vPitch'),$('vLines'),$('vAttack'),o.sp);
  const draw=me=>{$('vTokens').innerHTML=o.s.map(s=>{const [label,x,y,name,num,,cap]=s;const kit=label==='GK'?o.g:o.k;const dim=me&&name!==me?' dim':'',hit=me&&name===me?' sel':'';
    return name?`<div class="tok${dim}${hit}" style="left:${x}%;top:${y}%;--kit:${kit};--kit-ink:${inkFor(kit)};cursor:default"><div class="disc">${esc(num)}${cap?'<span class="cap">C</span>':''}</div><span class="name">${esc(name.split(' ').slice(-1)[0])}</span><span class="pos">${esc(label)}</span></div>`
      :`<div class="tok empty" style="left:${x}%;top:${y}%;cursor:default"><div class="disc">${esc(label)}</div></div>`}).join('')};
  draw('');
  const reply=(txt)=>`https://wa.me/?text=${encodeURIComponent(txt)}`;
  const setReplies=me=>{const who=me?` – ${me}`:'';const fx=`${o.o?'v '+o.o:''}${o.d?' '+fmtDate(o.d):''}`.trim();$('vIn').href=reply(`IN for ${fx}${who}`);$('vOut').href=reply(`OUT for ${fx}${who}`)};
  setReplies('');
  $('findMe').onchange=e=>{const me=e.target.value;draw(me);setReplies(me);const box=$('youBox');
    if(!me){box.hidden=true;return}
    const s=o.s.find(x=>x[3]===me),b=o.b.find(x=>x[0]===me);
    const note=s?s[5]:b?b[3]:'';const rot=(o.rot||[]).filter(x=>x.includes(me));
    box.innerHTML=s?`<b>You're starting at ${esc(s[0])}${s[4]?' · No. '+esc(s[4]):''}</b>`:b?`<b>You're on the bench${b[1]?' · No. '+esc(b[1]):''}</b>`:'';
    box.innerHTML+=(note?`<p style="margin:6px 0 0">${esc(note)}</p>`:'')+rot.map(x=>`<p class="muted" style="margin:6px 0 0">${esc(x)}</p>`).join('');box.hidden=false};
  if($('vCal'))$('vCal').onclick=()=>deliverFile(new Blob([icsFor(o)],{type:'text/calendar'}),`${norm(o.tn+' v '+(o.o||'match')).replace(/ /g,'-')}.ics`,'Match',true);
}
function viewerError(){const v=$('viewer');v.hidden=false;v.innerHTML=`<h1>This link didn't open</h1><p class="muted">It may have been cut short when it was copied. Ask your manager to send it again.</p><a class="btn" href="${esc(APP_URL)}">Open TeamSelect</a>`}

async function importTeamFromLink(code){
  let t;try{t=await unpack(code)}catch(e){toast('That team link did not open. Ask for it again.');return}
  if(!t||!Array.isArray(t.players))return;
  history.replaceState(null,'',APP_URL);
  const exists=DB.teams.find(x=>x.id===t.id);
  openSheet(`<h2>Add ${esc(t.name)}?</h2><p class="sub">${t.players.length} players and ${t.matches.length} recent match${t.matches.length===1?'':'es'} will be copied onto this device.${exists?' You already have this team here.':''}</p>
    <div class="sheet-actions"><button class="btn" id="tiCancel">Cancel</button>${exists?'<button class="btn" id="tiCopy">Keep both</button><button class="btn primary" id="tiReplace">Replace mine</button>':'<button class="btn primary" id="tiAdd">Add team</button>'}</div>`,()=>{
    $('tiCancel').onclick=closeSheet;
    const add=replace=>{closeSheet();change(()=>{if(replace)DB.teams=DB.teams.filter(x=>x.id!==t.id);else if(exists)t.id=uid();if(!t.matches.length){const m=blankMatch(t);t.matches=[m]}t.activeMatch=t.matches[t.matches.length-1].id;DB.teams.push(t);DB.activeTeam=t.id})};
    if($('tiAdd'))$('tiAdd').onclick=()=>add(false);if($('tiCopy'))$('tiCopy').onclick=()=>add(false);if($('tiReplace'))$('tiReplace').onclick=()=>add(true);
  });
}

/* ================= Boot ================= */
async function boot(){
  const h=location.hash;
  if(h.startsWith('#m=')){try{renderViewer(await unpack(h.slice(3)))}catch(e){viewerError()}return}
  const l=load();DB=l.db;firstRun=l.first;
  $('app').hidden=false;wire();render();
  if(l.migrated){save();toast('Your line-up has moved into the new Season tab')}
  if(firstRun){save();openSetup('first')}
  if(h.startsWith('#t='))importTeamFromLink(h.slice(3));
  if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
  try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
}
window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#m=')||location.hash.startsWith('#t='))location.reload()});
boot();
})();
