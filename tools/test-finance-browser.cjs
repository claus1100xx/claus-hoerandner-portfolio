const path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
let playwright;try{playwright=require('playwright');}catch(_){playwright=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const base=(process.argv[2]||'http://127.0.0.1:8766/').replace(/\/?$/,'/');
const output=process.env.FINANCE_QA_DIR||path.join(require('node:os').tmpdir(),'portfolio-finance-qa');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const executablePath=process.env.CHROME_PATH||(process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined);
 const browser=await playwright.chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
 const p=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'finance-demo.html');await p.locator('#finance-app').waitFor({state:'visible'});await p.evaluate(()=>document.fonts.ready);
 const question=async q=>{await p.locator('#finance-question').fill(q);await p.locator('#finance-ask').click();};
 const heading=()=>p.locator('#finance-answer-heading').innerText();
 assert.match(await heading(),/\$219k below budget/);assert.equal(await p.locator('#finance-table-rows tr').count(),15);
 assert.match(await p.locator('#finance-answer-body').innerText(),/\$2.82M/);
 await p.screenshot({path:path.join(output,'finance-desktop.png'),fullPage:true});
 await question('What about Europe?');assert.equal(await p.locator('#finance-region').inputValue(),'eu');assert.match(await heading(),/\$90k/);
 await question('And August?');assert.equal(await p.locator('#finance-period').inputValue(),'2026-08');assert.equal(await p.locator('#finance-region').inputValue(),'eu');assert.match(await heading(),/\$148k/);
 await p.locator('#finance-reset').click();
 await question('Which region has the largest profit shortfall?');assert.match(await heading(),/North America/);
 await p.locator('#finance-prompts button').nth(2).click();assert.equal(await p.locator('.finance-trend').count(),1);assert.equal(await p.locator('#finance-table-rows tr').count(),90);
 await p.locator('#finance-open-source').click();assert.equal(await p.locator('#finance-source-details').getAttribute('open'),'');
 const csvWait=p.waitForEvent('download');await p.locator('#finance-export-data').click();const csv=fs.readFileSync(await(await csvWait).path(),'utf8');assert.equal(csv.trim().split('\r\n').length,92);assert.match(csv,/Fictional finance demo/);
 await p.locator('#finance-reset').click();await question('Compare operating profit to last month.');assert.match(await heading(),/\$207k/);assert.equal(await p.locator('#finance-table-rows tr').count(),30);
 await question('How much did we spend on technology in Europe in August?');assert.match(await heading(),/\$88k/);
 await question('Forecast next month');assert.equal(await p.locator('.finance-limitation').count(),1);assert.equal(await p.locator('#finance-export-data').isDisabled(),true);assert.equal(await p.locator('#finance-table-rows tr').count(),0);
 await question('<img src=x onerror=alert(1)>');assert.equal(await p.locator('#finance-history img').count(),0);
 await p.locator('#finance-reset').click();await p.locator('.language-toggle').click();assert.equal(await p.locator('html').getAttribute('lang'),'de');assert.match(await heading(),/219k unter Plan/);
 await question('Zeige die Quelldaten.');assert.match(await heading(),/Daten hinter der Antwort/);
 await question('Wie hoch ist der Umsatz in Q3?');assert.equal(await p.locator('#finance-period').inputValue(),'q3');
 await p.locator('#finance-reset').click();
 for(const width of [1440,1024,768,550,375,320]){
  await p.setViewportSize({width,height:1000});
  for(const lang of ['en','de']){
   if(await p.locator('html').getAttribute('lang')!==lang)await p.locator('.language-toggle').click();
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width} ${lang} overflow`);
   assert.equal(await p.locator('.language-toggle img').getAttribute('src'),lang==='en'?'logos/flag-de-at.svg':'logos/flag-us-uk.svg');
   await p.locator('#finance-prompts button').nth(2).click();assert.equal(await p.locator('.finance-trend').count(),1);
   if((width===1440||width===375)&&lang==='en'){await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:path.join(output,`finance-${width}.png`),fullPage:true});}
   await p.locator('#finance-reset').click();
   console.log('Layout PASS',width,lang);
  }
 }
 await p.emulateMedia({reducedMotion:'reduce'});await question('Show revenue in 2027');assert.equal(await p.locator('.finance-limitation').count(),1);
 await p.reload();assert.equal(await p.locator('html').getAttribute('lang'),'en');assert.equal(await p.locator('#finance-history button').count(),1);
 const textWait=p.waitForEvent('download');await p.locator('#finance-export-answer').click();const answer=fs.readFileSync(await(await textWait).path(),'utf8');assert.match(answer,/FICTIONAL DATA/);assert.match(answer,/\$219k/);
 await p.goto(base+'index.html');assert.equal(await p.locator('a[href="finance-demo.html"]').count(),1);
 await p.goto(base+'work.html');assert.equal(await p.locator('a[href="finance-demo.html"]').count(),3);
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: answers, follow-ups, account query, all charts, source rows, exports, unknown scope, safe input, DE/EN, responsive layouts, combined flag and portfolio links.');
})().catch(e=>{console.error(e);process.exit(1)});
