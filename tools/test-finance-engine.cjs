// Run: node tools/test-finance-engine.cjs
// Browser QA: tools/test-finance-browser.cjs accepts a base URL; needs Playwright and Edge.
const assert=require('node:assert/strict');
const E=require('../finance-demo-engine.js');
assert.equal(E.data.rows.length,90);assert.equal(new Set(E.data.rows.map(r=>r.id)).size,90);
for(const row of E.data.rows){assert.ok(Number.isSafeInteger(row.actual));assert.ok(row.actual>=0);assert.ok(row.budget>=0);}
const baseline=E.analyze(E.defaults);
assert.equal(baseline.actual.revenue,2820000);assert.equal(baseline.budget.revenue,2880000);
assert.equal(baseline.actual.expenses,2499000);assert.equal(baseline.budget.expenses,2340000);
assert.equal(baseline.actual.profit,321000);assert.equal(baseline.budget.profit,540000);
assert.equal(baseline.contributions.reduce((n,d)=>n+d.value,0),-219000);
for(const period of Object.keys(E.periodSets))for(const region of Object.keys(E.regions)){
 const r=E.totals({period,region});
 assert.equal(r.contributions.reduce((n,d)=>n+d.value,0),r.actual.profit-r.budget.profit);
 for(const type of ['actual','budget']){
  assert.equal(r[type].profit,r[type].revenue-r[type].expenses);
  assert.equal(r[type].margin,r[type].profit/r[type].revenue*100);
 }
 const ids=new Set(r.rows.map(row=>row.id));assert.equal(ids.size,r.rows.length);
}
const parse=(q,ctx=E.defaults)=>{const result=E.parse(q,ctx);assert.equal(result.ok,true,q);return result.scope;};
assert.equal(parse('Why is operating profit below budget?').intent,'variance');
assert.equal(parse('Welche Region hat die größte Ergebnisabweichung?').intent,'regions');
assert.equal(parse('Show the operating profit trend.').intent,'trend');
assert.equal(parse('Schlüssele den betrieblichen Aufwand auf.').intent,'costs');
assert.equal(parse('What about Europe?').region,'eu');
assert.equal(parse('And August?',parse('What about Europe?')).region,'eu');
assert.equal(parse('And August?',parse('What about Europe?')).period,'2026-08');
assert.equal(parse('Compare operating profit to last month.').intent,'comparison');
assert.equal(parse('Vergleiche das Betriebsergebnis mit dem Vormonat.').intent,'comparison');
assert.equal(parse('Show the source rows.').intent,'source');
assert.equal(parse('Zeige die Quelldaten.').intent,'source');
assert.equal(parse('How much did we spend on technology in Europe in August?').metric,'technology');
assert.equal(parse('How much did we spend on technology in Europe in August?').region,'eu');
assert.equal(parse('How much did we spend on technology in Europe in August?').period,'2026-08');
assert.equal(parse('Show revenue for Q3.').period,'q3');
assert.equal(parse('How was revenue last month?').period,'2026-08');
assert.equal(E.analyze(parse('Compare operating profit to last month.')).previous.actual.profit,528000);
for(const q of ['Forecast next month','Show cash flow','Zeige die Bilanz','Revenue in January','Show October 2026 revenue','Show 2027 profit','Show revenue in EUR','What is the weather?','<img src=x onerror=alert(1)>','Compare August and September','Compare Q2 and Q3 revenue','What was revenue in 2026?','What was profit last year?','Net profit','What is the claims ratio?','Revenue in Austria'])assert.equal(E.parse(q).ok,false,q);
assert.equal(E.parse('Compare operating profit to last month.',{...E.defaults,period:'2026-04'}).ok,false);
assert.equal(E.parse('Compare operating profit to last month.',{...E.defaults,period:'q3'}).ok,false);
assert.equal(E.parse('q4 revenue').ok,false);
console.log('PASS: 90 fictional rows, all period/region reconciliations, USD calculations, English/German planning, contextual follow-ups, account queries and unsupported scope.');
