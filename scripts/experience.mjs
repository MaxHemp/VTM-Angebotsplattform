const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const navigation=document.querySelector('.site-nav');
new ResizeObserver(()=>document.documentElement.style.setProperty('--experience-nav-height',`${navigation.getBoundingClientRect().height}px`)).observe(navigation);
const tabs = [...document.querySelectorAll('[data-journey]')];
const panels = [...document.querySelectorAll('.journey-panel')];
const video = document.querySelector('.journey-video');
const videoButton = document.querySelector('.event-motion');
let videoWanted = !reduced.matches, videoVisible = false;

function syncVideo() {
  const play = videoWanted && videoVisible && !document.hidden && !video.closest('[hidden]');
  if (play) video.play().catch(() => { videoWanted=false; syncVideo(); });
  else video.pause();
  videoButton.textContent = videoWanted ? 'Szene pausieren' : 'Szene abspielen';
  videoButton.setAttribute('aria-pressed',String(!videoWanted));
}
function chooseJourney(id, focus=false) {
  tabs.forEach(tab=>{
    const active=tab.dataset.journey===id;
    tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;
    if(active&&focus)tab.focus();
  });
  panels.forEach(panel=>{
    panel.setAttribute('role','tabpanel');
    panel.hidden=panel.id!==`weg-${id}`;
  });
  syncVideo();
}
tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>chooseJourney(tab.dataset.journey));
  tab.addEventListener('keydown',event=>{
    let next;
    if(event.key==='ArrowRight')next=(index+1)%tabs.length;
    if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=tabs.length-1;
    if(next!==undefined){event.preventDefault();chooseJourney(tabs[next].dataset.journey,true);}
  });
});
document.querySelectorAll('[data-journey-link]').forEach(link=>link.addEventListener('click',()=>chooseJourney(link.dataset.journeyLink)));
document.querySelectorAll('[data-find-goal]').forEach(link=>link.addEventListener('click',()=>{
  const goal=document.getElementById('finder-goal');
  goal.value=link.dataset.findGoal;goal.dispatchEvent(new Event('change',{bubbles:true}));
}));
videoButton.addEventListener('click',()=>{videoWanted=!videoWanted;syncVideo();});
reduced.addEventListener('change',()=>{videoWanted=!reduced.matches;syncVideo();});
document.addEventListener('visibilitychange',syncVideo);
const videoObserver=new IntersectionObserver(entries=>{videoVisible=entries[0].isIntersecting;syncVideo();},{threshold:.15});
videoObserver.observe(video);
chooseJourney('sichtbarkeit');

// Keep the complete original scopes available without repeating them in the main journey.
const library=document.querySelector('.scope-library');
library.open=false;
function revealDestination(hash) {
  let target;
  try { target=document.getElementById(decodeURIComponent(hash.slice(1))); } catch { return; }
  if(!target)return;
  for(let p=target.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
  if(target.tagName==='DETAILS')target.open=true;
}
document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#"]');
  if(link)revealDestination(link.getAttribute('href'));
},true);
window.addEventListener('hashchange',()=>revealDestination(location.hash));
if(location.hash){revealDestination(location.hash);requestAnimationFrame(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView());}

// Review the selected offers first. The complete builder remains one click away.
const builderToggle=document.getElementById('config-show-all');
let showAll=false;
function syncBuilder() {
  const cards=[...document.querySelectorAll('.offer-card')];
  const selected=cards.filter(c=>c.classList.contains('is-selected'));
  const focused=document.activeElement?.closest('.offer-card');
  if(!showAll&&focused&&!focused.classList.contains('is-selected'))builderToggle.focus({preventScroll:true});
  cards.forEach(card=>card.hidden=!showAll&&!card.classList.contains('is-selected'));
  document.querySelectorAll('.config-group').forEach(group=>group.hidden=!showAll&&!group.querySelector('.offer-card.is-selected'));
  document.getElementById('config-empty').hidden=showAll||selected.length>0;
  document.getElementById('config-review-note').textContent=showAll?'Alle Leistungen zum Zusammenstellen':selected.length?`${selected.length} ausgewählte ${selected.length===1?'Leistung':'Leistungen'} · Menge und Edition hier anpassen`:'Ihre Auswahl beginnt bei Ihrem Vorhaben.';
  builderToggle.textContent=showAll?'Nur meine Auswahl anzeigen':'Weitere Leistungen hinzufügen';
  builderToggle.setAttribute('aria-pressed',String(showAll));
}
builderToggle.addEventListener('click',()=>{showAll=!showAll;syncBuilder();});
document.addEventListener('vtm:selectionchange',syncBuilder);
syncBuilder();

// A genuine WebGL scene is progressive enhancement; all offers and the poster work without it.
const stage=document.querySelector('.spatial-stage');
const motion=document.getElementById('stage-motion');
function showFallback(){
  stage.dataset.renderer='fallback';motion.disabled=true;motion.textContent='Standansicht';
  document.querySelector('.stage-toolbar > span').textContent='Formatvisualisierung · Standansicht';
}
const rendererObserver=new MutationObserver(()=>{if(stage.dataset.renderer==='fallback'){rendererObserver.disconnect();showFallback();}});
rendererObserver.observe(stage,{attributes:true,attributeFilter:['data-renderer']});
const sceneObserver=new IntersectionObserver(entries=>{
  if(!entries.some(e=>e.isIntersecting))return;
  sceneObserver.disconnect();
  import('./spatial.mjs').catch(showFallback);
},{rootMargin:'200px'});
sceneObserver.observe(stage);
