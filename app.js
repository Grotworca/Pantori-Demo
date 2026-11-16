'use strict';
const $=s=>document.querySelector(s),E=Pantori,levels=PANTORI_LEVELS,defs=PANTORI_PIECES;
const dictionaries=PANTORI_I18N;
let lang='pl',lastMessage={key:'startMsg',args:{},error:false},animations=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
try{const stored=localStorage.getItem('pantori-language');if(dictionaries[stored])lang=stored;}catch{}
function t(key,args={}){const deviceKey=key+(touchMode?'Touch':'Mouse');if(dictionaries[lang][deviceKey])key=deviceKey;return (dictionaries[lang][key]||dictionaries.pl[key]||key).replace(/\{(\w+)\}/g,(_,k)=>args[k]??'');}
function translateError(text){const key=Object.keys(dictionaries.pl).find(k=>k.startsWith('err')&&dictionaries.pl[k]===text);return key?t(key):text;}
const palette={red:'#df625d',yellow:'#edca50',blue:'#6b80e1',green:'#59a976'};
let touchMode=window.matchMedia('(pointer: coarse)').matches,touchGesture=null,suppressClickUntil=0;
let floating=null,previewFrame=0;
function setInputMode(touch){if(touchMode===touch)return;touchMode=touch;document.documentElement.setAttribute('data-input',touch?'touch':'mouse');document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));renderGuide();tell(lastMessage.key,lastMessage.args,lastMessage.error);}
function schedulePreview(){if(!previewFrame)previewFrame=requestAnimationFrame(()=>{previewFrame=0;drawPreview()});}
let state={index:0,unlocked:0,boards:{},complete:[]},selected=null,shape=null,history=[],hover=null;
// Start a fresh expedition on every page load; discard the legacy saved game.
try{localStorage.removeItem('pantori-demo-v1')}catch{}
function level(){return levels[state.index]}function placements(){return state.boards[level().id]||(state.boards[level().id]={})}function save(){} // State lives only in memory during this visit.
function push(){history.push(JSON.stringify(placements()));if(history.length>50)history.shift()}
function showFeedback(text,error=false){const el=$('#feedback');el.textContent=text;el.hidden=!text;el.classList.toggle('error',error);}
function tell(key,args={},error=false){lastMessage={key,args,error};const text=error?(key==='errors'?args.errors.map(translateError).join(' '):t(key,args)):'';showFeedback(text,error);if(text)FX.message($('#feedback'),error);}
function previewFeedback(error){if(error)showFeedback(translateError(error),true);else if(selected)showFeedback('');else showFeedback(lastMessage.error?(lastMessage.key==='errors'?lastMessage.args.errors.map(translateError).join(' '):t(lastMessage.key,lastMessage.args)):'',lastMessage.error);}
function tileSvg(c,color,anchor=false){const maxX=Math.max(...c.map(p=>p[0]))+1,maxY=Math.max(...c.map(p=>p[1]))+1;return `<svg viewBox="-3 -3 ${maxX*20+6} ${maxY*20+6}" aria-hidden="true">${c.map(([x,y],i)=>`<rect x="${x*20+1}" y="${y*20+1}" width="18" height="18" rx="3" fill="${palette[color]}" stroke="#172d2950"/>${i===0&&anchor?`<circle cx="${x*20+10}" cy="${y*20+10}" r="3" fill="#fff" stroke="#172d29" stroke-width="1"/>`:''}`).join('')}</svg>`}
function choose(id){floating=null;if(selected===id){selected=null;shape=null;hover=null}else{selected=id;const p=placements()[id];shape=E.normalize(p?.cells||defs[id].cells);hover=touchMode?(p?[p.x+shape[0][0],p.y+shape[0][1]]:[3,3]):null;if(hover)hover=clampAnchor(hover)}renderTools();draw();}
function renderTools(){const ps=placements();$('#tray').innerHTML='';for(const id of level().pieces){const b=document.createElement('button');b.className='piece-button'+(selected===id?' active':'')+(ps[id]?' placed':'');b.setAttribute('aria-label',t(id)+(ps[id]?' - '+t('onBoard'):''));b.setAttribute('aria-pressed',String(selected===id));b.innerHTML=tileSvg(selected===id?shape:ps[id]?.cells||E.normalize(defs[id].cells),defs[id].color,selected===id);b.onpointerdown=e=>{setInputMode(e.pointerType==='touch'||e.pointerType==='pen')};b.onclick=()=>choose(id);$('#tray').append(b)}$('#selectedLabel').textContent=selected?t('anchor',{piece:t(selected)}):t('choose');$('#rotate').disabled=$('#flip').disabled=!selected;$('#confirm').disabled=!selected||!hover;$('#remove').disabled=!selected||!ps[selected];$('#undo').disabled=!history.length;$('#piecesCount').textContent=t('pieceCount',{n:Object.keys(ps).length,total:level().pieces.length});$('#fruitCount').textContent=t('fruitCount',{n:E.check(level(),ps).fruit,total:level().fruits.length});}
function proposed(x,y){const anchor=shape[0];return {id:selected,color:defs[selected].color,cells:shape,x:x-anchor[0],y:y-anchor[1]}}
function drawFeatures(){const covered=new Set(Object.values(placements()).flatMap(E.cells).map(E.key));$('#featureLayer').innerHTML=level().spikes.filter(s=>covered.has(E.key(s.lever))).map(s=>`<g data-retracted="${E.key(s.at)}"><rect x="${s.at[0]*100+2}" y="${s.at[1]*100+3}" width="96" height="94" rx="5" fill="white"/><image href="assets/spikes-retracted.png" x="${s.at[0]*100+5}" y="${s.at[1]*100+8}" width="90" height="84" preserveAspectRatio="none"/></g>`).join('');}
function drawFruits(){
 const covered=new Set(Object.values(placements()).flatMap(E.cells).map(E.key));
 $('#fruitLayer').innerHTML=level().fruits.map(([x,y],i)=>{
 const collected=covered.has(E.key([x,y]));
 return `<g transform="translate(${x*100} ${y*100})" data-fruit="${x},${y}" data-collected="${collected}"><svg x="5" y="5" width="90" height="90" viewBox="5 5 90 90" overflow="hidden"><g class="fruit-sprite ${collected?'collected':'bouncing'}" style="animation-delay:-${i*.41}s"><image href="${level().image}" x="${-x*100}" y="${-y*100}" width="800" height="800" preserveAspectRatio="none" filter="url(#ghostCutout)"/></g></svg></g>`;
 }).join('');
}
function drawLevers(){
 const covered=new Set(Object.values(placements()).flatMap(E.cells).map(E.key));
 const levers=[...new Map(level().spikes.map(s=>[E.key(s.lever),s.lever])).values()];
 $('#featureLayer').innerHTML+=levers.filter(at=>covered.has(E.key(at))).map(([x,y])=>`<g data-lever-active="${x},${y}"><rect x="${x*100+3}" y="${y*100+3}" width="94" height="94" rx="5" fill="white"/><image href="assets/lever-left.png" x="${x*100+7}" y="${y*100+5}" width="86" height="90" preserveAspectRatio="xMidYMid meet"/></g>`).join('');
}
function drawGhosts(){
 const ps=Object.values(placements());
 $('#ghostLayer').innerHTML=level().ghosts.map((g,i)=>{
 const caught=ps.some(p=>p.color===g.color&&E.cells(p).some(c=>E.key(c)===E.key(g.at)));
 const [x,y]=g.at;
 return `<g transform="translate(${x*100} ${y*100})" data-ghost="${E.key(g.at)}" data-caught="${caught}"><g ${caught?'filter="url(#ghostGray)"':''}><svg x="7" y="7" width="86" height="86" viewBox="7 7 86 86" overflow="hidden"><g class="ghost-sprite ${caught?'caught':'awake'}" style="animation-delay:-${i*.37}s"><image href="${level().image}" x="${-x*100}" y="${-y*100}" width="800" height="800" preserveAspectRatio="none" filter="url(#ghostCutout)"/></g></svg></g></g>`;
 }).join('');
}
function draw(){drawFeatures();$('#featureLayer').innerHTML+=level().ghosts.map(g=>`<rect x="${g.at[0]*100+3}" y="${g.at[1]*100+3}" width="94" height="94" rx="5" fill="white"/>`).join('');drawLevers();$('#featureLayer').innerHTML+=level().fruits.map(([x,y])=>`<rect x="${x*100+3}" y="${y*100+3}" width="94" height="94" rx="5" fill="white"/>`).join('');drawFruits();drawGhosts();let svg='';for(const p of Object.values(placements()))svg+=`<g opacity="${p.id===selected?0.5:1}" data-piece="${p.id}">${pieceOverlay(p,false)}</g>`;$('#placedLayer').innerHTML=svg;drawPreview();}
function drawPreview(){let svg='';if(selected&&hover){const p=proposed(...hover);const bad=E.validPlacement(level(),p,Object.values(placements()).filter(q=>q.id!==selected));previewFeedback(bad);
 if(floating){svg+=`<g opacity=".35">${pieceOverlay(p,true)}</g><g transform="translate(${(floating[0]-hover[0])*100} ${(floating[1]-hover[1])*100})">${pieceOverlay(p,true)}</g>`;}else svg+=pieceOverlay(p,true);
 svg+=`<circle cx="${hover[0]*100+50}" cy="${hover[1]*100+50}" r="12" fill="${bad?'#85858d':'#fff'}" stroke="#212037" stroke-width="4"/>`;
 $('#confirm').disabled=!!bad;
 }else {$('#confirm').disabled=true;previewFeedback(null);}$('#previewLayer').innerHTML=svg;}
