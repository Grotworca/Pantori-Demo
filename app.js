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
function renderTools(){const ps=placements(),onBoard=visiblePlacements();$('#tray').innerHTML='';for(const id of level().pieces){const b=document.createElement('button');b.className='piece-button'+(selected===id?' active':'')+(ps[id]&&id!==selected?' placed':'');b.setAttribute('aria-label',t(id)+(ps[id]&&id!==selected?' - '+t('onBoard'):''));b.setAttribute('aria-pressed',String(selected===id));b.innerHTML=tileSvg(selected===id?shape:ps[id]?.cells||E.normalize(defs[id].cells),defs[id].color,selected===id);b.dataset.piece=id;b.onclick=e=>{if(e?.detail!==0&&Date.now()<suppressClickUntil)return;choose(id)};$('#tray').append(b)}$('#selectedLabel').textContent=selected?t('anchor',{piece:t(selected)}):t('choose');$('#rotate').disabled=$('#flip').disabled=!selected;$('#remove').disabled=!selected;$('#undo').disabled=!history.length;$('#piecesCount').textContent=t('pieceCount',{n:onBoard.length,total:level().pieces.length});$('#fruitCount').textContent=t('fruitCount',{n:level().fruits.filter(at=>coveredCells(onBoard).has(E.key(at))).length,total:level().fruits.length});}
function proposed(x,y){const anchor=shape[0];return {id:selected,color:defs[selected].color,cells:shape,x:x-anchor[0],y:y-anchor[1]}}
// A picked-up piece stays in placements() so cancelling the move restores it,
// but it must not affect any artwork or counters while absent from the board.
function visiblePlacements(){return Object.values(placements()).filter(p=>p.id!==selected);}
function coveredCells(ps){return new Set(ps.flatMap(E.cells).map(E.key));}
function drawFeatures(covered){$('#featureLayer').innerHTML=level().spikes.filter(s=>covered.has(E.key(s.lever))).map(s=>`<g data-retracted="${E.key(s.at)}"><rect x="${s.at[0]*100+2}" y="${s.at[1]*100+3}" width="96" height="94" rx="5" fill="white"/><image href="assets/spikes-retracted.png" x="${s.at[0]*100+5}" y="${s.at[1]*100+8}" width="90" height="84" preserveAspectRatio="none"/></g>`).join('');}
function iconArt(at,kind,active,i){
 // Animated artwork is an independent transparent PNG. Sampling the original
 // board image inside an SVG accidentally picked up black tile borders, which
 // then moved along with ghosts, fruit and diamonds.
 const sprite=PANTORI_ICON_SPRITES[level().id+':'+E.key(at)];
 const cls=kind==='ghost'?(active?'caught':'awake'):kind==='fruit'?(active?'collected':'bouncing'):(active?'collected':'sparkling');
 return `<g transform="translate(${at[0]*100} ${at[1]*100})" data-${kind}="${E.key(at)}" data-${kind==='ghost'?'caught':'collected'}="${active}"><g ${active&&kind!=='fruit'?'filter="url(#ghostGray)"':''}><g class="${kind}-sprite ${cls}" style="animation-delay:-${i*.37}s"><image href="${sprite}" x="15" y="15" width="70" height="70" preserveAspectRatio="xMidYMid meet"/>${kind==='diamond'&&!active?'<path class="diamond-glint" d="M72 19v14M65 26h14" stroke="white" stroke-width="3"/>':''}</g></g></g>`;
}
function drawFruits(covered){$('#fruitLayer').innerHTML=level().fruits.map((at,i)=>iconArt(at,'fruit',covered.has(E.key(at)),i)).join('');$('#diamondLayer').innerHTML=level().diamonds.map((at,i)=>iconArt(at,'diamond',covered.has(E.key(at)),i)).join('');}
function drawLevers(covered){
 const levers=[...new Map(level().spikes.map(s=>[E.key(s.lever),s.lever])).values()];
 $('#featureLayer').innerHTML+=levers.filter(at=>covered.has(E.key(at))).map(([x,y])=>`<g data-lever-active="${x},${y}"><rect x="${x*100+3}" y="${y*100+3}" width="94" height="94" rx="5" fill="white"/><image href="assets/lever-left.png" x="${x*100+7}" y="${y*100+5}" width="86" height="90" preserveAspectRatio="xMidYMid meet"/></g>`).join('');
}
function drawGhosts(ps){$('#ghostLayer').innerHTML=level().ghosts.map((g,i)=>iconArt(g.at,'ghost',ps.some(p=>p.color===g.color&&E.cells(p).some(c=>E.key(c)===E.key(g.at))),i)).join('');}
function draw(){
 const ps=visiblePlacements(),covered=coveredCells(ps);
 $('#board').classList.toggle('piece-selected',!!selected);
 drawFeatures(covered);
 $('#featureLayer').innerHTML+=level().ghosts.map(g=>`<rect x="${g.at[0]*100+3}" y="${g.at[1]*100+3}" width="94" height="94" rx="5" fill="white"/>`).join('');
 drawLevers(covered);
 $('#featureLayer').innerHTML+=[...level().fruits,...level().diamonds].map(([x,y])=>`<rect x="${x*100+3}" y="${y*100+3}" width="94" height="94" rx="5" fill="white"/>`).join('');
 drawFruits(covered);
 drawGhosts(ps);
 $('#placedLayer').innerHTML=ps.map(p=>`<g opacity="1" data-piece="${p.id}">${pieceOverlay(p,false)}</g>`).join('');
 drawPreview();
}
function drawPreview(){let svg='';if(selected&&hover){const p=proposed(...hover);const bad=E.validPlacement(level(),p,Object.values(placements()).filter(q=>q.id!==selected));previewFeedback(bad);
 if(floating){svg+=`<g opacity=".35">${pieceOverlay(p,true)}</g><g transform="translate(${(floating[0]-hover[0])*100} ${(floating[1]-hover[1])*100})">${pieceOverlay(p,true)}</g>`;}else svg+=pieceOverlay(p,true);
 svg+=`<circle cx="${hover[0]*100+50}" cy="${hover[1]*100+50}" r="12" fill="${bad?'#85858d':'#fff'}" stroke="#212037" stroke-width="4"/>`;
 
 }else {previewFeedback(null);}$('#previewLayer').innerHTML=svg;}
