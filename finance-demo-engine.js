/* Deterministic query planner and arithmetic. No model, credentials, or external data. */
(function(root,factory){
  if(typeof module==='object' && module.exports)module.exports=factory(require('./finance-demo-data.js'));
  else root.FinanceDemo=factory(root.FinanceDemoData);
})(typeof window!=='undefined'?window:globalThis,function(data){
  'use strict';
  const accounts={revenue:['Revenue','Umsatz'],claims:['Claims cost','Schadenaufwand'],people:['Compensation','Personalaufwand'],technology:['Technology','Technologie'],other:['Other operating expenses','Sonstiger Betriebsaufwand']};
  const regions={all:['All regions','Alle Regionen'],na:['North America','Nordamerika'],eu:['Europe','Europa'],apac:['Asia Pacific','Asien-Pazifik']};
  const metrics={revenue:['Revenue','Umsatz'],expenses:['Operating expenses','Betrieblicher Aufwand'],profit:['Operating profit','Betriebsergebnis'],margin:['Operating margin','Operative Marge']};
  for(const account of ['claims','people','technology','other'])metrics[account]=accounts[account];
  const periodSets=Object.fromEntries(data.periods.map(p=>[p,[p]]));
  Object.assign(periodSets,{q2:data.periods.slice(0,3),q3:data.periods.slice(3),all:[...data.periods]});
  const defaults=Object.freeze({period:'2026-09',region:'all',metric:'profit',intent:'variance'});
  function rowsFor(scope){
    if(!periodSets[scope.period] || !regions[scope.region])throw new Error('Invalid demo scope');
    return data.rows.filter(row=>periodSets[scope.period].includes(row.period) && (scope.region==='all'||row.region===scope.region));
  }
  function profitContributions(actual, baseline) {
    return Object.keys(accounts).map(account => ({
      account,
      value: (actual[account] - baseline[account]) * (account === 'revenue' ? 1 : -1)
    }));
  }
  function totals(scope){
    const rows=rowsFor(scope),result={rows,actual:{},budget:{}};
    for(const scenario of ['actual','budget']){
      for(const account of Object.keys(accounts))result[scenario][account]=rows.filter(r=>r.account===account).reduce((sum,r)=>sum+r[scenario],0);
      const s=result[scenario];s.expenses=s.claims+s.people+s.technology+s.other;s.profit=s.revenue-s.expenses;s.margin=s.revenue?s.profit/s.revenue*100:null;
    }
    result.contributions=profitContributions(result.actual,result.budget);
    return result;
  }
  function normalize(text){return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');}
  function parse(question,context=defaults){
    const q=normalize(question.trim()),scope={...defaults,...context};
    delete scope.comparisonPeriod;
    const fail=reason=>({ok:false,reason});
    if(!q || q.length>400)return fail('unsupported');
    if(/\b(202[0-5]|202[7-9]|20[3-9]\d|201\d)\b|\b(january|januar|february|februar|march|marz|october|oktober|november|december|dezember|jan|feb|mar|oct|okt|nov|dec|dez|q1|q4|ytd)\b|year.to.date|jahresbeginn|last year|previous year|prior year|year.over.year|\byoy\b|vorjahr|letzten jahr/.test(q))return fail('period');
    if(/\b(forecast|predict|prognose|vorhersage|next month|nachsten monat|cash|cashflow|cash flow|liquidity|liquiditat|balance sheet|bilanz|invoice|rechnung|transaction|transaktion|customer|kunde|vendor|lieferant|headcount|mitarbeiterzahl|tax|steuer|ebitda|debt|assets|liabilities|net income|net profit|nettogewinn|nettoergebnis|loss ratio|claims ratio|combined ratio|2026-0[1-3]|2026-1[0-2])\b/.test(q))return fail('coverage');
    if(/\b(japan|china|germany|austria|united states|usa|canada|united kingdom|uk|deutschland|osterreich|france|frankreich)\b/.test(q))return fail('region');
    if(/\b(eur|euros|euro|gbp|jpy|wechselkurs|exchange rate)\b/.test(q))return fail('currency');
    const monthPatterns=[[/\b(april|apr|2026-04)\b/,'2026-04'],[/\b(may|mai|2026-05)\b/,'2026-05'],[/\b(june|juni|jun|2026-06)\b/,'2026-06'],[/\b(july|juli|jul|2026-07)\b/,'2026-07'],[/\b(august|aug|2026-08)\b/,'2026-08'],[/\b(september|sept|sep|2026-09)\b/,'2026-09']];
    const namedPeriods = monthPatterns
      .filter(([pattern]) => pattern.test(q.replace(/\bmay i\b/g, '')))
      .map(([, period]) => period);
    if (/\bq2\b|second quarter|zweite[srn]? quartal/.test(q)) namedPeriods.push('q2');
    if (/\bq3\b|third quarter|dritte[srn]? quartal/.test(q)) namedPeriods.push('q3');
    const allPeriods = /all months|all periods|six months|6 months|alle monate|sechs monate|gesamten zeitraum/.test(q);
    if (/\b2026\b/.test(q) && !namedPeriods.length && !allPeriods) return fail('period');
    const compare = /compar|versus|\bvs\b|vergleich|gegenuber|change|verander|month.over.month|\bmom\b|\bfrom\b.*\bto\b|\bvon\b.*\bauf\b/.test(q);
    if (namedPeriods.length > 1) {
      if (namedPeriods.length !== 2 || allPeriods || !compare) return fail('one-period');
      if (periodSets[namedPeriods[0]].length !== periodSets[namedPeriods[1]].length) return fail('period-grain');
      [scope.comparisonPeriod, scope.period] = namedPeriods;
    } else if (allPeriods) scope.period = 'all';
    else if (namedPeriods.length) scope.period = namedPeriods[0];
    const regionMatches=[[/north america|nordamerika|\bna\b/,'na'],[/europe|europa|\beu\b/,'eu'],[/asia|asien|apac|pacific|pazifik/,'apac']].filter(([pattern])=>pattern.test(q));
    if(regionMatches.length>1)return fail('one-region');
    if(regionMatches.length)scope.region=regionMatches[0][1];
    const allRegions = /all regions|alle regionen|company.wide|overall|gesamt/.test(q);
    if(allRegions)scope.region='all';
    let explicitMetric=false;
    for(const [pattern,metric] of [[/revenue|sales|umsatz/,'revenue'],[/expense|cost|spend|kosten|aufwand|aufwendungen/,'expenses'],[/claims|schaden/,'claims'],[/compensation|salaries|salary|payroll|personalaufwand|gehalt/,'people'],[/technology|tech\b|technologie|\bit costs\b/,'technology'],[/other operating|sonstig/,'other'],[/profit|earnings|gewinn|ergebnis/,'profit'],[/margin|marge/,'margin']])if(pattern.test(q)){scope.metric=metric;explicitMetric=true;}
    const previous=/last month|previous month|prior month|vormonat|vorigen monat|letzten monat/.test(q);
    const regional=/by region|which region|regional|across regions|regions|nach region|welche region|regionen/.test(q);
    const trend=/trend|monthly|over time|verlauf|entwicklung|monatlich/.test(q);
    const keepsComparison = context.intent === 'comparison' && context.comparisonPeriod &&
      !namedPeriods.length && !allPeriods && !previous && !/\b(?:budget|plan)\b/.test(q) &&
      /^(what about|and\b|und\b|wie sieht)|why.*chang|warum.*verander/.test(q);
    if(/source|underlying|show.*rows|data rows|quell|datenzeilen|belege|export|download/.test(q))scope.intent='source';
    else if(scope.comparisonPeriod) scope.intent='comparison';
    else if(previous && compare) {
      const index = data.periods.indexOf(scope.period);
      if (index <= 0) return fail('previous');
      scope.comparisonPeriod = data.periods[index - 1];
      scope.intent = 'comparison';
    }
    else if(keepsComparison) {
      scope.comparisonPeriod = context.comparisonPeriod;
      scope.intent = 'comparison';
    }
    else if(trend)scope.intent='trend';
    else if(regional){scope.intent='regions';if(!regionMatches.length)scope.region='all';}
    else if(/why|driver|behind|explain|variance|warum|treiber|erklare|abweichung|under budget|below budget|over budget/.test(q))scope.intent=scope.metric==='expenses'?'costs':'variance';
    else if(scope.metric==='expenses' && explicitMetric)scope.intent='costs';
    else if(explicitMetric || namedPeriods.length || allPeriods || regionMatches.length || previous || /perform|how.*doing|summary|overview|uberblick|zusammenfassung|lage|budget|plan|how are we|wie.*lauf/.test(q))scope.intent='overview';
    else return fail('unsupported');
    if(previous && !compare){
      const index=data.periods.indexOf(scope.period);if(index<=0)return fail('previous');scope.period=data.periods[index-1];
    }
    const inheritEvidence = scope.intent === 'source' && !namedPeriods.length && !allPeriods &&
      !regionMatches.length && !allRegions && !previous && !explicitMetric;
    return {ok:true,scope,inheritEvidence};
  }
  function analyze(scope){
    const result=totals(scope);
    result.scope={...scope};
    result.regional=Object.keys(regions).filter(r=>r!=='all').map(region=>({region,...totals({...scope,region})}));
    result.trend=data.periods.map(period=>({period,...totals({...scope,period})}));
    if (scope.intent === 'comparison') {
      const baseline = scope.comparisonPeriod || data.periods[data.periods.indexOf(scope.period) - 1];
      result.previous = totals({...scope, period: baseline});
      result.changeContributions = profitContributions(result.actual, result.previous.actual);
    }
    return result;
  }
  return Object.freeze({data,accounts,regions,metrics,periodSets,defaults,rowsFor,totals,parse,analyze});
});
