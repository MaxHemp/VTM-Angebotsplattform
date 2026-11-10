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
    assert.deepEqual(await page.locator('.site-nav').evaluate(e=>({height:e.getBoundingClientRect().height,color:getComputedStyle(e).backgroundColor})),{height:64,color:'rgb(255, 255, 255)'});
    assert.equal(await page.locator('.experience-primary').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(31, 79, 163)');
    assert.equal(await page.locator('#hero-title').evaluate(e=>getComputedStyle(e).fontWeight),'400');
    assert.equal(await page.locator(':root').evaluate(e=>getComputedStyle(e).getPropertyValue('--vtm-gold').trim()),'#D9A53C');
    assert.equal(await page.locator('#stage-motion').isDisabled(),true);
    assert.equal(await page.locator('.journey-panel:visible').count(),1);
    assert.equal(await page.locator('.scope-library').getAttribute('open'),null);
    // Every physical object has a meaningful, keyboard-operable route to its offering.
    for(const scene of [1,2,3,0]){
      await page.locator(`[data-scene="${scene}"]`).click();
      assert.equal(await page.locator(`[data-scene="${scene}"]`).getAttribute('aria-pressed'),'true');
      assert.equal(await page.locator(`[data-stage-caption="${scene}"]`).isVisible(),true);
      await page.locator('.spatial-stage').screenshot({path:path.join(output,`studio-view-${scene}.png`)});
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
    // The compact navigation is a disclosure, with keyboard closing and stable height.
    await page.setViewportSize({width:390,height:844});
    const menu=page.locator('.nav-toggle');
    await menu.click();
    assert.equal(await page.locator('#primary-menu').isVisible(),true);
    assert.equal(await menu.getAttribute('aria-expanded'),'true');
    assert.equal(await page.locator('.site-nav').evaluate(e=>e.getBoundingClientRect().height),64);
    await page.screenshot({path:path.join(output,'navigation-mobile.png')});
    await menu.press('Escape');
    assert.equal(await page.locator('#primary-menu').isVisible(),false);
    await menu.click();
    await page.locator('#primary-menu').getByRole('link',{name:'Ihr Weg',exact:true}).click();
    assert.equal(await menu.getAttribute('aria-expanded'),'false');
    await page.setViewportSize({width:1440,height:1000});
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
      await page.getByRole('link',{name:'VersicherungsTech Magazin, zum Seitenanfang',exact:true}).click();
      await page.locator('[data-scene="0"]').click();
      assert.equal(await page.locator('.spatial-stage').getAttribute('data-layout'),width<=760?'compact':'wide');
      await page.screenshot({path:path.join(output,`brand-header-${width}.png`)});
      if(process.env.GENERATE_POSTERS&&width===390)await sharp(await page.locator('.spatial-stage').screenshot()).webp({quality:90}).toFile(path.join(__dirname,'../assets/stage-poster-mobile.webp'));
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
    assert.match(await fp.locator('.stage-poster').evaluate(i=>i.currentSrc),/stage-poster-mobile/);
    await fp.locator('[data-journey="dialog"]').click();
    assert.equal(await fp.locator('#weg-dialog').isVisible(),true);
    await fallback.close();
    console.log('PASS: v6.2 brand colors and typography, white 64px navigation, mobile menu and Escape handling, actual WebGL scene, four viewpoints, reduced motion, journey tabs, offer selection, responsive composition and desktop/mobile WebGL fallback. No real inquiries sent.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