function pieceOverlay(p,preview){const bad=preview&&E.validPlacement(level(),p,Object.values(placements()).filter(q=>q.id!==p.id));let color=palette[p.color],outline=bad?'#797982':color,out='';const own=new Set(p.cells.map(E.key));for(const [x,y] of p.cells){const X=(x+p.x)*100,Y=(y+p.y)*100;out+=`<rect x="${X+3}" y="${Y+3}" width="94" height="94" rx="6" fill="${color}" fill-opacity="${preview?.35:.6384}"/>`;if(bad)out+=`<path class="invalid-x" d="M${X+35} ${Y+35}l30 30m0 -30l-30 30" stroke="#fff" stroke-width="9" stroke-linecap="round"/><rect x="${X+3}" y="${Y+3}" width="94" height="94" rx="6" fill="url(#invalidHatch)"/>`;for(const [dx,dy,x1,y1,x2,y2] of [[0,-1,3,3,97,3],[1,0,97,3,97,97],[0,1,3,97,97,97],[-1,0,3,3,3,97]])if(!own.has(E.key([x+dx,y+dy])))out+=`<line x1="${X+x1}" y1="${Y+y1}" x2="${X+x2}" y2="${Y+y2}" stroke="${outline}" stroke-width="${p.id===selected?9:7}" ${preview?'stroke-dasharray="10 5"':''}/>`;}return bad?`<g class="invalid-preview">${out}</g>`:out;}
function place(x,y){const ps=placements();if(!selected){let hit=Object.values(ps).find(p=>E.cells(p).some(c=>c[0]===x&&c[1]===y));if(hit)choose(hit.id);else tell('selectFirst');return}const p=proposed(x,y),error=E.validPlacement(level(),p,Object.values(ps).filter(q=>q.id!==selected));if(error){tell('errors',{errors:[error]},true);FX.invalid();return}const before={...ps};push();ps[selected]=p;selected=null;shape=null;hover=null;floating=null;save();renderTools();draw();tell('placedMsg');FX.placement(p,before);checkAutomatically();}
function renderBoardLabels(){const l=level();
 $('#stage').textContent=t('stage',{n:state.index+1,total:levels.length,id:l.id});$('#levelTitle').textContent=t('level'+l.id);$('#boardArt').src=l.image;
 $('#board').setAttribute('aria-label',t('board'));$('#journey').setAttribute('aria-label',t('journey'));$('#journey').innerHTML='';
 levels.forEach((lv,i)=>{if(i){let line=document.createElement('span');line.className='journey-line';$('#journey').append(line)}let b=document.createElement('button');b.textContent=state.complete.includes(lv.id)?'✓':String(i+1);b.className='step'+(i===state.index?' current':'')+(state.complete.includes(lv.id)?' done':'');b.disabled=i>state.unlocked;b.setAttribute('aria-label',t('step',{n:i+1,id:lv.id})+(b.disabled?', '+t('locked'):''));if(i===state.index)b.setAttribute('aria-current','step');b.onclick=()=>{state.index=i;render();centerMobileBoard()};$('#journey').append(b)});
 $('#grid').innerHTML='';for(let y=0;y<l.size;y++)for(let x=0;x<l.size;x++){let b=document.createElement('button');b.className='cell';const match=c=>E.key(c)===E.key([x,y]);const ghost=l.ghosts.find(g=>match(g.at));const feature=l.walls.some(match)?t('wall'):l.fruits.some(match)?t('fruit'):ghost?t('ghost',{color:t(ghost.color)}):l.diamonds.some(match)?t('diamond'):l.spikes.some(s=>match(s.at))?t('spikes'):l.spikes.some(s=>match(s.lever))?t('lever'):t('empty');b.setAttribute('aria-label',t('cell',{x:x+1,y:y+1,feature}));b.onclick=e=>{if(e.detail!==0&&Date.now()<suppressClickUntil)return;if(touchMode&&!selected){place(x,y);return}if(e.pointerType==='touch'||e.pointerType==='pen'||(e.detail!==0&&Date.now()<suppressClickUntil))return;place(x,y)};b.onpointerenter=e=>{if(e.pointerType==='mouse'&&!gameDrag.active()){setInputMode(false);floating=null;hover=[x,y];schedulePreview()}};b.onfocus=()=>{if(!touchMode&&!gameDrag.active()){hover=[x,y];floating=null;schedulePreview()}};$('#grid').append(b)}
}
function render(){selected=null;shape=null;hover=null;history=[];renderBoardLabels();renderTools();draw();tell('startMsg');}
function winLabels(){const final=state.index===levels.length-1;$('#winEyebrow').textContent=t(final?'finished':'won');$('#winTitle').textContent=t(final?'finalTitle':'winTitle');$('#winText').textContent=t(final?'finalText':'winText');$('#next').textContent=t(final?'backFirst':'next');}
function languageUI(){document.documentElement.setAttribute('data-input',touchMode?'touch':'mouse');document.documentElement.lang=lang;document.title='Pantori · '+t('how');document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));$('#languages').innerHTML='';$('#guideLanguages').innerHTML='';
 for(const host of ['#languages','#guideLanguages'])for(const [code,name] of Object.entries({pl:'Polski',en:'English',de:'Deutsch',fr:'Français',es:'Español',it:'Italiano'})){const b=document.createElement('button');b.className='language-button';b.setAttribute('aria-label',name);b.setAttribute('title',name);b.setAttribute('aria-pressed',String(code===lang));b.innerHTML=`<img src="assets/flag-${code}.svg" alt=""><span>${code.toUpperCase()}</span>`;b.onclick=()=>{lang=code;try{localStorage.setItem('pantori-language',lang)}catch{}languageUI();renderBoardLabels();renderTools();draw();tell(lastMessage.key,lastMessage.args,lastMessage.error);winLabels()};$(host).append(b)}renderGuide();}