function pieceOverlay(p,preview){const bad=preview&&E.validPlacement(level(),p,Object.values(placements()).filter(q=>q.id!==p.id));let color=palette[p.color],outline=bad?'#797982':color,out='';const own=new Set(p.cells.map(E.key));for(const [x,y] of p.cells){const X=(x+p.x)*100,Y=(y+p.y)*100;out+=`<rect x="${X+3}" y="${Y+3}" width="94" height="94" rx="6" fill="${color}" fill-opacity="${preview?.35:.6384}"/>`;if(bad)out+=`<rect x="${X+3}" y="${Y+3}" width="94" height="94" rx="6" fill="url(#invalidHatch)"/>`;for(const [dx,dy,x1,y1,x2,y2] of [[0,-1,3,3,97,3],[1,0,97,3,97,97],[0,1,3,97,97,97],[-1,0,3,3,3,97]])if(!own.has(E.key([x+dx,y+dy])))out+=`<line x1="${X+x1}" y1="${Y+y1}" x2="${X+x2}" y2="${Y+y2}" stroke="${outline}" stroke-width="${p.id===selected?9:7}" ${preview?'stroke-dasharray="10 5"':''}/>`;}return out;}
function place(x,y){const ps=placements();if(!selected){let hit=Object.values(ps).find(p=>E.cells(p).some(c=>c[0]===x&&c[1]===y));if(hit)choose(hit.id);else tell('selectFirst');return}const p=proposed(x,y),error=E.validPlacement(level(),p,Object.values(ps).filter(q=>q.id!==selected));if(error){tell('errors',{errors:[error]},true);FX.invalid();return}const before={...ps};push();ps[selected]=p;selected=null;shape=null;hover=null;floating=null;save();renderTools();draw();tell('placedMsg');FX.placement(p,before);checkAutomatically();}
function renderBoardLabels(){const l=level();
 $('#stage').textContent=t('stage',{n:state.index+1,total:levels.length,id:l.id});$('#levelTitle').textContent=t('level'+l.id);$('#boardArt').src=l.image;
 $('#board').setAttribute('aria-label',t('board'));$('#journey').setAttribute('aria-label',t('journey'));$('#journey').innerHTML='';
 levels.forEach((lv,i)=>{if(i){let line=document.createElement('span');line.className='journey-line';$('#journey').append(line)}let b=document.createElement('button');b.textContent=state.complete.includes(lv.id)?'✓':String(i+1);b.className='step'+(i===state.index?' current':'')+(state.complete.includes(lv.id)?' done':'');b.disabled=i>state.unlocked;b.setAttribute('aria-label',t('step',{n:i+1,id:lv.id})+(b.disabled?', '+t('locked'):''));if(i===state.index)b.setAttribute('aria-current','step');b.onclick=()=>{state.index=i;render()};$('#journey').append(b)});
 $('#grid').innerHTML='';for(let y=0;y<l.size;y++)for(let x=0;x<l.size;x++){let b=document.createElement('button');b.className='cell';const match=c=>E.key(c)===E.key([x,y]);const ghost=l.ghosts.find(g=>match(g.at));const feature=l.walls.some(match)?t('wall'):l.fruits.some(match)?t('fruit'):ghost?t('ghost',{color:t(ghost.color)}):l.diamonds.some(match)?t('diamond'):l.spikes.some(s=>match(s.at))?t('spikes'):l.spikes.some(s=>match(s.lever))?t('lever'):t('empty');b.setAttribute('aria-label',t('cell',{x:x+1,y:y+1,feature}));b.onclick=e=>{if(e.pointerType==='touch'||e.pointerType==='pen'||(e.detail!==0&&Date.now()<suppressClickUntil))return;place(x,y)};b.onpointerenter=e=>{if(e.pointerType==='mouse'){setInputMode(false);floating=null;hover=[x,y];schedulePreview()}};b.onfocus=()=>{if(!touchMode){hover=[x,y];floating=null;schedulePreview()}};$('#grid').append(b)}
}
function render(){selected=null;shape=null;hover=null;history=[];renderBoardLabels();renderTools();draw();tell('startMsg');}
function winLabels(){const final=state.index===levels.length-1;$('#winEyebrow').textContent=t(final?'finished':'won');$('#winTitle').textContent=t(final?'finalTitle':'winTitle');$('#winText').textContent=t(final?'finalText':'winText');$('#next').textContent=t(final?'backFirst':'next');}
let guideIndex=0,guideStartup=true;
const guideSlides=[['guideGoal','guidePath','path'],['exampleContact','guideContact','contact'],['guideGhostTitle','guideGhost','ghost'],['exampleSpikes','guideSpikes','spikes'],['exampleDiamonds','guideDiamonds','diamonds'],['guideControlsTitle','guideControls',null]];
function animationState(){const asset=guideSlides[guideIndex][2];$('#guideImage').hidden=!asset;$('#guideControlsArt').hidden=!!asset;$('#animationToggle').hidden=!asset;if(asset){$('#guideImage').src='assets/rules-'+asset+(animations?'.gif':'.png');$('#guideImage').alt=t(guideSlides[guideIndex][0]);}$('#animationToggle').textContent=t(animations?'pause':'animate');$('#animationToggle').setAttribute('aria-pressed',String(animations));}
function renderGuide(focus=false){const [title,description]=guideSlides[guideIndex];$('#guideCount').textContent=t('guideCount',{n:guideIndex+1,total:guideSlides.length});$('#guideTitle').textContent=t(title);$('#guideDescription').textContent=t(description);$('#guidePrev').textContent='← '+t('guidePrev');$('#guideNext').textContent=t('guideNext')+' →';$('#guidePrev').disabled=guideIndex===0;$('#guideNext').disabled=guideIndex===guideSlides.length-1;$('#guideExit').textContent=t(guideStartup?'startGame':'backGame');animationState();if(focus){$('#guideTitle').focus({preventScroll:true});$('#rules').scrollTop=0;}}
function openGuide(startup=false){guideStartup=startup;guideIndex=0;renderGuide();if(!$('#rules').open)$('#rules').showModal();}
$('#guideNext').onclick=()=>{if(guideIndex<guideSlides.length-1){guideIndex++;renderGuide(true);}};
$('#guidePrev').onclick=()=>{if(guideIndex>0){guideIndex--;renderGuide(true);}};
$('#guideExit').onclick=()=>{$('#rules').close();guideStartup=false;};
$('#rules').addEventListener('cancel',()=>{guideStartup=false;});
function languageUI(){document.documentElement.setAttribute('data-input',touchMode?'touch':'mouse');document.documentElement.lang=lang;document.title='Pantori · '+t('how');document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));$('#languages').innerHTML='';$('#guideLanguages').innerHTML='';
 for(const host of ['#languages','#guideLanguages'])for(const [code,name] of Object.entries({pl:'Polski',en:'English',de:'Deutsch',fr:'Français',es:'Español',it:'Italiano'})){const b=document.createElement('button');b.className='language-button';b.setAttribute('aria-label',name);b.setAttribute('title',name);b.setAttribute('aria-pressed',String(code===lang));b.innerHTML=`<img src="assets/flag-${code}.svg" alt=""><span>${code.toUpperCase()}</span>`;b.onclick=()=>{lang=code;try{localStorage.setItem('pantori-language',lang)}catch{}languageUI();renderBoardLabels();renderTools();draw();tell(lastMessage.key,lastMessage.args,lastMessage.error);winLabels()};$(host).append(b)}renderGuide();}
