/* Real mouse input and rendered pixels: no inquiries are submitted. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const output=path.join(__dirname,'../test-results');
fs.mkdirSync(output,{recursive:true});
(async()=>{
  const browser=await chromium.launch({channel:'chrome'});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'no-preference'});
    await page.route('https://formspree.io/**',r=>r.abort());
    await page.goto(process.env.TEST_URL||'http://127.0.0.1:8765',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.querySelector('.spatial-stage').dataset.renderer==='webgl');
    const stage=page.locator('.spatial-stage');
    // Decode browser screenshots in the browser so the test needs no image library.
    async function difference(a,b){
      return page.evaluate(async images=>{
        const pixels=await Promise.all(images.map(async src=>{
          const img=new Image();img.src='data:image/png;base64,'+src;await img.decode();
          const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;
          const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);return ctx.getImageData(0,0,img.width,img.height).data;
        }));
        let changed=0;for(let i=0;i<pixels[0].length;i+=4){
          if(Math.max(...[0,1,2].map(c=>Math.abs(pixels[0][i+c]-pixels[1][i+c])))>12)changed++;
        }
        return changed/(pixels[0].length/4);
      },[a.toString('base64'),b.toString('base64')]);
    }
    // Settling waits are intentional: compare final visible poses, not event flags.
    await page.mouse.move(80,150);await page.waitForTimeout(800);
    const left=await stage.screenshot({path:path.join(output,'header-pointer-left.png')});
    await page.mouse.move(1360,300,{steps:16});await page.waitForTimeout(800);
    const right=await stage.screenshot({path:path.join(output,'header-pointer-right.png')});
    const headerChange=await difference(left,right);
    assert(headerChange>.01,`Mouse above the artwork visibly tilts the scene: ${headerChange}`);
    await page.mouse.move(720,55);await page.waitForTimeout(800);
    const neutral=await stage.screenshot();
    await page.mouse.move(720,800);await page.waitForTimeout(800);
    const lower=await stage.screenshot();
    assert(await difference(neutral,lower)>.003,'Vertical mouse movement visibly affects the scene');
    // Check the actual stage surface too, including release outside its bounds.
    const bounds=await stage.boundingBox();
    await page.mouse.move(bounds.x+bounds.width*.5,bounds.y+bounds.height*.5);
    await page.mouse.down();await page.mouse.move(1420,1000,{steps:15});await page.mouse.up();
    await page.mouse.move(80,150);await page.waitForTimeout(800);
    const afterRelease=await stage.screenshot();
    await page.mouse.move(1360,300,{steps:16});await page.waitForTimeout(800);
    assert(await difference(afterRelease,await stage.screenshot())>.01,'Pointer capture releases and hover continues');
    // Pause freezes the visible artwork, including subsequent pointer movement.
    await page.locator('#stage-motion').click();
    const stopped=await stage.screenshot();
    await page.mouse.move(80,150);await page.waitForTimeout(400);
    assert.equal(await difference(stopped,await stage.screenshot()),0,'Pause really freezes the rendered scene');
    await page.locator('#stage-motion').click();
    // Each close-up remains operable after the pointer interaction.
    for(const scene of [1,2,3,0]){
      await page.locator(`[data-scene="${scene}"]`).click();
      await page.mouse.move(1200,200);await page.waitForTimeout(800);
      assert.equal(await stage.getAttribute('data-view'),String(scene));
      await stage.screenshot({path:path.join(output,`header-moving-view-${scene}.png`)});
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    const reduced=await stage.screenshot();
    await page.mouse.move(80,150);await page.waitForTimeout(400);
    assert.equal(await difference(reduced,await stage.screenshot()),0,'System reduced motion disables pointer animation');
    console.log(`PASS: Header-wide horizontal and vertical mouse motion, drag release outside the scene, pause, four close-ups and reduced motion. Left/right pixel change: ${(headerChange*100).toFixed(1)}%.`);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
