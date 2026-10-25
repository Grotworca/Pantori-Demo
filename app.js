'use strict';
const $=s=>document.querySelector(s),E=Pantori,levels=PANTORI_LEVELS,defs=PANTORI_PIECES;
const dictionaries=PANTORI_I18N;
let lang='pl',lastMessage={key:'startMsg',args:{},error:false},animations=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
try{const stored=localStorage.getItem('pantori-language');if(dictionaries[stored])lang=stored;}catch{}
function t(key,args={}){return (dictionaries[lang][key]||dictionaries.pl[key]||key).replace(/\{(\w+)\}/g,(_,k)=>args[k]??'');}
function translateError(text){const key=Object.keys(dictionaries.pl).find(k=>k.startsWith('err')&&dictionaries.pl[k]===text);return key?t(key):text;}
const palette={red:'#df625d',yellow:'#edca50',blue:'#6b80e1',green:'#59a976'};
let state={index:0,unlocked:0,boards:{},complete:[]},selected=null,shape=null,history=[],hover=null;
// Start a fresh expedition on every page load; discard the legacy saved game.
try{localStorage.removeItem('pantori-demo-v1')}catch{}
function level(){return levels[state.index]}function placements(){return state.boards[level().id]||(state.boards[level().id]={})}function save(){} // State lives only in memory during this visit.
function push(){history.push(JSON.stringify(placements()));if(history.length>50)history.shift()}
function tell(key,args={},error=false){lastMessage={key,args,error};$('#feedback').textContent=key==='errors'?args.errors.map(translateError).join(' '):t(key,args);$('#feedback').classList.toggle('error',error);}
function tileSvg(c,color,anchor=false){const maxX=Math.max(...c.map(p=>p[0]))+1,maxY=Math.max(...c.map(p=>p[1]))+1;return `<svg viewBox="-3 -3 ${maxX*20+6} ${maxY*20+6}" aria-hidden="true">${c.map(([x,y],i)=>`<rect x="${x*20+1}" y="${y*20+1}" width="18" height="18" rx="3" fill="${palette[color]}" stroke="#172d2950"/>${i===0&&anchor?`<circle cx="${x*20+10}" cy="${y*20+10}" r="3" fill="#fff" stroke="#172d29" stroke-width="1"/>`:''}`).join('')}</svg>`}
function choose(id){if(selected===id){selected=null;shape=null}else{selected=id;shape=E.normalize(placements()[id]?.cells||defs[id].cells)}hover=null;renderTools();draw();}
function renderTools(){const ps=placements();$('#tray').innerHTML='';for(const id of level().pieces){const b=document.createElement('button');b.className='piece-button'+(selected===id?' active':'')+(ps[id]?' placed':'');b.setAttribute('aria-label',t(id)+(ps[id]?' - '+t('onBoard'):''));b.setAttribute('aria-pressed',String(selected===id));b.innerHTML=tileSvg(selected===id?shape:ps[id]?.cells||E.normalize(defs[id].cells),defs[id].color,selected===id);b.onclick=()=>choose(id);$('#tray').append(b)}$('#selectedLabel').textContent=selected?t('anchor',{piece:t(selected)}):t('choose');$('#rotate').disabled=$('#flip').disabled=!selected;$('#remove').disabled=!selected||!ps[selected];$('#undo').disabled=!history.length;$('#piecesCount').textContent=t('pieceCount',{n:Object.keys(ps).length,total:level().pieces.length});$('#fruitCount').textContent=t('fruitCount',{n:E.check(level(),ps).fruit,total:level().fruits.length});}
function proposed(x,y){const anchor=shape[0];return {id:selected,color:defs[selected].color,cells:shape,x:x-anchor[0],y:y-anchor[1]}}
function draw(){let svg='';for(const p of Object.values(placements()))svg+=`<g opacity="${p.id===selected?0.5:1}" data-piece="${p.id}">${pieceOverlay(p,false)}</g>`;if(selected&&hover)svg+=pieceOverlay(proposed(...hover),true);$('#overlay').innerHTML=svg}
function pieceOverlay(p,preview){const bad=preview&&E.validPlacement(level(),p,Object.values(placements()).filter(q=>q.id!==p.id));let color=bad?'#ee2738':palette[p.color],out='';const own=new Set(p.cells.map(E.key));for(const [x,y] of p.cells){const X=(x+p.x)*100,Y=(y+p.y)*100;out+=`<rect x="${X+3}" y="${Y+3}" width="94" height="94" rx="6" fill="${color}" fill-opacity="${preview?.35:.48}"/>`;for(const [dx,dy,x1,y1,x2,y2] of [[0,-1,3,3,97,3],[1,0,97,3,97,97],[0,1,3,97,97,97],[-1,0,3,3,3,97]])if(!own.has(E.key([x+dx,y+dy])))out+=`<line x1="${X+x1}" y1="${Y+y1}" x2="${X+x2}" y2="${Y+y2}" stroke="${color}" stroke-width="${p.id===selected?9:7}" ${preview?'stroke-dasharray="10 5"':''}/>`;}return out;}
function place(x,y){const ps=placements();if(!selected){let hit=Object.values(ps).find(p=>E.cells(p).some(c=>c[0]===x&&c[1]===y));if(hit)choose(hit.id);else tell('selectFirst');return}const p=proposed(x,y),error=E.validPlacement(level(),p,Object.values(ps).filter(q=>q.id!==selected));if(error){tell('errors',{errors:[error]},true);return}push();ps[selected]=p;selected=null;shape=null;hover=null;save();renderTools();draw();tell('placedMsg');checkAutomatically();}
function renderBoardLabels(){const l=level();
 $('#stage').textContent=t('stage',{n:state.index+1,total:levels.length,id:l.id});$('#levelTitle').textContent=t('level'+l.id);$('#boardArt').src=l.image;
 $('#board').setAttribute('aria-label',t('board'));$('#journey').setAttribute('aria-label',t('journey'));$('#journey').innerHTML='';
 levels.forEach((lv,i)=>{if(i){let line=document.createElement('span');line.className='journey-line';$('#journey').append(line)}let b=document.createElement('button');b.textContent=state.complete.includes(lv.id)?'✓':String(i+1);b.className='step'+(i===state.index?' current':'')+(state.complete.includes(lv.id)?' done':'');b.disabled=i>state.unlocked;b.setAttribute('aria-label',t('step',{n:i+1,id:lv.id})+(b.disabled?', '+t('locked'):''));if(i===state.index)b.setAttribute('aria-current','step');b.onclick=()=>{state.index=i;render()};$('#journey').append(b)});
 $('#grid').innerHTML='';for(let y=0;y<l.size;y++)for(let x=0;x<l.size;x++){let b=document.createElement('button');b.className='cell';const match=c=>E.key(c)===E.key([x,y]);const ghost=l.ghosts.find(g=>match(g.at));const feature=l.walls.some(match)?t('wall'):l.fruits.some(match)?t('fruit'):ghost?t('ghost',{color:t(ghost.color)}):l.diamonds.some(match)?t('diamond'):l.spikes.some(s=>match(s.at))?t('spikes'):l.spikes.some(s=>match(s.lever))?t('lever'):t('empty');b.setAttribute('aria-label',t('cell',{x:x+1,y:y+1,feature}));b.onclick=()=>place(x,y);b.onpointerenter=e=>{if(e.pointerType==='mouse'){hover=[x,y];draw()}};b.onfocus=()=>{hover=[x,y];draw()};$('#grid').append(b)}
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
function languageUI(){document.documentElement.lang=lang;document.title='Pantori · '+t('how');document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));$('#languages').innerHTML='';$('#guideLanguages').innerHTML='';
 for(const host of ['#languages','#guideLanguages'])for(const [code,name] of Object.entries({pl:'Polski',en:'English',de:'Deutsch',fr:'Français',es:'Español',it:'Italiano'})){const b=document.createElement('button');b.className='language-button';b.setAttribute('aria-label',name);b.setAttribute('title',name);b.setAttribute('aria-pressed',String(code===lang));b.innerHTML=`<img src="assets/flag-${code}.svg" alt=""><span>${code.toUpperCase()}</span>`;b.onclick=()=>{lang=code;try{localStorage.setItem('pantori-language',lang)}catch{}languageUI();renderBoardLabels();renderTools();draw();tell(lastMessage.key,lastMessage.args,lastMessage.error);winLabels()};$(host).append(b)}renderGuide();}