// Preview movement is rendered once per display frame, independently of placed pieces.
function clampAnchor(point){const a=shape[0],maxX=Math.max(...shape.map(c=>c[0])),maxY=Math.max(...shape.map(c=>c[1])),n=level().size;return [Math.max(a[0],Math.min(n-1-maxX+a[0],point[0])),Math.max(a[1],Math.min(n-1-maxY+a[1],point[1]))];}
const gameDrag=installPieceDrag({
 board:$('#board'),tray:$('#tray'),surface:$('#grid'),size:()=>level().size,
 selected:()=>selected,shape:()=>shape,hover:()=>hover,click:choose,
 select:id=>{if(selected!==id)choose(id)},
 hit:(x,y)=>Object.values(placements()).find(p=>E.cells(p).some(c=>c[0]===x&&c[1]===y)),
 update:(point,smooth)=>{hover=point;floating=smooth;schedulePreview()},
 drop:()=>{if(selected&&hover)place(...hover)},
 suppress:()=>{suppressClickUntil=Date.now()+650},
 mode:setInputMode
});
function transformPiece(fn){if(selected){shape=fn(shape);floating=null;if(touchMode&&hover)hover=clampAnchor(hover);renderTools();drawPreview();}}
$('#rotate').onclick=()=>transformPiece(E.rotate);$('#flip').onclick=()=>transformPiece(E.flip);

