// Final values stay in the HTML for no-JS, assistive technology and printing.
const values=[...document.querySelectorAll('[data-kpi-target]')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const formatter=new Intl.NumberFormat('de-DE');
const played=new WeakSet(),frames=new Map();
function finish(value){
  cancelAnimationFrame(frames.get(value));frames.delete(value);played.add(value);
  value.querySelector('[data-kpi-value]').textContent=formatter.format(Number(value.dataset.kpiTarget));
}
if(values.length&&'IntersectionObserver' in window&&!reduced.matches){
  const observer=new IntersectionObserver(entries=>{
    for(const {target,isIntersecting} of entries){
      if(!isIntersecting){if(frames.has(target))finish(target);continue;}
      if(played.has(target))continue;
      played.add(target);
      const number=target.querySelector('[data-kpi-value]'),end=Number(target.dataset.kpiTarget);
      number.textContent='0';let started;
      function tick(time){
        started??=time;
        const progress=Math.min(Math.max((time-started)/1400,0),1);
        number.textContent=formatter.format(Math.round(end*(1-Math.pow(1-progress,3))));
        if(progress<1)frames.set(target,requestAnimationFrame(tick));
        else finish(target);
      }
      frames.set(target,requestAnimationFrame(tick));
    }
  },{threshold:.8,rootMargin:'-64px 0px -24px 0px'});
  values.forEach(value=>observer.observe(value));
  function finishAll(){observer.disconnect();values.forEach(finish);}
  reduced.addEventListener('change',()=>{if(reduced.matches)finishAll();});
  window.addEventListener('beforeprint',finishAll);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)for(const value of frames.keys())finish(value);});
}