$('#animationToggle').onclick=()=>{animations=!animations;animationState()};
$('#board').onpointerleave=()=>{hover=null;draw()};
$('#rotate').onclick=()=>{if(selected){shape=E.rotate(shape);renderTools();draw()}};$('#flip').onclick=()=>{if(selected){shape=E.flip(shape);renderTools();draw()}};
$('#remove').onclick=()=>{if(selected&&placements()[selected]){push();delete placements()[selected];selected=null;shape=null;save();renderTools();draw();tell('removedMsg')}};
$('#clear').onclick=()=>{if(Object.keys(placements()).length)push();state.boards[level().id]={};selected=null;shape=null;hover=null;renderTools();draw();tell('clearedMsg');};
$('#undo').onclick=()=>{if(history.length){state.boards[level().id]=JSON.parse(history.pop());selected=null;hover=null;save();renderTools();draw();tell('undoMsg');checkAutomatically();}};
function checkAutomatically(){const result=E.check(level(),placements());if(!result.ok){if(Object.keys(placements()).length===level().pieces.length)tell('errors',{errors:result.errors},true);return}if(!state.complete.includes(level().id))state.complete.push(level().id);state.unlocked=Math.max(state.unlocked,Math.min(state.index+1,levels.length-1));save();winLabels();if(!$('#win').open)$('#win').showModal();tell('success');};
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
languageUI();render();openGuide(true);
