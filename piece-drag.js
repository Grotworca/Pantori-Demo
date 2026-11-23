'use strict';
// Pointer capture belongs to stable containers, never to a tray button that is rebuilt.
function installPieceDrag(o){
 let gesture=null;
 const point=e=>{const r=o.surface.getBoundingClientRect(),n=o.size(),dims=Array.isArray(n)?n:[n,n];return [(e.clientX-r.left)/r.width*dims[0]-.5,(e.clientY-r.top)/r.height*dims[1]-.5]};
 const inside=e=>{const r=o.surface.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<r.left+r.width&&e.clientY>=r.top&&e.clientY<r.top+r.height};
 function move(e){
  if(!gesture||gesture.id!==e.pointerId)return;
  if(Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>4)gesture.moved=true;
  if(!gesture.moved)return;
  e.preventDefault();
  if(!gesture.started){o.select(gesture.piece);gesture.started=true;}
  const raw=point(e).map((v,i)=>v+gesture.offset[i]);
  o.update(raw.map(Math.round),raw);
 }
 function end(e,cancel=false){
  if(!gesture||gesture.id!==e.pointerId)return;
  const g=gesture;
  if(!cancel)move(e);
  gesture=null;
  if(!cancel&&!g.moved&&!g.started){o.suppress();(o.click||o.select)(g.piece);if(g.root.hasPointerCapture?.(e.pointerId))g.root.releasePointerCapture(e.pointerId);return;}
  if(g.moved||g.started){o.suppress();e.preventDefault();}
  if(cancel||!inside(e)){if(g.started)o.update(null,null);}
  else if(g.started){const raw=point(e).map((v,i)=>v+g.offset[i]);o.update(raw.map(Math.round),null);o.drop();}
  if(g.root.hasPointerCapture?.(e.pointerId))g.root.releasePointerCapture(e.pointerId);
 }
 for(const [root,tray] of [[o.board,false],[o.tray,true]]){
  root.onpointerdown=e=>{
   if(gesture||e.isPrimary===false||(e.button!==undefined&&e.button!==0))return;
   o.mode(e.pointerType!=='mouse');
   const selected=o.selected(),pos=point(e),cell=pos.map(Math.round);
   const piece=tray?e.target.closest('[data-piece]')?.dataset.piece:null;
   const hit=!tray?o.hit(...cell):null;
   // On touch, an unselected map remains scrollable. Tap a piece first to move it.
   if(tray&&!piece)return;
   if(!tray&&!selected&&(e.pointerType!=='mouse'||!hit))return;
   let offset=[0,0],started=!tray&&!!selected;
   if(!tray){
    const shape=selected?o.shape():hit.cells;
    const anchor=shape[0];
    let old=selected?o.hover():[hit.x+anchor[0],hit.y+anchor[1]];
    if(old&&shape.some(c=>c[0]+old[0]-anchor[0]===cell[0]&&c[1]+old[1]-anchor[1]===cell[1]))offset=old.map((v,i)=>v-pos[i]);
   }
   gesture={id:e.pointerId,x:e.clientX,y:e.clientY,root,piece:piece||hit?.id||selected,offset,moved:false,started};
   if(started){e.preventDefault();o.update(pos.map((v,i)=>Math.round(v+offset[i])),null);}
   root.setPointerCapture?.(e.pointerId);
  };
  root.onpointermove=move;root.onpointerup=e=>end(e);root.onpointercancel=e=>end(e,true);root.onlostpointercapture=e=>end(e,true);
 }
 return {active:()=>!!gesture,cancel:()=>{if(gesture){const g=gesture;gesture=null;if(g.root.hasPointerCapture?.(g.id))g.root.releasePointerCapture(g.id);o.update(null,null)}}};
}
