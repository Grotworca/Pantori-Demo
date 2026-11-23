'use strict';
let guideWelcome=true,guideIndex=0,guideStartup=true,lessonState=null,lessonSelected=null,lessonShape=null,lessonHover=null,lessonSuppress=0;
const lessonBase={size:5,walls:[],ghosts:[],fruits:[],diamonds:[],spikes:[],pieces:['redI']};
const lessons=[{"key":"fruit","fruits":[[0,1],[1,2]],"pieces":["greenT"],"walls":[[1,4],[3,4],[0,0],[4,2],[4,1],[2,4],[2,2],[1,0],[4,4]]},{"key":"edge","fruits":[[2,2]],"pieces":["redI"],"walls":[[0,0],[4,0],[0,4],[4,4],[1,1],[3,3]],"height":6},{"key":"rotate","fruits":[[0,3],[3,3]],"pieces":["yellowI"],"walls":[[2,2],[0,0],[4,2],[3,4],[3,1],[0,1],[3,0],[4,0],[1,0]]},{"key":"flip","fruits":[[0,1],[2,3]],"target":[[0,1],[1,1],[1,2],[1,3],[2,3]],"pieces":["blueS"],"walls":[[4,1],[2,4],[3,0],[4,0],[4,3],[0,3],[4,2],[2,2],[2,1]]},{"key":"contact","fruits":[[2,0],[3,3]],"pieces":["redT","greenT"],"walls":[[0,3],[3,2],[3,4],[1,3],[2,1],[4,0],[0,4],[4,3],[4,1]]},{"key":"ghost","fruits":[[0,1],[4,4]],"ghosts":[{"at":[1,2],"color":"green"},{"at":[3,4],"color":"yellow"},{"at":[4,0],"color":"red"}],"pieces":["greenU","yellowI"],"walls":[[4,1],[0,2],[3,3],[0,0],[2,2],[4,2],[1,0],[3,1],[2,0]]},{"key":"spikes","fruits":[[2,2],[1,3]],"spikes":[{"at":[2,3],"lever":[0,1]}],"pieces":["yellowI","blueL"],"walls":[[1,1],[3,1],[3,4],[4,4],[1,2],[2,1],[1,0],[3,3],[3,2],[0,4],[4,0],[4,3],[2,4],[3,0],[4,2],[4,1]]},{"key":"diamonds","fruits":[[0,3],[4,3]],"diamonds":[[1,1],[3,4]],"pieces":["redT","blueL"],"walls":[[0,0],[3,2],[2,1],[0,2],[1,4],[3,0],[3,1],[4,1],[4,0],[4,2],[2,4]]},{"key":"diamondsNone","fruits":[[4,1],[0,1]],"diamonds":[[3,3],[1,0]],"pieces":["redT","blueL"],"walls":[[4,4],[1,2],[2,3],[4,2],[3,0],[1,4],[1,3],[0,3],[0,4]]}];
const welcomePieces=[{id:'redI',color:'red',cells:[[0,0],[0,1],[0,2]],x:0,y:0},{id:'blueL',color:'blue',cells:[[1,0],[0,1],[1,1]],x:1,y:1}];
function lesson(){return {...lessonBase,...(guideWelcome?{key:'welcome',pieces:['redI','blueL'],fruits:[[0,0],[2,1]],walls:[[1,0],[3,0],[4,1],[1,3],[3,3],[0,4]]}:lessons[guideIndex])};}
function lessonVisible(){if(guideWelcome)return welcomePieces;return Object.values(lessonState.ps).filter(p=>p.id!==lessonSelected);}
function lessonProposal(){const a=lessonShape[0];return {id:lessonSelected,color:PANTORI_PIECES[lessonSelected].color,cells:lessonShape,x:lessonHover[0]-a[0],y:lessonHover[1]-a[1]};}
function lessonSolved(){
 if(guideWelcome)return true;
 const l=lesson(),ps=lessonState.ps;
 if(lessonSelected||!Pantori.check(l,ps).ok)return false;
 const covered=new Set(Object.values(ps).flatMap(Pantori.cells).map(Pantori.key));
 if(l.target&&(covered.size!==l.target.length||!l.target.every(c=>covered.has(Pantori.key(c)))))return false;
 return true;
}
function lessonChoose(id){if(guideWelcome)return;if(lessonSelected===id){lessonSelected=null;lessonShape=null;lessonHover=null;}else{lessonSelected=id;lessonShape=Pantori.normalize(lessonState.ps[id]?.cells||PANTORI_PIECES[id].cells);lessonHover=null;}renderGuide();}
function lessonPlace(){
 if(guideWelcome||!lessonSelected||!lessonHover)return;
 const p=lessonProposal(),error=Pantori.validPlacement(lesson(),p,lessonVisible());
 if(error){renderLesson();document.querySelector('#lessonFeedback').textContent=translateError(error);return;}
 lessonState.ps[lessonSelected]=p;lessonSelected=null;lessonShape=null;lessonHover=null;renderGuide();
}
function resetLesson(){lessonSelected=null;lessonShape=null;lessonHover=null;lessonState={ps:{}};buildLessonGrid();renderGuide();}
function lessonIcon(at,src,gray=false){if(src==='assets/tutorial-spikes.png'||src==='assets/tutorial-lever.png'){const crop=src.includes('spikes')?'208 108 90 82':'5 405 90 90';return `<svg x="${at[0]*100+10}" y="${at[1]*100+10}" width="80" height="80" viewBox="${crop}"><image href="assets/map-16.png" width="800" height="800" preserveAspectRatio="none"/></svg>`;}return `<image href="${src}" x="${at[0]*100+16}" y="${at[1]*100+16}" width="68" height="68" ${gray?'style="filter:grayscale(1)"':''}/>`;}
function lessonTiles(p,preview=false,bad=false){return `<g class="${bad?'invalid-preview':''}">${Pantori.cells(p).map(([x,y])=>`<rect x="${x*100+5}" y="${y*100+5}" width="90" height="90" rx="8" fill="${bad?'#888':palette[p.color]}" fill-opacity="${preview?.45:.64}" stroke="${bad?'#555':palette[p.color]}" stroke-width="6" ${preview?'stroke-dasharray="9 5"':''}/>${bad?`<path d="M${x*100+35} ${y*100+35}l30 30m0 -30l-30 30" stroke="white" stroke-width="8"/>`:''}`).join('')}</g>`;}
function renderLesson(){
 if(!lessonState)return;
 const l=lesson(),ps=lessonVisible(),covered=new Set(ps.flatMap(Pantori.cells).map(Pantori.key));
 let svg='';for(let y=0;y<(l.height||l.size);y++)for(let x=0;x<(l.width||l.size);x++)svg+=`<rect x="${x*100+2}" y="${y*100+2}" width="96" height="96" rx="7" fill="#fffdf4" stroke="#272331" stroke-width="4"/>`;
 l.walls.forEach(([x,y])=>{svg+=`<g data-wall="${x},${y}"><rect x="${x*100+4}" y="${y*100+4}" width="92" height="92" rx="5" fill="#6376c7"/><path d="M${x*100+4} ${y*100+34}h92m-92 32h92M${x*100+50} ${y*100+4}v30m-23 0v32m46 -32v32m-23 0v30" fill="none" stroke="#e7edff" stroke-width="4"/></g>`;});
 l.spikes.forEach(s=>{svg+=`<path data-lever-link="true" d="M${s.lever[0]*100+50} ${s.lever[1]*100+50}V${s.at[1]*100+50}H${s.at[0]*100+50}" fill="none" stroke="#302c40" stroke-width="7" stroke-dasharray="1 17" stroke-linecap="round"/>`;});
 if(l.target)svg+=l.target.map(([x,y])=>`<rect x="${x*100+10}" y="${y*100+10}" width="80" height="80" rx="6" fill="#dce4ff" stroke="#516fc7" stroke-dasharray="7 6" stroke-width="3"/>`).join('');
 l.fruits.forEach(at=>svg+=lessonIcon(at,'assets/sprites/icon-16-3-2.png'));
 l.spikes.forEach(s=>{const active=covered.has(Pantori.key(s.lever));svg+=lessonIcon(s.at,active?'assets/spikes-retracted.png':'assets/tutorial-spikes.png');svg+=lessonIcon(s.lever,active?'assets/lever-left.png':'assets/tutorial-lever.png');});
 svg+=ps.map(p=>lessonTiles(p)).join('');
 l.ghosts.forEach(g=>svg+=lessonIcon(g.at,({'red':'assets/sprites/icon-16-1-3.png','blue':'assets/sprites/icon-16-7-2.png','green':'assets/sprites/icon-17-1-0.png','yellow':'assets/sprites/icon-16-4-6.png'})[g.color],covered.has(Pantori.key(g.at))));
 l.diamonds.forEach(at=>svg+=lessonIcon(at,'assets/sprites/icon-17-6-2.png',covered.has(Pantori.key(at))));
 let error=null;
 if(lessonSelected&&lessonHover){const p=lessonProposal();error=Pantori.validPlacement(l,p,ps);svg+=lessonTiles(p,true,!!error);}
 document.querySelector('#lessonArt').innerHTML=svg;
 document.querySelector('#lessonBoard').classList.toggle('piece-selected',!!lessonSelected);
 const solved=lessonSolved();
 if(!error&&!lessonSelected&&!solved&&ps.length===l.pieces.length)error=Pantori.check(l,lessonState.ps).errors[0]||null;
 document.querySelector('#lessonFeedback').textContent=error?translateError(error):t(guideWelcome?'welcomeExample':solved?'lessonSuccess':'lessonTry');
 document.querySelector('#lessonFeedback').classList.toggle('solved',solved);
 document.querySelector('#guideNext').disabled=!solved||guideIndex===lessons.length-1;
 document.querySelector('#lessonRotate').disabled=document.querySelector('#lessonFlip').disabled=!lessonSelected;
}
function renderGuide(){
 const $=s=>document.querySelector(s),l=lesson();
 $('#guideCount').textContent=guideWelcome?t('welcomeLabel'):t('guideCount',{n:guideIndex+1,total:lessons.length});
 for(const id of ['#lessonGrid','#lessonTray','#lessonTools','#lessonFeedback'])$(id).hidden=guideWelcome&&id!=='#lessonFeedback';
 renderContactExamples(!guideWelcome&&l.key==='contact');renderEdgeExample(!guideWelcome&&l.key==='edge');
 $('#guideTitle').textContent=t(guideWelcome?'welcomeTitle':'lessonTitle_'+l.key);$('#guideDescription').textContent=t(guideWelcome?'welcomeText':'lesson_'+l.key);
 if(!guideWelcome&&l.key==='ghost'){const note=document.createElement('strong');note.textContent=t('ghostOptional');$('#guideDescription').append(document.createElement('br'),note);}
 $('#guidePrev').textContent='← '+t('guidePrev');$('#guidePrev').disabled=guideWelcome;
 $('#guideNext').textContent=t('guideNext')+' →';$('#guideExit').textContent=t(guideStartup?'startGame':'backGame');
 if(!lessonState){$('#guideNext').disabled=true;return;}
 $('#lessonTray').innerHTML='';for(const id of l.pieces){const b=document.createElement('button');b.dataset.piece=id;b.className='piece-button'+(id===lessonSelected?' active':'');b.setAttribute('aria-label',t(id));b.setAttribute('aria-pressed',String(id===lessonSelected));b.innerHTML=tileSvg(id===lessonSelected?lessonShape:lessonState.ps[id]?.cells||PANTORI_PIECES[id].cells,PANTORI_PIECES[id].color);b.onclick=e=>{if(e.detail!==0&&Date.now()<lessonSuppress)return;lessonChoose(id)};$('#lessonTray').append(b);}
 renderLesson();
}
function openGuide(startup=false){guideStartup=startup;guideWelcome=true;guideIndex=0;resetLesson();if(!document.querySelector('#rules').open)document.querySelector('#rules').showModal();}
// The exercise owns its own placements; playing it never mutates the expedition.
const lessonDrag=installPieceDrag({board:document.querySelector('#lessonBoard'),tray:document.querySelector('#lessonTray'),surface:document.querySelector('#lessonBoard'),size:()=>[lesson().width||lesson().size,lesson().height||lesson().size],
 selected:()=>lessonSelected,shape:()=>lessonShape,hover:()=>lessonHover,click:lessonChoose,
 select:id=>{if(lessonSelected!==id)lessonChoose(id)},
 hit:(x,y)=>Object.values(lessonState.ps).find(p=>Pantori.cells(p).some(c=>c[0]===x&&c[1]===y)),
 update:p=>{lessonHover=p;renderLesson()},drop:lessonPlace,suppress:()=>lessonSuppress=Date.now()+650,mode:touch=>setInputMode(touch)});
