/* Fictional fixtures for a public portfolio demo. Amounts below are USD thousands. */
(() => {
  'use strict';
  const periods = ['2026-04','2026-05','2026-06','2026-07','2026-08','2026-09'];
  const series = {
    na: {
      revenue: [[1200,1240,1270,1300,1340,1380],[1220,1250,1290,1320,1350,1310]],
      claims: [[470,485,500,515,535,550],[475,480,510,520,545,620]],
      people: [[290,295,300,310,315,320],[292,297,301,312,318,335]],
      technology: [[110,115,120,125,130,135],[108,114,121,127,134,155]],
      other: [[85,87,89,91,93,95],[86,86,90,91,94,100]]
    },
    eu: {
      revenue: [[780,800,825,850,875,900],[790,810,830,860,880,880]],
      claims: [[300,310,320,330,340,350],[301,312,322,332,343,380]],
      people: [[225,230,235,240,245,250],[224,229,236,241,247,253]],
      technology: [[75,78,81,84,87,90],[75,77,80,85,88,100]],
      other: [[45,47,49,51,53,55],[46,47,48,51,54,57]]
    },
    apac: {
      revenue: [[500,520,540,560,580,600],[505,525,550,575,600,630]],
      claims: [[180,188,196,204,212,220],[181,188,195,201,210,215]],
      people: [[145,149,153,157,161,165],[145,150,154,158,162,168]],
      technology: [[55,58,61,64,67,70],[55,58,60,65,68,75]],
      other: [[30,32,34,36,38,40],[31,32,34,36,39,41]]
    }
  };
  const rows = [];
  for (const [region,accounts] of Object.entries(series)) for (const [account,values] of Object.entries(accounts)) {
    periods.forEach((period,index)=>rows.push(Object.freeze({id:`DEMO-${period.replace('-','')}-${region.toUpperCase()}-${account.toUpperCase()}`,period,region,account,budget:values[0][index]*1000,actual:values[1][index]*1000})));
  }
  const data=Object.freeze({version:1,currency:'USD',fictional:true,periods:Object.freeze(periods),rows:Object.freeze(rows)});
  if(typeof module!=='undefined' && module.exports)module.exports=data;
  else window.FinanceDemoData=data;
})();