$('#remove').onclick=()=>{if(!selected)return;gameDrag.cancel();if(placements()[selected]){push();delete placements()[selected];save()}selected=null;shape=null;hover=null;floating=null;touchGesture=null;tell('removedMsg');renderTools();draw()};
$('#clear').onclick=()=>{gameDrag.cancel();if(Object.keys(placements()).length)push();state.boards[level().id]={};selected=null;shape=null;hover=null;renderTools();draw();tell('clearedMsg');};
$('#undo').onclick=()=>{if(history.length){gameDrag.cancel();state.boards[level().id]=JSON.parse(history.pop());selected=null;hover=null;save();renderTools();draw();tell('undoMsg');checkAutomatically();}};
function checkAutomatically(){const result=E.check(level(),placements());if(!result.ok){if(Object.keys(placements()).length===level().pieces.length)tell('errors',{errors:result.errors},true);return}if(!state.complete.includes(level().id))state.complete.push(level().id);state.unlocked=Math.max(state.unlocked,Math.min(state.index+1,levels.length-1));save();winLabels();if(!$('#win').open){$('#win').showModal();FX.win();}tell('success');};
$('#next').onclick=()=>{const final=state.index===levels.length-1;if(final){state.index=0}else state.index++;save();$('#win').close();render();centerMobileBoard()};$('#stay').onclick=()=>{$('#win').close();render();tell('success');};
$('#rulesBtn').onclick=()=>openGuide(false);document.addEventListener('contextmenu',e=>{
 if(!selected||document.querySelector('dialog[open]'))return;
 if(e.target.closest('.game-layout')){e.preventDefault();$('#rotate').click();}
});
document.addEventListener('keydown',e=>{
 if(document.querySelector('dialog[open]')||e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
 if(e.key==='Escape'){gameDrag.cancel();selected=null;hover=null;renderTools();draw();}
 if(!selected||e.ctrlKey||e.metaKey||e.altKey)return;
 if(e.code==='Space'||e.key===' '){e.preventDefault();if(!e.repeat)$('#rotate').click();return;}
 if(e.key.toLowerCase()==='f')$('#flip').click();
 if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();$('#remove').click();}
});
// Prevent Space from activating the previously focused button after rotating.
document.addEventListener('keyup',e=>{if((e.code==='Space'||e.key===' ')&&selected&&!document.querySelector('dialog[open]'))e.preventDefault();});
document.addEventListener('pointerdown',e=>{setInputMode(e.pointerType==='touch'||e.pointerType==='pen')},{capture:true});
function centerMobileBoard(){if(!touchMode||!window.scrollTo)return;requestAnimationFrame(()=>{const r=$('#board').getBoundingClientRect(),dock=$('.tool-panel').getBoundingClientRect();const available=Math.min(window.innerHeight,dock.top);window.scrollTo({top:Math.max(0,window.scrollY+r.top-(available-r.height)/2),behavior:'smooth'});});}
function startLanguage(){const host=$('#startLanguages');host.innerHTML='';for(const [code,name] of Object.entries({pl:'Polski',en:'English',de:'Deutsch',fr:'Français',es:'Español',it:'Italiano'})){const b=document.createElement('button');b.innerHTML=`<img src="assets/flag-${code}.svg" alt="">${name}`;b.onclick=()=>{lang=code;try{localStorage.setItem('pantori-language',lang)}catch{}languageUI();render();$('#languageStart').close();openGuide(true)};host.append(b)}$('#languageStart').showModal();}
$('#languageStart').addEventListener('cancel',e=>e.preventDefault());
languageUI();render();startLanguage();
