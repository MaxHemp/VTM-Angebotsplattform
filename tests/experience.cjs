/* Local browser verification. All inquiry requests are blocked. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const sharp=process.env.GENERATE_POSTERS?require('sharp'):null;
const base=process.env.TEST_URL||'http://127.0.0.1:8765';
const output=path.join(__dirname,'../test-results');
fs.mkdirSync(output,{recursive:true});
(async()=>{
  const browser=await chromium.launch({channel:'chrome'});
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  await context.route('https://formspree.io/**',r=>r.abort());
  const page=await context.newPage(),errors=[];
  page.setDefaultTimeout(15000);
  page.on('pageerror',e=>errors.push(e.message));
  try {
    await page.goto(base,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.querySelector('.spatial-stage').dataset.renderer==='webgl');
    assert.equal(await page.locator('#stage-motion').isDisabled(),true);
    assert.equal(await page.locator('.journey-panel:visible').count(),1);
    assert.equal(await page.locator('.scope-library').getAttribute('open'),null);
    // Every physical object has a meaningful, keyboard-operable route to its offering.
    for(const scene of [1,2,3,0]){
      await page.locator(`[data-scene="${scene}"]`).click();
      assert.equal(await page.locator(`[data-scene="${scene}"]`).getAttribute('aria-pressed'),'true');
      assert.equal(await page.locator(`[data-stage-caption="${scene}"]`).isVisible(),true);
    }
    if(process.env.GENERATE_POSTERS){
      await sharp(await page.locator('.spatial-stage').screenshot()).webp({quality:88}).toFile(path.join(__dirname,'../assets/stage-poster.webp'));
    }
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.waitForFunction(()=>document.querySelector('.spatial-stage').dataset.motion==='on');
    await page.locator('#stage-motion').click();
    assert.equal(await page.locator('.spatial-stage').getAttribute('data-motion'),'off');
    await page.locator('#stage-motion').click();
    assert.equal(await page.locator('.spatial-stage').getAttribute('data-motion'),'on');
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.locator('[data-journey="sichtbarkeit"]').click();
    await page.locator('[data-journey="sichtbarkeit"]').press('ArrowRight');
    assert.equal(await page.locator('#tab-expertise').getAttribute('aria-selected'),'true');
    assert.equal(await page.locator('#weg-expertise').isVisible(),true);
    await page.locator('#tab-expertise').press('End');
    assert.equal(await page.locator('#weg-dialog').isVisible(),true);
    assert.equal(await page.locator('.journey-panel:visible').count(),1);
    assert.equal(await page.locator('.journey-video').evaluate(v=>v.paused),true);
    await page.locator('.event-motion').click();
    await page.waitForFunction(()=>{const v=document.querySelector('.journey-video');return v.readyState>=2&&!v.paused;});
    await page.locator('.event-motion').click();
    assert.equal(await page.locator('.journey-video').evaluate(v=>v.paused),true);
    if(process.env.GENERATE_POSTERS){
      const frame=await page.locator('.journey-video').evaluate(v=>{const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);return c.toDataURL('image/png').split(',')[1];});
      await sharp(Buffer.from(frame,'base64')).resize(1200).webp({quality:86}).toFile(path.join(__dirname,'../assets/experts-poster.webp'));
    }
    await page.locator('#weg-dialog [data-find-goal]').click();
    assert.equal(await page.locator('#finder-goal').inputValue(),'dialog');
    assert.equal(await page.locator('.discovery-card[data-offer="experts-sponsoring"]').isVisible(),true);
    assert.equal(await page.locator('.discovery-card[data-offer="podcast-ads"]').isVisible(),false);
    await page.locator('#finder-filters button[type="reset"]').click();
    await page.locator('.discovery-card[data-offer="experts-sponsoring"] summary').click();
    await page.locator('.discovery-card[data-offer="experts-sponsoring"] [data-add]').click();
    assert.match(await page.locator('#total-value').innerText(),/8\.500/);
    await page.locator('#reset-config').click();
    await page.getByRole('link',{name:'Leistungen & Preise',exact:true}).click();
    await page.locator('.discovery-card[data-offer="einzelartikel"] summary').click();
    await page.locator('.discovery-card[data-offer="einzelartikel"] .discovery-details').click();
    assert.equal(await page.locator('#angebot-einzelartikel').isVisible(),true);
    await page.getByRole('link',{name:'25 EXPERTS',exact:true}).first().click();
    assert.equal(await page.locator('#weg-dialog').isVisible(),true);
    assert.equal(await page.locator('.journey-video').evaluate(v=>v.paused),true);
    // No horizontal overflow, including each journey and its media at phone widths.
    for(const width of [320,390,768,1440]){
      await page.setViewportSize({width,height:1000});
      for(const goal of ['sichtbarkeit','expertise','dialog']){
        await page.locator(`[data-journey="${goal}"]`).click();
        const overflow=await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&getComputedStyle(e).position!=='fixed').slice(0,12).map(e=>({tag:e.tagName,cls:String(e.className),text:e.textContent.trim().slice(0,60)})));
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`No overflow: ${width}, ${goal}: ${JSON.stringify(overflow)}`);
        await page.locator('.journey-tabs').scrollIntoViewIfNeeded();
        await page.screenshot({path:path.join(output,`journey-${goal}-${width}.png`)});
      }
    }
    await page.setViewportSize({width:1440,height:1000});
    await page.getByRole('link',{name:'VersicherungsTech Magazin, zum Seitenanfang',exact:true}).click();
    await page.screenshot({path:path.join(output,'experience-desktop.png')});
    assert.deepEqual(errors,[]);
    // WebGL failure must retain the still image and all business interactions.
    const fallback=await browser.newContext({viewport:{width:390,height:844}});
    await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl2'||type==='webgl')return null;return original.call(this,type,...args);};});
    const fp=await fallback.newPage();await fp.goto(base,{waitUntil:'networkidle'});
    await fp.waitForFunction(()=>document.querySelector('.spatial-stage').dataset.renderer==='fallback');
    assert.equal(await fp.locator('.stage-poster').evaluate(i=>i.complete&&i.naturalWidth>0),true);
    await fp.locator('[data-journey="dialog"]').click();
    assert.equal(await fp.locator('#weg-dialog').isVisible(),true);
    await fallback.close();
    console.log('PASS: actual WebGL scene, four viewpoints, pause and reduced motion, accessible journey tabs, event video controls, goal-to-offer flow, adding offers, responsive journeys and WebGL fallback. No real inquiries sent.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
