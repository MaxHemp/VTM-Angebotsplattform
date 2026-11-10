/* Scroll-triggered KPI animation and the revised customer contact flow. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const base=process.env.TEST_URL||'http://127.0.0.1:8765';
(async()=>{
  const browser=await chromium.launch({channel:'chrome'});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
    await page.route('https://formspree.io/**',r=>r.abort());
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base,{waitUntil:'networkidle'});
    const numbers=page.locator('[data-kpi-value]');
    assert.deepEqual(await numbers.allTextContents(),['6.000','35.000','20.000'],'Final numbers are available before scrolling');
    await page.evaluate(()=>{
      window.kpiHistory={};
      for(const el of document.querySelectorAll('[data-kpi-target]')){
        const value=el.querySelector('[data-kpi-value]'),history=window.kpiHistory[el.dataset.kpiTarget]=[];
        new MutationObserver(()=>history.push(Number(value.textContent.replaceAll('.','')))).observe(value,{childList:true,characterData:true,subtree:true});
      }
    });
    await page.locator('.reach-interlude').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>Object.values(window.kpiHistory).every(values=>values.length>2));
    await page.waitForFunction(()=>Object.entries(window.kpiHistory).every(([end,values])=>values.at(-1)===Number(end)));
    for(const [end,history] of Object.entries(await page.evaluate(()=>window.kpiHistory))){
      assert.equal(history[0],0);assert(history.some(v=>v>0&&v<Number(end)),'Intermediate numbers are rendered');
      assert(history.every((v,i)=>i===0||v>=history[i-1]),'Counts never decrease or overshoot');
    }
    // Rounding can reach the final integer a few frames before easing completes.
    await page.waitForTimeout(200);
    const lengths=await page.evaluate(()=>Object.values(window.kpiHistory).map(v=>v.length));
    await page.locator('#anfrage').scrollIntoViewIfNeeded();
    await page.locator('.reach-interlude').scrollIntoViewIfNeeded();await page.waitForTimeout(200);
    assert.deepEqual(await page.evaluate(()=>Object.values(window.kpiHistory).map(v=>v.length)),lengths,'Counts run once per visit');
    assert.equal(await page.locator('[data-kpi-value][aria-hidden="true"]').count(),3,'Animated values do not repeatedly announce to screen readers');
    assert.deepEqual(await page.locator('.kpi-accessible').allTextContents(),['Über 6.000','35.000','Über 20.000']);
    assert.match(await page.locator('#zusammenarbeit .kicker').first().innerText(),/^05/);
    assert.match(await page.locator('#anfrage .kicker').first().innerText(),/^06/);
    assert.equal(await page.locator('.discovery-card[data-offer="themenpartnerschaft"] h3').innerText(),'Thought Leadership Kampagne');
    assert.equal(await page.locator('.discovery-card[data-offer="themenkampagne"] h3').innerText(),'Themenkampagne');
    await page.locator('.discovery-card[data-offer="themenpartnerschaft"] summary').click();
    await page.locator('.discovery-card[data-offer="themenpartnerschaft"] [data-add]').click();
    assert.match(await page.locator('#summary-list').innerText(),/Thought Leadership Kampagne/);
    assert.match(await page.locator('#total-value').innerText(),/3\.000.*Monat/);
    await page.locator('#anfrage').scrollIntoViewIfNeeded();
    assert.equal(await page.locator('.kontakt-person .name').innerText(),'Maximilian Dahmen');
    assert.match(await page.locator('.kontakt-person .rolle').innerText(),/^Partnership Manager$/i);
    await page.locator('.kontakt-person img').evaluate(img=>img.decode());
    assert.equal(await page.locator('.kontakt-person img').evaluate(img=>img.naturalWidth),400);
    assert.doesNotMatch(await page.locator('body').innerText(),/Maximilian Hempel|Themenpartnerschaft|Antwort vom Herausgeber/);
    await page.screenshot({path:path.join(__dirname,'../test-results/partnership-contact-desktop.png')});
    await page.setViewportSize({width:390,height:844});
    await page.locator('#anfrage').scrollIntoViewIfNeeded();
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.screenshot({path:path.join(__dirname,'../test-results/partnership-contact-mobile.png')});
    await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'networkidle'});
    await page.locator('.reach-interlude').scrollIntoViewIfNeeded();
    assert.deepEqual(await numbers.allTextContents(),['6.000','35.000','20.000'],'Reduced motion displays final values');
    await page.emulateMedia({media:'print'});
    assert.match(await page.locator('.discovery-card[data-offer="themenpartnerschaft"]').innerText(),/Thought Leadership Kampagne/);
    assert.deepEqual(errors,[]);
    const nojs=await browser.newContext({javaScriptEnabled:false});
    const staticPage=await nojs.newPage();await staticPage.goto(base,{waitUntil:'networkidle'});
    assert.deepEqual(await staticPage.locator('[data-kpi-value]').allTextContents(),['6.000','35.000','20.000']);
    await nojs.close();
    console.log('PASS: KPI count from zero, monotonic progression, exact final values, single run, static accessible values, reduced motion, no-JS, section 05/06, renamed monthly offer, unchanged campaign, Dahmen portrait/contact and mobile layout. No real inquiries sent.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