const lessonGrid=document.querySelector('#lessonGrid');
function buildLessonGrid(){const l=lesson(),w=l.width||l.size,h=l.height||l.size;lessonGrid.innerHTML='';lessonGrid.style.gridTemplateColumns=`repeat(${w},1fr)`;lessonGrid.style.gridTemplateRows=`repeat(${h},1fr)`;document.querySelector('#lessonBoard').style.aspectRatio=`${w}/${h}`;document.querySelector('#lessonArt').setAttribute('viewBox',`0 0 ${w*100} ${h*100}`);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const b=document.createElement('button');b.className='cell';b.setAttribute('aria-label',`${x+1}, ${y+1}`);b.onclick=e=>{if(e.detail!==0&&Date.now()<lessonSuppress)return;if(lessonSelected){lessonHover=[x,y];lessonPlace();}else{const hit=Object.values(lessonState.ps).find(p=>Pantori.cells(p).some(c=>c[0]===x&&c[1]===y));if(hit)lessonChoose(hit.id);}};b.onpointerenter=e=>{if(e.pointerType==='mouse'&&!lessonDrag.active()&&lessonSelected){lessonHover=[x,y];renderLesson();}};lessonGrid.append(b);}}
document.querySelector('#lessonRotate').onclick=()=>{if(lessonSelected){lessonShape=Pantori.rotate(lessonShape);renderGuide();}};
document.querySelector('#lessonFlip').onclick=()=>{if(lessonSelected){lessonShape=Pantori.flip(lessonShape);renderGuide();}};
document.querySelector('#lessonReset').onclick=()=>{lessonDrag.cancel();resetLesson();};
document.querySelector('#guideNext').onclick=()=>{if(guideWelcome){guideWelcome=false;resetLesson();return;}if(lessonSolved()&&guideIndex<lessons.length-1){lessonDrag.cancel();guideIndex++;resetLesson();}};
document.querySelector('#guidePrev').onclick=()=>{if(!guideWelcome){lessonDrag.cancel();if(guideIndex===0)guideWelcome=true;else guideIndex--;resetLesson();}};
document.querySelector('#guideExit').onclick=()=>{lessonDrag.cancel();document.querySelector('#rules').close();guideStartup=false;centerMobileBoard();};
document.querySelector('#rules').addEventListener('cancel',()=>{lessonDrag.cancel();guideStartup=false;});
document.querySelector('#lessonBoard').oncontextmenu=e=>{if(lessonSelected){e.preventDefault();document.querySelector('#lessonRotate').click();}};
document.addEventListener('keydown',e=>{if(!document.querySelector('#rules').open||!lessonSelected||e.ctrlKey||e.metaKey||e.altKey)return;if(e.code==='Space'){e.preventDefault();if(!e.repeat)document.querySelector('#lessonRotate').click();}else if(e.key.toLowerCase()==='f'){e.preventDefault();document.querySelector('#lessonFlip').click();}});