$('#animationToggle').onclick=()=>{animations=!animations;animationState()};
// Preview movement is rendered once per display frame, independently of placed pieces.
function clampAnchor(point){const a=shape[0],maxX=Math.max(...shape.map(c=>c[0])),maxY=Math.max(...shape.map(c=>c[1])),n=level().size;return [Math.max(a[0],Math.min(n-1-maxX+a[0],point[0])),Math.max(a[1],Math.min(n-1-maxY+a[1],point[1]))];}
function boardPoint(e,r=$('#grid').getBoundingClientRect()){const n=level().size;return [(e.clientX-r.left)/r.width*n-.5,(e.clientY-r.top)/r.height*n-.5];}
function touchCell(e){const p=boardPoint(e).map(Math.round),n=level().size;return p.every(v=>v>=0&&v<n)?p:null;}
function updateDrag(e){const g=touchGesture;if(!g)return;const point=boardPoint(e,g.rect);floating=clampAnchor([point[0]+g.offset[0],point[1]+g.offset[1]]);hover=floating.map(Math.round);schedulePreview();}
$('#board').onpointerdown=e=>{
 if(e.pointerType!=='touch'&&e.pointerType!=='pen')return;
 if(touchGesture||e.isPrimary===false)return;
 setInputMode(true);suppressClickUntil=Date.now()+600;
 const cell=touchCell(e);if(!cell)return;const wasSelected=!!selected;
 if(!selected){const hit=Object.values(placements()).find(p=>E.cells(p).some(c=>c[0]===cell[0]&&c[1]===cell[1]));if(!hit)return;choose(hit.id);}
 const onPreview=hover&&E.cells(proposed(...hover)).some(c=>c[0]===cell[0]&&c[1]===cell[1]);
 const rect=$('#grid').getBoundingClientRect(),point=boardPoint(e,rect),start=onPreview?hover:clampAnchor(cell);
 e.preventDefault();$('#board').setPointerCapture(e.pointerId);
 touchGesture={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false,wasSelected,rect,offset:[start[0]-point[0],start[1]-point[1]],previous:hover};hover=[...start];floating=null;drawPreview();
};
$('#board').onpointermove=e=>{
 if(!touchGesture||touchGesture.id!==e.pointerId)return;
 e.preventDefault();if(Math.hypot(e.clientX-touchGesture.x,e.clientY-touchGesture.y)>4)touchGesture.moved=true;
 if(touchGesture.moved)updateDrag(e);
};
$('#board').onpointerup=e=>{
 if(!touchGesture||touchGesture.id!==e.pointerId)return;
 e.preventDefault();const gesture=touchGesture;
 if(Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>4)gesture.moved=true;
 if(gesture.moved)updateDrag(e);
 touchGesture=null;floating=null;suppressClickUntil=Date.now()+600;
 if($('#board').hasPointerCapture(e.pointerId))$('#board').releasePointerCapture(e.pointerId);
 drawPreview();if(!gesture.moved&&gesture.wasSelected&&touchCell(e)&&selected)place(...hover);
};
function cancelTouch(e){if(touchGesture?.id===e.pointerId){hover=touchGesture.previous;touchGesture=null;floating=null;suppressClickUntil=Date.now()+600;drawPreview();}}
$('#board').onpointercancel=cancelTouch;$('#board').onlostpointercapture=cancelTouch;
$('#board').onpointerleave=e=>{if(e.pointerType==='mouse'&&!touchGesture){hover=null;floating=null;schedulePreview()}};
function transformPiece(fn){if(selected){shape=fn(shape);floating=null;if(touchMode&&hover)hover=clampAnchor(hover);renderTools();drawPreview();}}
$('#rotate').onclick=()=>transformPiece(E.rotate);$('#flip').onclick=()=>transformPiece(E.flip);
$('#confirm').onclick=()=>{if(selected&&hover)place(...hover)};
$('#remove').onclick=()=>{if(selected&&placements()[selected]){push();delete placements()[selected];selected=null;shape=null;save();renderTools();draw();tell('removedMsg')}};
$('#clear').onclick=()=>{if(Object.keys(placements()).length)push();state.boards[level().id]={};selected=null;shape=null;hover=null;renderTools();draw();tell('clearedMsg');};
$('#undo').onclick=()=>{if(history.length){state.boards[level().id]=JSON.parse(history.pop());selected=null;hover=null;save();renderTools();draw();tell('undoMsg');checkAutomatically();}};
function checkAutomatically(){const result=E.check(level(),placements());if(!result.ok){if(Object.keys(placements()).length===level().pieces.length)tell('errors',{errors:result.errors},true);return}if(!state.complete.includes(level().id))state.complete.push(level().id);state.unlocked=Math.max(state.unlocked,Math.min(state.index+1,levels.length-1));save();winLabels();if(!$('#win').open){$('#win').showModal();FX.win();}tell('success');};
$('#next').onclick=()=>{const final=state.index===levels.length-1;if(final){state.index=0}else state.index++;save();$('#win').close();render();$('.board-panel').scrollIntoView({behavior:'smooth',block:'start'})};$('#stay').onclick=()=>{$('#win').close();render();tell('success');};
$('#rulesBtn').onclick=()=>openGuide(false);document.addEventListener('contextmenu',e=>{
 if(!selected||document.querySelector('dialog[open]'))return;
 if(e.target.closest('.game-layout')){e.preventDefault();$('#rotate').click();}
});
document.addEventListener('keydown',e=>{
 if(document.querySelector('dialog[open]')||e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
 if(e.key==='Escape'){selected=null;hover=null;renderTools();draw();}
 if(!selected||e.ctrlKey||e.metaKey||e.altKey)return;
 if(e.code==='Space'||e.key===' '){e.preventDefault();if(!e.repeat)$('#rotate').click();return;}
 if(e.key.toLowerCase()==='f')$('#flip').click();
 if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();$('#remove').click();}
});
// Prevent Space from activating the previously focused button after rotating.
document.addEventListener('keyup',e=>{if((e.code==='Space'||e.key===' ')&&selected&&!document.querySelector('dialog[open]'))e.preventDefault();});
document.addEventListener('pointerdown',e=>{setInputMode(e.pointerType==='touch'||e.pointerType==='pen')},{capture:true});
languageUI();render();openGuide(true);
