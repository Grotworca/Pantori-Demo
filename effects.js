'use strict';
// Short, bounded effects: no work in the pointer-move path and no input interception.
const FX=(()=>{
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let active=0,messageTimer;
 const colors=['#ffcf60','#ff86b2','#91b7ff','#b7e477','#be95ff'];
 function animate(el,frames,options){if(reduced()||!el?.animate)return;return el.animate(frames,options);}
 function burst(x,y,color,count=14,host=document.body,confetti=false){
  if(reduced()||!host?.append||!document.body?.animate)return;
  const rect=host===document.body?{left:0,top:0}:host.getBoundingClientRect();
  for(let i=0;i<count&&active<120;i++){
   const dot=document.createElement('span');dot.className='fx-particle';dot.setAttribute('aria-hidden','true');
   const angle=Math.random()*Math.PI*2,travel=28+Math.random()*65,life=confetti?1600+Math.random()*800:450+Math.random()*300;
   Object.assign(dot.style,{position:host===document.body?'fixed':'absolute',left:(x-rect.left)+'px',top:(y-rect.top)+'px',background:color||colors[i%colors.length],width:(confetti?7:5+Math.random()*5)+'px',height:(confetti?12:6)+'px',borderRadius:confetti?'2px':'50%'});
   host.append(dot);active++;
   const dx=confetti?(Math.random()-.5)*420:Math.cos(angle)*travel,dy=confetti?220+Math.random()*240:Math.sin(angle)*travel+25;
   const a=dot.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(${Math.random()*540}deg) scale(.2)`,opacity:0}],{duration:life,easing:confetti?'cubic-bezier(.2,.5,.5,1)':'cubic-bezier(.1,.6,.3,1)'});
   a.onfinish=a.oncancel=()=>{dot.remove();active--;};
  }
 }
 function cell(at,color,count=16){if(reduced()||!document.body?.animate)return;const r=document.querySelector('#board').getBoundingClientRect();burst(r.left+(at[0]+.5)*r.width/level().size,r.top+(at[1]+.5)*r.height/level().size,color,count);}
 function pulse(at,color){
  if(reduced()||!document.body?.animate)return;
  const board=document.querySelector('#board'),r=board.getBoundingClientRect(),ring=document.createElement('span');ring.className='fx-ring';ring.setAttribute('aria-hidden','true');
  Object.assign(ring.style,{left:(at[0]+.5)*100/level().size+'%',top:(at[1]+.5)*100/level().size+'%',width:r.width/level().size+'px',height:r.height/level().size+'px',borderColor:color});board.append(ring);
  const a=ring.animate([{transform:'translate(-50%,-50%) scale(.4)',opacity:1},{transform:'translate(-50%,-50%) scale(1.7)',opacity:0}],{duration:650,easing:'ease-out'});a.onfinish=a.oncancel=()=>ring.remove();
 }
 return {
  placement(p,before){const occupied=new Set(Object.values(before).flatMap(Pantori.cells).map(Pantori.key));const cells=Pantori.cells(p);cell(cells[Math.floor(cells.length/2)],palette[p.color],12);
   for(const at of cells){if(occupied.has(Pantori.key(at)))continue;const ghost=level().ghosts.find(g=>Pantori.key(g.at)===Pantori.key(at)&&g.color===p.color);const fruit=level().fruits.some(c=>Pantori.key(c)===Pantori.key(at));if(ghost||fruit){const color=ghost?palette[p.color]:'#ffca42';cell(at,color,ghost?24:20);pulse(at,color);}}
  },
  message(el,error){if(window.setTimeout){clearTimeout(messageTimer);el.classList.toggle("bubble-visible",true);messageTimer=setTimeout(()=>el.classList.toggle("bubble-visible",false),error?9000:2400);}animate(el,[{transform:'translateY(8px) scale(.97)'},{transform:'translateY(0) scale(1)'}],{duration:240,easing:'ease-out'});if(el.getBoundingClientRect){const r=el.getBoundingClientRect();burst(r.left+r.width/2,r.top+12,error?'#ff809d':'#b7e477',10);}},
  invalid(){animate(document.querySelector('main'),[{transform:'translateX(0)'},{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(-3px)'},{transform:'translateX(3px)'},{transform:'translateX(0)'}],{duration:260});},
  win(){const el=document.querySelector('#win');animate(el,[{transform:'scale(.88)',opacity:0},{transform:'scale(1)',opacity:1}],{duration:350,easing:'cubic-bezier(.2,.8,.2,1)'});if(el.getBoundingClientRect){const r=el.getBoundingClientRect();burst(r.left+r.width/2,r.top+20,null,70,el,true);}}
 };
})();
