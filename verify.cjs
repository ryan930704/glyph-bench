const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const server=spawn(process.execPath,[path.join(__dirname,'serve.cjs')],{env:{...process.env,PORT:'4189'}});
(async()=>{
  const url='http://127.0.0.1:4189';
  let browser;
  try{
    for(let i=0;i<40;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
    browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome'});
    const page=await browser.newPage({viewport:{width:1920,height:1080}});
    const errors=[];
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    page.on('pageerror',e=>errors.push(e.message));
    page.on('requestfailed',r=>errors.push(r.url()));
    page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
    const shot=name=>page.screenshot({path:path.resolve(__dirname,'../shots',name+'.png')});
    const verdict=()=>page.locator('#verdict').innerText();
    await page.goto(url);
    for(const name of ['Peak','Pulse','Check']){
      await page.getByRole('button',{name,exact:true}).click();
      assert.equal(await verdict(),name);
    }
    await shot('01-recognize');
    await page.getByRole('button',{name:'Slash',exact:true}).click();
    assert.equal(await verdict(),'Uncertain');
    await page.locator('#label').fill('Slash');
    await shot('02-review');
    await page.getByRole('button',{name:'Save example'}).click();
    assert.equal(await verdict(),'Slash');
    await shot('03-learn');
    await page.reload();
    await page.getByRole('button',{name:'Slash',exact:true}).click();
    assert.equal(await verdict(),'Slash');
    await page.locator('#label').fill('Cut');
    await page.locator('#label').press('Enter');
    assert.equal(await verdict(),'Uncertain');
    await shot('04-conflict');
    await page.locator('#clear').click();
    assert.equal(await verdict(),'Awaiting stroke');
    const points=await page.locator('#pad').evaluate(el=>[[117,144],[177,195],[205,204],[234,185],[324,126],[435,55]].map(([x,y])=>{const p=new DOMPoint(x,y).matrixTransform(el.getScreenCTM());return [p.x,p.y];}));
    await page.mouse.move(...points[0]);await page.mouse.down();
    for(const p of points.slice(1))await page.mouse.move(...p,{steps:5});
    await page.mouse.up();assert.equal(await verdict(),'Check');
    await page.setViewportSize({width:390,height:844});
    await page.getByRole('button',{name:'Pulse',exact:true}).focus();
    await page.keyboard.press('Enter');assert.equal(await verdict(),'Pulse');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.locator('summary').click();
    assert.equal(await page.locator('details').getAttribute('open'),'');
    assert.deepEqual(errors,[]);
    console.log('PASS · samples, rejection, teaching, persistence, ambiguous labels, pointer drawing, mobile keyboard, layout and browser errors.');
  }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
