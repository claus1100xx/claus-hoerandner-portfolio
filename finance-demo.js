(() => {
  'use strict';
  const E=window.FinanceDemo,$=id=>document.getElementById(id);
  const de=()=>document.documentElement.lang==='de',t=(en,german)=>de()?german:en;
  const label=pair=>pair[de()?1:0];
  const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  const nf=(n,digits=0)=>new Intl.NumberFormat(de()?'de-DE':'en-US',{maximumFractionDigits:digits,minimumFractionDigits:0}).format(n);
  const money=(n,compact=true)=>{const a=Math.abs(n),scale=compact?(a>=1e6?1e6:a>=1000?1000:1):1;return (n<0?'−$':'$')+nf(a/scale,scale===1?0:scale===1e6?3:2)+(scale===1e6?'M':scale===1000?'k':'');};
  const signedMoney=n=>(n>0?'+':'')+money(n);
  const percent=n=>n===null?'—':nf(n,1)+'%';
  const metricValue=(n,metric)=>metric==='margin'?percent(n):money(n);
  const signedMetric=(n,metric)=>metric==='margin'?(n>0?'+':'')+nf(n,1)+' '+t('pp','Prozentpunkte'):signedMoney(n);
  function periodName(period,short=false){
    if(period==='all')return t('Apr–Sep 2026','Apr.–Sept. 2026');
    if(period==='q2'||period==='q3')return period.toUpperCase()+' 2026';
    return new Intl.DateTimeFormat(de()?'de-DE':'en-US',{month:short?'short':'long',year:'numeric',timeZone:'UTC'}).format(new Date(period+'-01T12:00:00Z'));
  }
  const scopeName=s=>[s.comparisonPeriod, s.period].filter(Boolean).map(period=>periodName(period,true)).join(' → ')+' · '+label(E.regions[s.region]);
  const prompts=[
    ['Why is operating profit below budget?','Warum liegt das Betriebsergebnis unter Plan?'],
    ['Which region has the largest profit shortfall?','Welche Region hat die größte Ergebnisabweichung?'],
    ['Show the operating profit trend.','Zeige den Verlauf des Betriebsergebnisses.'],
    ['Break down operating expenses.','Schlüssele den betrieblichen Aufwand auf.'],
    ['What changed in operating profit from Q2 to Q3?','Wie hat sich das Betriebsergebnis von Q2 auf Q3 verändert?']
  ];
  const europePrompt = ['What about Europe?', 'Und wie sieht es in Europa aus?'];
  const sourcePrompt = ['Show the source rows.', 'Zeige die Quelldaten.'];
  const guidePrompts = [prompts[0], europePrompt, sourcePrompt];
  const guideButtons = [...document.querySelectorAll('[data-guide-step]')];
  let context={...E.defaults},history=[],active=0,nextId=1;
  let guideStep = -1;
  function populateScope(){
    const currentPeriod=context.period,currentRegion=context.region;
    $('finance-period').replaceChildren(...[...E.data.periods,'q2','q3','all'].map(period=>{const option=el('option',periodName(period));option.value=period;return option;}));
    $('finance-region').replaceChildren(...Object.keys(E.regions).map(region=>{const option=el('option',label(E.regions[region]));option.value=region;return option;}));
    $('finance-period').value=currentPeriod;$('finance-region').value=currentRegion;
  }
  function errorMessage(reason){
    const messages={
      region:['The sample contains North America, Europe, and Asia Pacific. It has no country-level breakdown. Choose one of the three regions.','Die Beispieldaten enthalten Nordamerika, Europa und Asien-Pazifik. Eine Länderaufteilung ist nicht vorhanden. Wählen Sie eine der drei Regionen.'],
      period:['The sample covers April–September 2026, Q2, and Q3. Choose a period in that range. It does not contain a full year-to-date view.','Die Beispieldaten umfassen April–September 2026 sowie Q2 und Q3. Wählen Sie einen Zeitraum daraus. Eine vollständige Jahressicht ist nicht enthalten.'],
      coverage:['This ledger covers revenue, claims cost, compensation, technology, and other operating expenses. It does not contain forecasts, balance sheets, cash flows, or transaction-level detail. Try a performance or budget question.','Dieses Ledger enthält Umsatz, Schadenaufwand, Personal, Technologie und sonstigen Betriebsaufwand. Prognosen, Bilanzen, Cashflows und Einzeltransaktionen sind nicht enthalten. Versuchen Sie eine Frage zu Ergebnis oder Planabweichungen.'],
      currency:['All sample amounts are in USD. No exchange-rate data is available, so I cannot convert this answer into another currency.','Alle Beispielbeträge sind in USD. Wechselkurse sind nicht verfügbar; eine Umrechnung ist daher nicht möglich.'],
      'one-period':['Choose one period, or ask for a comparison of two periods. Try “Compare August and September” or “What changed from Q2 to Q3?”','Wählen Sie einen Zeitraum oder bitten Sie um einen Vergleich von zwei Zeiträumen. Versuchen Sie „Vergleiche August und September“ oder „Was hat sich von Q2 auf Q3 verändert?“'],
      'period-grain':['Compare two months or two quarters so the periods cover the same length of time.','Vergleichen Sie zwei Monate oder zwei Quartale, damit beide Zeiträume gleich lang sind.'],
      'one-region':['Choose a single region, or ask “Compare operating profit by region” to see all three side by side.','Wählen Sie eine Region oder fragen Sie „Vergleiche das Betriebsergebnis nach Regionen“, um alle drei zu sehen.'],
      previous:['A previous-month comparison needs a selected month from May through September 2026. Choose one of those months first.','Ein Vormonatsvergleich benötigt einen ausgewählten Monat von Mai bis September 2026. Wählen Sie zuerst einen dieser Monate.'],
      unsupported:['I can help with performance, budget variances, regions, monthly trends, and the underlying rows in this fictional ledger. Try one of the suggested questions, or name a metric such as revenue or operating profit.','Ich kann Ergebnis, Planabweichungen, Regionen, Monatsverläufe und Quelldaten dieses fiktiven Ledgers zeigen. Versuchen Sie eine vorgeschlagene Frage oder nennen Sie eine Kennzahl wie Umsatz oder Betriebsergebnis.']
    };
    return label(messages[reason]||messages.unsupported);
  }
  function reveal(element, focusTarget = element) {
    focusTarget.focus({preventScroll:true});
    element.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  }
  function openSource() {
    const details = $('finance-source-details');
    details.open = true;
    reveal(details, details.querySelector('summary'));
  }
  function ask(question,pair,step = -1){
    const clean=question.trim();if(!clean)return;
    const parsed=E.parse(clean,context);
    const scope = parsed.ok ? parsed.scope : context;
    const previous = history[active];
    const previousScope = previous?.sourceScope || previous?.scope;
    // Keep the evidence for the answer being inspected when its filters still match.
    const sourceScope = parsed.inheritEvidence && previous?.parsed.ok ? previousScope : null;
    if(parsed.ok)context={...(sourceScope || scope)};
    guideStep = parsed.ok ? step : -1;
    history.push({id:nextId++,question:clean,pair:pair||null,parsed,scope:{...scope},sourceScope,guideStep});
    if(history.length>12)history.shift();active=history.length-1;
    $('finance-question').value='';populateScope();render();
    $('finance-announcement').textContent=parsed.ok?t('Answer and supporting data updated.','Antwort und Datengrundlage aktualisiert.'):t('This question is outside the sample scope. Suggestions are available.','Diese Frage liegt außerhalb des Beispieldatensatzes. Vorschläge sind verfügbar.');
    if (parsed.ok && scope.intent === 'source') openSource();
    else if (!$('finance-app').hidden && (step >= 0 || matchMedia('(max-width:900px)').matches)) reveal(document.querySelector('.finance-answer'));
  }
  function renderGuide() {
    for (const [index, button] of guideButtons.entries()) {
      button.disabled = index > guideStep + 1;
      if (index === guideStep) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    }
    $('finance-guide-action').hidden = guideStep < 0 || guideStep >= guidePrompts.length - 1;
    $('finance-guide-next').textContent = guideStep === 0
      ? t('Next, ask about Europe', 'Weiter mit Europa')
      : t('Next, inspect the source rows', 'Weiter zu den Quelldaten');
  }
  function runGuide(index) {
    if (!guidePrompts[index] || index > guideStep + 1) return;
    if (index === 0) {
      context = {...E.defaults};
      $('finance-source-details').open = false;
    }
    const prompt = guidePrompts[index];
    ask(label(prompt), prompt, index);
  }
  function svg(name,attrs={},text){const n=document.createElementNS('http://www.w3.org/2000/svg',name);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;}
  function addMetrics(container,result){
    const strip=el('dl',undefined,'finance-metric-strip');
    const baseline = result.previous?.actual || result.budget;
    const comparisonLabel = result.previous ? t('vs ', 'ggü. ') + periodName(result.scope.comparisonPeriod, true) : t('vs budget','ggü. Plan');
    for(const metric of ['revenue','expenses','profit']){
      const item=el('div'),value=result.actual[metric],delta=value-baseline[metric],dd=el('dd',money(value));
      dd.append(el('span',signedMoney(delta)+' '+comparisonLabel));item.append(el('dt',label(E.metrics[metric])),dd);strip.append(item);
    }
    container.append(strip);
  }
  function chartTitle(container,title,unit=t('USD','USD')){const head=el('div',undefined,'finance-chart-heading');head.append(el('h3',title),el('span',unit,'finance-chart-unit'));container.append(head);}
  function legend(container,first=t('Actual','Ist'),second=t('Budget','Plan'),negative=false){
    const row=el('div',undefined,'finance-variance-legend');
    for(const [name,cls]of [[first,''],[second,negative?'negative':'budget']]){const item=el('span');item.append(el('i',undefined,'finance-swatch '+cls),el('span',name));row.append(item);}container.append(row);
  }
  function driverChart(container,contributions,periodComparison=false){
    chartTitle(container,periodComparison?t('What changed operating profit','Beiträge zur Veränderung des Betriebsergebnisses'):t('Contributions to the operating profit variance','Beiträge zur Planabweichung des Betriebsergebnisses'));
    legend(container,periodComparison?t('Profit increase','Ergebnisanstieg'):t('Favorable','Günstig'),periodComparison?t('Profit decrease','Ergebnisrückgang'):t('Unfavorable','Ungünstig'),true);
    const list=el('div',undefined,'finance-driver-list'),max=Math.max(...contributions.map(d=>Math.abs(d.value)),1);
    for(const d of contributions){
      const row=el('div',undefined,'finance-driver-row'),track=el('div',undefined,'finance-driver-track');track.setAttribute('aria-hidden','true');
      for(const side of [-1,1]){const half=el('div',undefined,'finance-driver-half');if(d.value*side>0){const bar=el('span');bar.style.width=Math.abs(d.value)/max*100+'%';half.append(bar);}track.append(half);}
      row.append(el('span',label(E.accounts[d.account])),track,el('span',signedMoney(d.value),'finance-driver-value'));list.append(row);
    }
    const note = periodComparison
      ? t('Each bar shows how the change in actual revenue or expenses contributed to the change in operating profit. The bars add up to the difference between the two periods.','Jeder Balken zeigt den Beitrag der veränderten Ist-Umsätze oder Ist-Aufwendungen zum Betriebsergebnis. Zusammen ergeben die Beiträge die Differenz zwischen den beiden Zeiträumen.')
      : t('Revenue increases and cost reductions improve profit. Contributions reconcile to the profit variance. This explains the arithmetic, not the underlying business causes.','Höherer Umsatz und geringere Kosten verbessern das Ergebnis. Die Beiträge ergeben zusammen die Ergebnisabweichung. Dies erklärt die Rechnung, nicht die betrieblichen Ursachen.');
    container.append(list,el('p',note,'finance-chart-note'));
  }
  function comparisonChart(container,items,metric,title){
    chartTitle(container,title,metric==='margin'?'%':'USD');legend(container);
    const max=Math.max(...items.flatMap(i=>[Math.abs(i.actual),Math.abs(i.budget)]),1),list=el('div',undefined,'finance-comparison-list');
    for(const item of items){
      const row=el('div'),heading=el('div',undefined,'finance-comparison-heading');heading.append(el('span',item.name),el('span',metricValue(item.actual,metric)+' / '+metricValue(item.budget,metric)));
      const tracks=el('div',undefined,'finance-comparison-tracks');
      for(const key of ['actual','budget']){const track=el('div',undefined,'finance-comparison-track '+(key==='budget'?'budget':'')),bar=el('span');bar.style.width=Math.abs(item[key])/max*100+'%';track.setAttribute('aria-hidden','true');track.append(bar);tracks.append(track);}
      row.append(heading,tracks);list.append(row);
    }
    container.append(list);
  }
  function trendChart(container,result,metric){
    chartTitle(container,t('Monthly '+label(E.metrics[metric]).toLowerCase(),'Monatliche Entwicklung: '+label(E.metrics[metric])),metric==='margin'?'%':t('USD thousands','Tausend USD'));legend(container);
    const compact=matchMedia('(max-width:550px)').matches,w=compact?320:650,h=240,left=42,right=12,bottom=38,top=15;
    const values=result.trend.flatMap(r=>[r.actual[metric],r.budget[metric]]),max=Math.max(...values,1)*1.12;
    const x=i=>left+(i+.5)*(w-left-right)/6,y=v=>h-bottom-v/max*(h-top-bottom);
    const graphic=svg('svg',{viewBox:`0 0 ${w} ${h}`,role:'img','aria-labelledby':'finance-trend-title finance-trend-description',class:'finance-trend'});
    graphic.append(svg('title',{id:'finance-trend-title'},t('Actual and budget by month','Ist und Plan nach Monat')));
    graphic.append(svg('desc',{id:'finance-trend-description'},result.trend.map(r=>periodName(r.period)+': '+metricValue(r.actual[metric],metric)+' '+t('actual,','Ist,')+' '+metricValue(r.budget[metric],metric)+' '+t('budget.','Plan.')).join(' ')));
    for(let n=0;n<=4;n++){const value=max*n/4;graphic.append(svg('line',{x1:left,x2:w-right,y1:y(value),y2:y(value),stroke:'#e4ecef'}),svg('text',{x:left-7,y:y(value)+4,'text-anchor':'end'},nf(metric==='margin'?value:value/1000,0)));}
    result.trend.forEach((r,i)=>{
      const barWidth=compact?12:23;
      graphic.append(svg('rect',{x:x(i)-barWidth-1,y:y(r.actual[metric]),width:barWidth,height:y(0)-y(r.actual[metric]),fill:'#226f63',rx:1}),svg('rect',{x:x(i)+1,y:y(r.budget[metric]),width:barWidth,height:y(0)-y(r.budget[metric]),fill:'#b9cbd2',rx:1}));
      graphic.append(svg('text',{x:x(i),y:h-14,'text-anchor':'middle'},new Intl.DateTimeFormat(de()?'de-DE':'en-US',{month:'short',timeZone:'UTC'}).format(new Date(r.period+'-01T12:00:00Z'))));
    });
    container.append(graphic,el('p',t('Trend covers all six available sample months for the selected region. The summary above remains scoped to the selected period.','Der Verlauf zeigt alle sechs verfügbaren Beispielmonate der gewählten Region. Die Zusammenfassung oben bezieht sich weiterhin auf den gewählten Zeitraum.'),'finance-chart-note'));
  }
  function summaryTable(container,result){
    const table=el('table',undefined,'finance-summary-table'),head=el('thead'),tr=el('tr');
    const baseline = result.previous?.actual || result.budget;
    const columns = result.previous
      ? [periodName(result.scope.period,true),periodName(result.scope.comparisonPeriod,true),t('Change','Veränderung')]
      : [t('Actual','Ist'),t('Budget','Plan'),t('Actual − budget','Ist − Plan')];
    for(const name of [t('Metric','Kennzahl'),...columns]){const th=el('th',name);th.scope='col';tr.append(th);}head.append(tr);const body=el('tbody');
    for(const key of ['revenue','expenses','profit','margin']){const row=el('tr',undefined,key==='profit'?'finance-total':key==='margin'?'finance-margin':'');row.append(el('td',label(E.metrics[key])),el('td',metricValue(result.actual[key],key)),el('td',metricValue(baseline[key],key)),el('td',signedMetric(result.actual[key]-baseline[key],key)));body.append(row);}
    table.append(head,body);container.append(table);
  }
  function renderAnswer(entry){
    const container=$('finance-answer-body');container.replaceChildren();
    $('finance-answer-scope').textContent=scopeName(entry.sourceScope || entry.scope);
    $('finance-export-answer').disabled=!entry.parsed.ok;$('finance-open-source').hidden=!entry.parsed.ok;
    if(!entry.parsed.ok){container.append(el('h2',t('Let’s stay with what the data can answer.','Bleiben wir bei dem, was die Daten beantworten können.')));container.firstElementChild.id='finance-answer-heading';container.append(el('p',errorMessage(entry.parsed.reason),'finance-limitation'));return;}
    const s=entry.scope,r=E.analyze(s),metric=s.metric,delta=r.actual[metric]-r.budget[metric];
    let heading,prose;
    if(s.intent==='variance' && metric==='profit'){
      heading=t(`Operating profit is ${money(Math.abs(delta))} ${delta<0?'below':'above'} budget.`,`Das Betriebsergebnis liegt ${money(Math.abs(delta))} ${delta<0?'unter':'über'} Plan.`);
      const ordered=[...r.contributions].sort((a,b)=>a.value-b.value),driver=ordered[0];
      prose=t(`Revenue of ${money(r.actual.revenue)} less operating expenses of ${money(r.actual.expenses)} leaves ${money(r.actual.profit)} in operating profit. ${label(E.accounts[driver.account])} has the largest unfavorable contribution at ${money(Math.abs(driver.value))}.`,`Umsatz von ${money(r.actual.revenue)} abzüglich betrieblichem Aufwand von ${money(r.actual.expenses)} ergibt ${money(r.actual.profit)} Betriebsergebnis. ${label(E.accounts[driver.account])} leistet mit ${money(Math.abs(driver.value))} den größten ungünstigen Beitrag.`);
    }else if(s.intent==='regions'){
      const sorted=[...r.regional].sort((a,b)=>(a.actual[metric]-a.budget[metric])-(b.actual[metric]-b.budget[metric]));
      const costMetric=['expenses','claims','people','technology','other'].includes(metric);
      const worst=costMetric?sorted.at(-1):sorted[0],gap=worst.actual[metric]-worst.budget[metric];
      heading=t(`${label(E.regions[worst.region])} has the largest ${costMetric?'cost overrun':'unfavorable variance'}.`,`${label(E.regions[worst.region])} hat die größte ${costMetric?'Kostenüberschreitung':'ungünstige Abweichung'}.`);
      prose=t(`${label(E.metrics[metric])} is ${metricValue(worst.actual[metric],metric)} against ${metricValue(worst.budget[metric],metric)} budget: ${signedMetric(gap,metric)}. The comparison below covers all three regions for ${periodName(s.period)}.`,`${label(E.metrics[metric])}: ${metricValue(worst.actual[metric],metric)} gegenüber ${metricValue(worst.budget[metric],metric)} Plan, eine Abweichung von ${signedMetric(gap,metric)}. Der Vergleich zeigt alle drei Regionen für ${periodName(s.period)}.`);
    }else if(s.intent==='trend'){
      const first=r.trend[0].actual[metric],last=r.trend.at(-1).actual[metric];
      heading=t(`Follow the ${label(E.metrics[metric]).toLowerCase()} trend.`,`Die Entwicklung im Blick: ${label(E.metrics[metric])}.`);
      prose=t(`For ${label(E.regions[s.region])}, ${label(E.metrics[metric]).toLowerCase()} moves from ${metricValue(first,metric)} in April to ${metricValue(last,metric)} in September. Each month is shown against its own budget.`,`Für ${label(E.regions[s.region])} verändert sich ${label(E.metrics[metric])} von ${metricValue(first,metric)} im April auf ${metricValue(last,metric)} im September. Jeder Monat wird seinem eigenen Plan gegenübergestellt.`);
    }else if(s.intent==='costs'){
      const costDelta=r.actual.expenses-r.budget.expenses,ordered=Object.keys(E.accounts).filter(k=>k!=='revenue').sort((a,b)=>(r.actual[b]-r.budget[b])-(r.actual[a]-r.budget[a])),driver=ordered[0];
      heading=t(`Operating expenses are ${money(Math.abs(costDelta))} ${costDelta>=0?'above':'below'} budget.`,`Der betriebliche Aufwand liegt ${money(Math.abs(costDelta))} ${costDelta>=0?'über':'unter'} Plan.`);
      prose=t(`Actual expenses total ${money(r.actual.expenses)} versus ${money(r.budget.expenses)} budget. ${label(E.accounts[driver])} has the largest cost variance at ${signedMoney(r.actual[driver]-r.budget[driver])}.`,`Der Ist-Aufwand beträgt ${money(r.actual.expenses)} gegenüber ${money(r.budget.expenses)} Plan. ${label(E.accounts[driver])} zeigt mit ${signedMoney(r.actual[driver]-r.budget[driver])} die größte Kostenabweichung.`);
    }else if(s.intent==='comparison'){
      const prior=r.previous.actual[metric],change=r.actual[metric]-prior;
      const earlier = periodName(s.comparisonPeriod), later = periodName(s.period);
      const amount = metric === 'margin' ? nf(Math.abs(change),1) + t(' pp',' Prozentpunkte') : money(Math.abs(change));
      const name = label(E.metrics[metric]);
      heading = change === 0
        ? t(`${name} held steady.`, `${name} blieb unverändert.`)
        : t(`${name} ${change < 0 ? 'fell' : 'rose'} by ${amount}.`, `${name} ist um ${amount} ${change < 0 ? 'gesunken' : 'gestiegen'}.`);
      prose = t(`Actuals went from ${metricValue(prior,metric)} in ${earlier} to ${metricValue(r.actual[metric],metric)} in ${later}. Both periods use the same region selection.`, `Die Ist-Werte lagen bei ${metricValue(prior,metric)} in ${earlier} und bei ${metricValue(r.actual[metric],metric)} in ${later}. Für beide Zeiträume gilt dieselbe Regionsauswahl.`);
    }else if(s.intent==='source'){
      heading=t('Here are the numbers behind the answer.','Hier sind die Daten hinter der Antwort.');
      const count = sourceRows(entry).length;
      prose=t(`${count} fictional ledger rows support this answer. The source section below shows row IDs, accounts, actuals, and budgets, with a CSV download.`,`${count} fiktive Ledger-Zeilen bilden die Grundlage der Antwort. Im Quellenbereich finden Sie Zeilen-IDs, Konten, Ist- und Planwerte sowie den CSV-Download.`);
    }else{
      heading=t(`${label(E.metrics[metric])} is ${metricValue(r.actual[metric],metric)}.`,`${label(E.metrics[metric])}: ${metricValue(r.actual[metric],metric)}.`);
      prose=t(`Against ${metricValue(r.budget[metric],metric)} budget, that is ${signedMetric(delta,metric)}. Operating margin is ${percent(r.actual.margin)}, compared with ${percent(r.budget.margin)} in the plan.`,`Gegenüber ${metricValue(r.budget[metric],metric)} Plan ergibt sich ${signedMetric(delta,metric)}. Die operative Marge beträgt ${percent(r.actual.margin)} gegenüber ${percent(r.budget.margin)} im Plan.`);
    }
    const h=el('h2',heading);h.id='finance-answer-heading';container.append(h,el('p',prose,'finance-answer-prose'));
    if (entry.guideStep === 1) container.append(el('p', t(`The follow-up keeps ${periodName(s.period)} and narrows the answer to Europe.`, `Die Folgefrage behält ${periodName(s.period)} bei und grenzt die Antwort auf Europa ein.`), 'finance-chart-note'));
    if (s.intent === 'source') return;
    addMetrics(container,r);
    if(s.intent==='trend')trendChart(container,r,metric);
    else if(s.intent==='comparison'){
      if (metric === 'profit') driverChart(container, r.changeContributions, true);
      else comparisonChart(container, [
        {name:periodName(s.comparisonPeriod),actual:r.previous.actual[metric],budget:r.previous.budget[metric]},
        {name:periodName(s.period),actual:r.actual[metric],budget:r.budget[metric]}
      ], metric, t('Actual and budget by period','Ist und Plan nach Zeitraum'));
    }else if(s.intent==='costs')comparisonChart(container,Object.keys(E.accounts).filter(k=>k!=='revenue').map(k=>({name:label(E.accounts[k]),actual:r.actual[k],budget:r.budget[k]})),'expenses',t('Expense categories: actual / budget','Aufwandsarten: Ist / Plan'));
    else if(s.intent==='regions'||metric==='revenue'||metric==='margin')comparisonChart(container,r.regional.map(region=>({name:label(E.regions[region.region]),actual:region.actual[metric],budget:region.budget[metric]})),metric,t('Regional comparison: actual / budget','Regionenvergleich: Ist / Plan'));
    else if(E.accounts[metric])comparisonChart(container,[{name:label(E.metrics[metric]),actual:r.actual[metric],budget:r.budget[metric]}],metric,t('Actual / budget','Ist / Plan'));
    else driverChart(container,r.contributions);
    summaryTable(container,r);
  }
  function sourceRows(entry){
    if(!entry.parsed.ok)return [];
    const s=entry.sourceScope || entry.scope;
    if(s.intent==='trend')return E.rowsFor({...s,period:'all'});
    if(s.comparisonPeriod)return [...E.rowsFor({...s,period:s.comparisonPeriod}),...E.rowsFor(s)];
    if(s.intent==='regions'||(s.intent!=='source'&&(s.metric==='revenue'||s.metric==='margin')))return E.rowsFor({...s,region:'all'});
    return E.rowsFor(s);
  }
  function renderSource(entry){
    const rows=sourceRows(entry),enabled=entry.parsed.ok;
    const sourceScope = entry.sourceScope || entry.scope;
    $('finance-export-data').disabled=!enabled;
    $('finance-source-scope').textContent=enabled?t(`${rows.length} fictional source rows · USD · Ledger v1. Includes rows needed for the displayed chart.`,`${rows.length} fiktive Quellzeilen · USD · Ledger v1. Enthält die für das Diagramm benötigten Zeilen.`):t('No data was queried for the unsupported question.','Für die nicht unterstützte Frage wurden keine Daten abgefragt.');
    const basis = sourceScope.comparisonPeriod
      ? t('Period change uses later actuals minus earlier actuals. Profit contributions reverse the sign for expenses.', 'Die Periodenveränderung entspricht dem späteren Ist-Wert minus dem früheren Ist-Wert. Beim Ergebnisbeitrag wird das Vorzeichen für Aufwendungen umgekehrt.')
      : t('Budget variance uses actual minus budget. Profit contributions reverse the sign for expenses.', 'Die Planabweichung entspricht Ist minus Plan. Beim Ergebnisbeitrag wird das Vorzeichen für Aufwendungen umgekehrt.');
    $('finance-method').textContent=enabled?t(`Answer scope is ${scopeName(sourceScope)}. Operating profit = revenue − expenses. Operating margin = operating profit ÷ revenue × 100. ${basis} k = 1,000 and M = 1,000,000. The totals below sum the displayed ledger rows.`,`Die Antwort bezieht sich auf ${scopeName(sourceScope)}. Betriebsergebnis = Umsatz − Aufwand. Operative Marge = Betriebsergebnis ÷ Umsatz × 100. ${basis} k = 1.000 und M = 1.000.000. Die Summen unten addieren die angezeigten Ledger-Zeilen.`):'';
    if (entry.guideStep === 2) {
      const {actual, budget} = E.totals(sourceScope);
      const check = t(`The Europe answer uses ${money(actual.revenue)} of actual revenue minus ${money(actual.expenses)} of actual expenses to get ${money(actual.profit)} of operating profit, compared with a budget of ${money(budget.profit)}.`, `Für Europa ergeben ${money(actual.revenue)} Ist-Umsatz abzüglich ${money(actual.expenses)} Ist-Aufwand ein Betriebsergebnis von ${money(actual.profit)} gegenüber ${money(budget.profit)} im Plan.`);
      $('finance-method').prepend(el('p', check));
    }
    const row=el('tr');for(const name of ['ID',t('Period','Zeitraum'),t('Region','Region'),t('Account','Konto'),t('Actual USD','Ist USD'),t('Budget USD','Plan USD')]){const th=el('th',name);th.scope='col';row.append(th);}$('finance-table-head').replaceChildren(row);
    $('finance-table-caption').textContent=t('Fictional sample ledger. Positive cost amounts represent expenses.','Fiktives Beispiel-Ledger. Positive Kostenbeträge stellen Aufwand dar.');
    $('finance-table-rows').replaceChildren(...rows.map(r=>{const tr=el('tr');for(const value of [r.id,periodName(r.period,true),label(E.regions[r.region]),label(E.accounts[r.account]),money(r.actual,false),money(r.budget,false)])tr.append(el('td',value));return tr;}));
    const foot=el('tr'),th=el('th',t('Sum of displayed ledger rows','Summe der angezeigten Ledger-Zeilen'));th.colSpan=4;foot.append(th,el('td',money(rows.reduce((n,r)=>n+r.actual,0),false)),el('td',money(rows.reduce((n,r)=>n+r.budget,0),false)));$('finance-table-foot').replaceChildren(...(enabled?[foot]:[]));
    document.querySelector('.finance-source-table').setAttribute('aria-label',t('Fictional ledger source rows','Fiktive Ledger-Quelldaten'));
  }
  function followups(entry){
    const pairs=entry.parsed.ok?[
      ['regions','comparison'].includes(entry.scope.intent)?europePrompt:prompts[1],
      entry.scope.intent==='trend'?['Compare operating profit to last month.','Vergleiche das Betriebsergebnis mit dem Vormonat.']:prompts[2],
      sourcePrompt
    ]:prompts.slice(0,3);
    $('finance-followups').replaceChildren(...pairs.map(pair=>{const b=el('button',label(pair));b.type='button';b.addEventListener('click',()=>ask(label(pair),pair));return b;}));
  }
  function render(){
    const entry=history[active];
    $('finance-question').placeholder=t('Why is operating profit below budget?','Warum liegt das Betriebsergebnis unter Plan?');
    $('finance-prompts').replaceChildren(...prompts.map(pair=>{const b=el('button',label(pair),'finance-prompt');b.type='button';b.addEventListener('click',()=>ask(label(pair),pair));return b;}));
    $('finance-history-count').textContent=history.length;
    $('finance-history').replaceChildren(...history.map((item,index)=>{const b=el('button',undefined,'finance-history-item');b.type='button';b.setAttribute('aria-pressed',String(index===active));b.append(el('span',scopeName(item.sourceScope || item.scope)),el('strong',item.pair?label(item.pair):item.question));b.addEventListener('click',()=>{active=index;context={...(item.sourceScope || item.scope)};guideStep=item.guideStep;populateScope();render();});return b;}).reverse());
    renderAnswer(entry);renderSource(entry);followups(entry);renderGuide();
    document.querySelector('.finance-dataset').setAttribute('aria-label',t('Demo dataset and scope','Beispieldaten und Auswahl'));
  }
  function download(content,filename,type){const url=URL.createObjectURL(new Blob([content],{type})),a=el('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
  $('finance-form').addEventListener('submit',event=>{event.preventDefault();ask($('finance-question').value);});
  $('finance-question').addEventListener('keydown',event=>{if(event.key==='Enter' && !event.shiftKey && !event.isComposing){event.preventDefault();if($('finance-question').value.trim())$('finance-form').requestSubmit();}});
  for(const [id,key]of [['finance-period','period'],['finance-region','region']])$(id).addEventListener('change',()=>{context[key]=$(id).value;ask(t('Show the performance overview.','Zeige den Ergebnisüberblick.'),['Show the performance overview.','Zeige den Ergebnisüberblick.']);});
  $('finance-reset').addEventListener('click',()=>{history=[];active=0;nextId=1;runGuide(0);});
  $('finance-open-source').addEventListener('click',openSource);
  guideButtons.forEach((button,index)=>button.addEventListener('click',()=>runGuide(index)));
  $('finance-guide-next').addEventListener('click',()=>runGuide(guideStep+1));
  $('finance-export-data').addEventListener('click',()=>{
    const entry=history[active];if(!entry.parsed.ok)return;
    const rows=[['Fictional finance demo; USD; positive cost amounts are expenses'],['ID','Period','Region','Account','Actual USD','Budget USD'],...sourceRows(entry).map(r=>[r.id,r.period,label(E.regions[r.region]),label(E.accounts[r.account]),r.actual,r.budget])];
    const cell=value=>'"'+String(value).replace(/"/g,'""')+'"';download('\ufeff'+rows.map(row=>row.map(cell).join(',')).join('\r\n'),'Fictional_Finance_Source.csv','text/csv;charset=utf-8');
    $('finance-announcement').textContent=t('Fictional source data downloaded.','Fiktive Quelldaten heruntergeladen.');
  });
  $('finance-export-answer').addEventListener('click',()=>{const entry=history[active];if(!entry.parsed.ok)return;download(t('FICTIONAL DATA — AGENT SIMULATION','FIKTIVE DATEN — AGENTEN-SIMULATION')+'\n'+scopeName(entry.sourceScope || entry.scope)+'\n\n'+(entry.pair?label(entry.pair):entry.question)+'\n\n'+$('finance-answer-body').innerText+'\n\n'+$('finance-method').innerText,'Finance_Demo_Answer.txt','text/plain;charset=utf-8');});
  document.addEventListener('languagechange',()=>{populateScope();render();});
  matchMedia('(max-width:550px)').addEventListener('change',()=>render());
  runGuide(0);$('finance-app').hidden=false;
})();