function renderContactExamples(show){
 const host=document.querySelector('#contactExamples');host.hidden=!show;if(!show)return;
 const red={id:'redI',color:'red',cells:[[0,0],[0,1],[0,2]],x:0,y:0};
 const blue=y=>({id:'blueL',color:'blue',cells:[[0,0],[1,0],[0,1]],x:1,y});
 host.innerHTML=[['contactMany',0],['contactDiagonal',3]].map(([key,y])=>`<figure><svg viewBox="-10 -10 320 520" role="img" aria-label="${t(key)}">${lessonTiles(red)}${lessonTiles(blue(y))}<text x="265" y="95" text-anchor="middle" font-size="80" font-weight="bold" fill="#b52c40">×</text></svg><figcaption>${t(key)}</figcaption></figure>`).join('');
}

function renderEdgeExample(show){const host=document.querySelector('#edgeExample');host.hidden=!show;if(!show)return;
 const p={id:'redI',color:'red',cells:[[0,0],[0,1],[0,2]],x:0,y:0};
 host.innerHTML=`<svg viewBox="-60 -15 380 330" role="img" aria-label="${t('edgeExample')}"><rect x="0" y="0" width="300" height="300" rx="8" fill="#fffdf4" stroke="#292237" stroke-width="6"/>${lessonTiles(p)}<path d="M-50 50H-8m-15 -14l15 14-15 14" fill="none" stroke="#36773e" stroke-width="9" stroke-linecap="round"/></svg><p>${t('edgeExample')}</p>`;
}
