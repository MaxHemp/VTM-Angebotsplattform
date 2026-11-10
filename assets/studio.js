/* One on-demand animation frame; no rendering loop when idle or offscreen. */
(() => {
  const hero=document.querySelector('.studio-hero');
  if (!hero) return;
  const button=hero.querySelector('.studio-motion');
  const visual=hero.querySelector('.studio-visual');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  let paused=false, visible=true, frame=0;
  let targetX=0,targetY=0,x=0,y=0;
  const allowed=()=>!reduce.matches && !paused && visible && !document.hidden;
  function reset() {
    cancelAnimationFrame(frame);frame=0;
    x=y=targetX=targetY=0;
    hero.style.setProperty('--pointer-x','0');hero.style.setProperty('--pointer-y','0');
    hero.style.setProperty('--scroll','0');
  }
  function render() {
    frame=0;if(!allowed())return;
    x+=(targetX-x)*.09;y+=(targetY-y)*.09;
    hero.style.setProperty('--pointer-x',x.toFixed(4));hero.style.setProperty('--pointer-y',y.toFixed(4));
    const rect=hero.getBoundingClientRect();
    hero.style.setProperty('--scroll',Math.min(1,Math.max(0,-rect.top/rect.height)).toFixed(4));
    if(Math.abs(targetX-x)+Math.abs(targetY-y)>.002) schedule();
  }
  function schedule() { if(allowed()&&!frame)frame=requestAnimationFrame(render); }
  function sync() {
    hero.dataset.motion=reduce.matches?'off':'on';
    hero.classList.toggle('is-paused',paused||reduce.matches);
    hero.classList.toggle('is-offscreen',!visible||document.hidden);
    button.hidden=false;
    button.disabled=reduce.matches;
    button.setAttribute('aria-pressed',String(paused||reduce.matches));
    button.querySelector('.motion-label').textContent=reduce.matches?'Reduzierte Bewegung aktiv':paused?'Animation fortsetzen':'Animation pausieren';
    button.querySelector('.motion-icon').textContent=paused||reduce.matches?'▷':'Ⅱ';
    if(!allowed())reset();else schedule();
  }
  button.addEventListener('click',()=>{paused=!paused;sync();});
  // The parent receives movement even though the decorative layers ignore input.
  hero.addEventListener('pointermove',event=>{
    if(!fine.matches||!allowed())return;
    const rect=visual.getBoundingClientRect();
    targetX=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));
    targetY=Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1));schedule();
  });
  hero.addEventListener('pointerleave',()=>{targetX=targetY=0;schedule();});
  window.addEventListener('scroll',schedule,{passive:true});
  document.addEventListener('visibilitychange',sync);
  reduce.addEventListener('change',sync);
  if('IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0});
    observer.observe(hero);
  }
  sync();
})();
