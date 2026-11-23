'use strict';
const $ = id => document.getElementById(id);
const seeds = {
  Check:[[110,145],[196,211],[215,210],[441,59]],
  Peak:[[136,216],[288,48],[456,216]],
  Pulse:[[86,192],[191,192],[248,74],[315,212],[385,116],[505,116]]
};
const samples = {
  Check:[[117,144],[177,195],[205,204],[234,185],[324,126],[435,55]],
  Peak:[[125,218],[211,129],[285,57],[362,130],[450,213]],
  Pulse:[[84,189],[184,193],[246,78],[309,206],[383,112],[497,118]],
  Slash:[[419,57],[302,120],[207,179],[157,213]]
};
function normalize(points){
  const lengths=[0];
  for(let i=1;i<points.length;i++) lengths.push(lengths[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
  const total=lengths.at(-1);
  if(!(total>=6)) return null;
  const out=[]; let j=1;
  for(let i=0;i<32;i++){
    const at=total*i/31;
    while(j<lengths.length-1 && lengths[j]<at) j++;
    const f=(at-lengths[j-1])/(lengths[j]-lengths[j-1] || 1);
    out.push(points[j].map((v,k)=>points[j-1][k]+f*(v-points[j-1][k])));
  }
  const xs=out.map(p=>p[0]), ys=out.map(p=>p[1]);
  const scale=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));
  const mean=[xs,ys].map(axis=>axis.reduce((a,b)=>a+b,0)/32);
  return out.map(p=>p.map((v,k)=>(v-mean[k])/scale));
}
const storage='glyph-bench-examples-v1';
let saved=[];
try{
  const data=JSON.parse(localStorage.getItem(storage));
  if(Array.isArray(data)) saved=data.filter(s=>typeof s?.name==='string' && Array.isArray(s.shape) && s.shape.length===32 && s.shape.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)));
}catch{}
const initial=Object.entries(seeds).map(([name,points])=>({name,shape:normalize(points)}));
let stroke=[], active=null;
function render(){
  $('ink').setAttribute('points',stroke.map(p=>p.join(',')).join(' '));
  $('start').style.display=stroke.length?'':'none';
  if(stroke.length){$('start').setAttribute('cx',stroke[0][0]);$('start').setAttribute('cy',stroke[0][1]);}
  const shape=normalize(stroke), distances=new Map();
  $('count').textContent='3 starter examples · '+saved.length+' added in this browser';
  $('ranks').replaceChildren();
  if(!shape){
    $('status').textContent='READY';$('verdict').textContent='Awaiting stroke';
    $('detail').textContent='Draw one continuous line or choose a sample.';return;
  }
  for(const e of [...initial,...saved]){
    const d=e.shape.reduce((sum,p,i)=>sum+Math.hypot(p[0]-shape[i][0],p[1]-shape[i][1]),0)/32;
    distances.set(e.name,Math.min(d,distances.get(e.name)??Infinity));
  }
  const ranks=[...distances].sort((a,b)=>a[1]-b[1]);
  const far=ranks[0][1]>.20, close=ranks[1][1]-ranks[0][1]<.035;
  $('status').textContent=far||close?'REVIEW NEEDED':'MATCH FOUND';
  $('verdict').textContent=far||close?'Uncertain':ranks[0][0];
  $('detail').textContent=far?'Outside the known vocabulary. Teach it a name below.':close?'Two labels are too close. Compare the distances below.':'Closest labeled shape after resampling and scaling.';
  for(const [name,d] of ranks.slice(0,3)){
    const row=document.createElement('div'),label=document.createElement('span'),rail=document.createElement('div'),bar=document.createElement('div'),score=document.createElement('span');
    row.className='row';label.textContent=name;rail.className='rail';bar.className='bar';bar.style.width=100*Math.max(0,1-d)+'%';score.className='score';score.textContent=d.toFixed(3);
    rail.append(bar);row.append(label,rail,score);$('ranks').append(row);
  }
}
function select(name){
  active=null;stroke=samples[name]||[];$('feedback').textContent='';
  for(const b of $('presets').children)b.setAttribute('aria-pressed',String(b.textContent===name));
  render();
}
for(const name of Object.keys(samples)){
  const b=document.createElement('button');b.textContent=name;b.onclick=()=>select(name);$('presets').append(b);
}
$('clear').onclick=()=>select(null);
const pad=$('pad');
function point(e){
  const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(pad.getScreenCTM().inverse());
  return [p.x,p.y];
}
pad.onpointerdown=e=>{
  if(active!==null || e.button!==0)return;
  select(null);active=e.pointerId;pad.setPointerCapture(active);stroke=[point(e)];render();
};
pad.onpointermove=e=>{if(active===e.pointerId){stroke.push(point(e));$('ink').setAttribute('points',stroke.map(p=>p.join(',')).join(' '));}};
pad.onpointerup=e=>{if(active===e.pointerId){stroke.push(point(e));active=null;render();}};
pad.onpointercancel=e=>{if(active===e.pointerId)select(null);};
$('teach').onsubmit=e=>{
  e.preventDefault();const shape=normalize(stroke), name=$('label').value.trim();
  if(!shape || !name){$('feedback').textContent='Add a stroke and a gesture name first.';return;}
  saved.push({name,shape});let message='Example saved. The model has rescored your stroke.';
  try{localStorage.setItem(storage,JSON.stringify(saved));}catch{message='Example added for this session. Browser storage is unavailable.';}
  $('label').value='';render();$('feedback').textContent=message;
};
select('Check');
