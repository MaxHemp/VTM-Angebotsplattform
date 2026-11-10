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
    await page.mouse.move(720,55);await page.waitForTimeout(1000);
    const bounds=await stage.boundingBox();
    assert(await stage.locator('canvas').evaluate(c=>c.width/c.getBoundingClientRect().width>=1.5),'Canvas supersamples standard displays');
    const images=await page.evaluate(async()=>{
      const img=new Image();img.src='assets/insurance-monday-cover-hd.jpg';await img.decode();return [img.naturalWidth,img.naturalHeight];
    });
    assert.deepEqual(images,[1400,1400],'Podcast artwork uses the high-resolution original');
    const pieces=[{x:.22,spread:.04},{x:.50,spread:.05},{x:.80,spread:.06}];
    const move=async(x,y=.55)=>{await page.mouse.move(bounds.x+bounds.width*x,bounds.y+bounds.height*y,{steps:12});await page.waitForTimeout(1000);};
    async function columns(){
      const result=[];
      for(let i=0;i<3;i++)result.push(await page.screenshot({clip:{x:bounds.x+bounds.width*i/3,y:bounds.y,width:bounds.width/3,height:bounds.height*.85}}));
      return result;
    }
    const changes=[];
    for(let i=0;i<3;i++){
      const {x,spread}=pieces[i];
      await move(x-spread);assert.equal(await stage.getAttribute('data-active-medium'),String(i+1));
      const before=await columns();
      await stage.screenshot({path:path.join(output,`medium-${i+1}-left.png`)});
      await move(x+spread);assert.equal(await stage.getAttribute('data-active-medium'),String(i+1));
      const after=await columns();
      await stage.screenshot({path:path.join(output,`medium-${i+1}-right.png`)});
      for(let j=0;j<3;j++){
        const change=await difference(before[j],after[j]);
        if(j===i){assert(change>.04,`Medium ${i+1} has visible spatial motion: ${change}`);changes.push(change);}
        else assert(change<.003,`Medium ${j+1} remains still while ${i+1} moves: ${change}`);
      }
      await move(x,.40);const upper=await stage.screenshot();
      await move(x,.68);assert(await difference(upper,await stage.screenshot())>.003,`Medium ${i+1} responds vertically`);
      // Captured drag stays attached to this medium, even over another one.
      await move(x);await page.mouse.down();await page.mouse.move(1420,1000,{steps:15});
      assert.equal(await stage.getAttribute('data-active-medium'),String(i+1));
      await page.mouse.up();await page.mouse.move(720,55);await page.waitForTimeout(1000);
      assert.equal(await stage.getAttribute('data-active-medium'),'','Release and leaving the artwork restore neutral motion');
    }
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
    console.log(`PASS: All three media move independently horizontally and vertically; inactive media stay still. Drag capture/release, pause, four close-ups, reduced motion, supersampling and 1400px artwork. Active-column pixel changes: ${changes.map(n=>(n*100).toFixed(1)).join(', ')}%.`);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
