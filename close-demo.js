(() => {
  'use strict';
  const key = 'claus-close-demo-v1';
  const $ = id => document.getElementById(id);
  const german = () => document.documentElement.lang === 'de';
  const t = (en, de) => german() ? de : en;
  const teams = {
    data: ['Data', 'Daten'], reinsurance: ['Reinsurance', 'Rückversicherung'],
    actuarial: ['Actuarial', 'Aktuariat'], reporting: ['Reporting', 'Reporting'], controls: ['Controls', 'Kontrollen']
  };
  const labels = { todo: ['Not started', 'Nicht begonnen'], progress: ['In progress', 'In Arbeit'], blocked: ['Blocked', 'Blockiert'], waiting: ['Waiting', 'Wartet'], done: ['Complete', 'Abgeschlossen'] };
  const seed = [
    ['C01','Load source ledger','Hauptbuch laden','data','Alex Morgan',1,'done',[]],
    ['C02','Validate account mapping','Kontenzuordnung prüfen','data','Alex Morgan',2,'done',['C01']],
    ['C03','Import receivables','Forderungen importieren','reporting','Jordan Lee',2,'done',['C01']],
    ['C04','Reconcile cash','Zahlungsmittel abstimmen','reporting','Sam Rivera',3,'done',['C01']],
    ['C05','Validate claims extract','Schadendaten prüfen','data','Taylor Brooks',3,'done',['C01']],
    ['C06','Process treaty feeds','Vertragsdaten verarbeiten','reinsurance','Casey Chen',3,'done',['C01']],
    ['C07','Estimate reserves','Reserven schätzen','actuarial','Robin Ellis',4,'done',['C05']],
    ['C08','Review reserve movements','Reservenbewegungen prüfen','actuarial','Robin Ellis',5,'progress',['C07']],
    ['C09','Reconcile intercompany','Intercompany abstimmen','reporting','Jordan Lee',4,'progress',['C02','C03']],
    ['C10','Post reinsurance journals','Buchungen zur Rückversicherung erfassen','reinsurance','Casey Chen',5,'todo',['C06']],
    ['C11','Resolve premium feed exceptions','Ausnahmen in Prämiendaten klären','data','Taylor Brooks',5,'blocked',['C02']],
    ['C12','Calculate reinsurance recoverables','Forderungen aus Rückversicherung berechnen','reinsurance','Jamie Patel',6,'todo',['C07','C10']],
    ['C13','Reconcile technical balances','Technische Salden abstimmen','reporting','Sam Rivera',6,'progress',['C07']],
    ['C14','Review ceded premium','Zedierte Prämien prüfen','reinsurance','Jamie Patel',7,'todo',['C10','C11']],
    ['C15','Complete expense accruals','Aufwandsabgrenzungen abschließen','reporting','Jordan Lee',5,'done',['C02']],
    ['C16','Run IFRS 17 model','IFRS-17-Modell ausführen','actuarial','Morgan Avery',7,'todo',['C08','C11']],
    ['C17','Review IFRS 17 variances','IFRS-17-Abweichungen prüfen','actuarial','Morgan Avery',8,'todo',['C16']],
    ['C18','Draft profit and loss pack','GuV-Bericht erstellen','reporting','Sam Rivera',8,'todo',['C09','C13','C15']],
    ['C19','Review balance sheet','Bilanz prüfen','controls','Drew Wilson',8,'todo',['C04','C09','C12']],
    ['C20','Perform close control checks','Abschlusskontrollen durchführen','controls','Drew Wilson',9,'todo',['C14','C17','C18','C19']],
    ['C21','Draft close narrative','Abschlusskommentar erstellen','reporting','Jordan Lee',9,'todo',['C18','C17']],
    ['C22','Controller sign-off','Freigabe durch den Controller','controls','Reese Martin',10,'todo',['C20','C21']],
    ['C23','Publish executive pack','Management-Bericht veröffentlichen','reporting','Sam Rivera',11,'todo',['C22']],
    ['C24','Archive close evidence','Abschlussnachweise archivieren','controls','Reese Martin',12,'todo',['C23']]
  ];
  const tasks = seed.map(a => ({ id:a[0], en:a[1], de:a[2], team:a[3], owner:a[4], due:a[5], initial:a[6], dependencies:a[7] }));
  const byId = new Map(tasks.map(task => [task.id, task]));
  const title = task => german() ? task.de : task.en;
  const teamName = team => teams[team][german() ? 1 : 0];
  const statusName = status => labels[status][german() ? 1 : 0];
  const wd = day => (german() ? 'AT ' : 'WD ') + day;
  const validStatuses = ['todo','progress','blocked','done'];
  function fresh() {
    return { day:6, statuses:Object.fromEntries(tasks.map(task => [task.id,task.initial])), notes:{}, history:[] };
  }
  let state = fresh(), storageAvailable = true;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && saved.version === 1) {
      if (Number.isInteger(saved.day) && saved.day >= 1 && saved.day <= 12) state.day = saved.day;
      for (const task of tasks) {
        if (validStatuses.includes(saved.statuses?.[task.id])) state.statuses[task.id] = saved.statuses[task.id];
        if (typeof saved.notes?.[task.id] === 'string') state.notes[task.id] = saved.notes[task.id].slice(0,600);
      }
      if (Array.isArray(saved.history)) state.history = saved.history.filter(h => byId.has(h.id) && validStatuses.includes(h.before) && validStatuses.includes(h.after) && Number.isFinite(h.time)).slice(0,6);
    }
  } catch (_) { storageAvailable = false; }
  let activeId = null;
  const dialog = $('close-task-dialog');
  function dependencies(task) { return task.dependencies.map(id => byId.get(id)); }
  function unfinished(task) { return dependencies(task).filter(dep => state.statuses[dep.id] !== 'done'); }
  function effective(task) {
    const status = state.statuses[task.id];
    if (status === 'done' || status === 'blocked') return status;
    return unfinished(task).length ? 'waiting' : status;
  }
  function attention(task) {
    return state.statuses[task.id] !== 'done' && (task.due < state.day || state.statuses[task.id] === 'blocked' || (task.due <= state.day && unfinished(task).length > 0));
  }
  function reopenDownstream() {
    const reopened = [];
    for (let pass=0; pass<tasks.length; pass++) {
      let changed = false;
      for (const task of tasks) if (state.statuses[task.id] === 'done' && unfinished(task).length) {
        state.statuses[task.id] = 'todo'; reopened.push(task.id); changed = true;
      }
      if (!changed) break;
    }
    return reopened;
  }
  reopenDownstream();
  function storageNotice() {
    const el = $('close-storage-note'); el.hidden = storageAvailable;
    el.textContent = t('Browser storage is unavailable; changes last until you leave this page.', 'Browserspeicher nicht verfügbar. Änderungen gelten nur bis zum Verlassen dieser Seite.');
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify({ version:1, ...state })); }
    catch (_) { storageAvailable = false; }
    storageNotice();
  }
  function element(tag, text, className) {
    const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (className) el.className = className; return el;
  }
  function reason(task) {
    const reasons = [];
    if (task.due < state.day) {
      const days = state.day-task.due;
      reasons.push(t(`${days} working ${days===1?'day':'days'} overdue`, `${days} ${days===1?'Arbeitstag':'Arbeitstage'} überfällig`));
    }
    if (state.statuses[task.id] === 'blocked') reasons.push(t('Owner action needed','Klärung durch Verantwortlichen nötig'));
    if (unfinished(task).length) reasons.push(t('Dependencies unfinished','Offene Voraussetzungen'));
    return reasons.join(' · ');
  }
  function filtered() {
    const team = $('close-team').value, status = $('close-status').value;
    const query = $('close-search').value.trim().toLocaleLowerCase();
    return tasks.filter(task => (team === 'all' || task.team === team)
      && (status === 'all' || effective(task) === status)
      && (!$('close-attention-only').checked || attention(task))
      && (!query || [task.id,task.en,task.de,task.owner,teamName(task.team)].join(' ').toLocaleLowerCase().includes(query)))
      .sort((a,b)=>{
        const priority = task => state.statuses[task.id] === 'done' ? 2 : attention(task) ? 0 : 1;
        return priority(a)-priority(b) || a.due-b.due || a.id.localeCompare(b.id);
      });
  }
  function taskButton(task, sidebar = false) {
    const button = element('button', undefined, sidebar ? 'close-attention-item' : 'close-task-row' + (state.statuses[task.id] === 'done' ? ' is-complete' : ''));
    button.type = 'button'; button.dataset.task = task.id;
    if (sidebar) {
      button.append(element('strong',title(task)),element('span',wd(task.due)+' · '+reason(task)));
    } else {
      const name = element('span'); name.append(element('span',title(task),'close-task-name'),element('span',`${teamName(task.team)} · ${task.owner}`,'close-task-owner'));
      const due = element('span',wd(task.due),'close-task-due');
      if (state.statuses[task.id] !== 'done' && task.due < state.day) { due.classList.add('is-late'); due.append(element('small',t(`${state.day-task.due}d overdue`,`${state.day-task.due}T überfällig`))); }
      else if (state.statuses[task.id] !== 'done' && task.due === state.day) due.append(element('small',t('Due today','Heute fällig')));
      const status = effective(task); button.append(name,due,element('span',statusName(status),'close-status '+status));
    }
    return button;
  }
  function render() {
    const done = tasks.filter(task => state.statuses[task.id] === 'done').length;
    const overdue = tasks.filter(task => state.statuses[task.id] !== 'done' && task.due < state.day).length;
    const due = tasks.filter(task => state.statuses[task.id] !== 'done' && task.due === state.day).length;
    const blocked = tasks.filter(task => state.statuses[task.id] === 'blocked').length;
    const percent = Math.round(done/tasks.length*100);
    $('close-percent').textContent = percent+'%';
    $('close-completed').textContent = t(`${done} of ${tasks.length} milestones complete`,`${done} von ${tasks.length} Meilensteinen abgeschlossen`);
    $('close-progress').setAttribute('aria-valuenow',String(percent));
    $('close-progress').setAttribute('aria-label',t('Overall close progress','Gesamter Abschlussfortschritt'));
    $('close-progress').firstElementChild.style.width = percent+'%';
    $('close-overdue').textContent = overdue; $('close-due').textContent = due; $('close-blocked').textContent = blocked;
    $('close-brief-text').textContent = done === tasks.length
      ? t('All milestones are complete. The executive pack is published and close evidence is archived.', 'Alle Meilensteine sind abgeschlossen. Der Management-Bericht ist veröffentlicht und die Nachweise sind archiviert.')
      : t(`As of ${wd(state.day)}, ${done} of ${tasks.length} milestones are complete. ${overdue} are overdue, ${due} are due today, and ${blocked} ${blocked===1?'has':'have'} a reported blocker. Select a milestone below to review the next action.`, `Zum ${wd(state.day)} sind ${done} von ${tasks.length} Meilensteinen abgeschlossen. ${overdue} sind überfällig, ${due} heute fällig und ${blocked} als blockiert gemeldet. Wählen Sie einen Meilenstein, um die nächste Aktion zu prüfen.`);
    const teamRows = Object.keys(teams).map(team => {
      const total = tasks.filter(task => task.team === team).length;
      const finished = tasks.filter(task => task.team === team && state.statuses[task.id] === 'done').length;
      const container = element('div'); const heading = element('div',undefined,'close-team-head');
      heading.append(element('span',teamName(team)),element('span',`${finished}/${total}`));
      const track = element('div',undefined,'close-team-track'); track.setAttribute('aria-hidden','true');const bar=element('span');bar.style.width=(finished/total*100)+'%';track.append(bar);container.append(heading,track);return container;
    });
    $('close-teams').setAttribute('aria-label',t('Team progress','Fortschritt nach Team'));
    $('close-teams').replaceChildren(...teamRows);
    const visible = filtered(); $('close-list').replaceChildren(...visible.map(task => taskButton(task)));
    $('close-result-count').textContent = t(`${visible.length} of ${tasks.length} shown`,`${visible.length} von ${tasks.length} angezeigt`);
    $('close-empty').hidden = visible.length > 0;
    const needsAttention = tasks.filter(attention).sort((a,b)=>a.due-b.due || a.id.localeCompare(b.id));
    $('close-attention-count').textContent = needsAttention.length;
    $('close-attention-list').replaceChildren(...(needsAttention.length ? needsAttention.map(task => taskButton(task,true)) : [element('p',t('No milestones need attention at this working day.','An diesem Arbeitstag besteht kein Handlungsbedarf.'),'close-none')]));
    const history = state.history.map(item => {
      const el = element('div',undefined,'close-history-item');
      el.append(element('strong',title(byId.get(item.id))),element('span',item.before===item.after ? t('Review note updated','Prüfnotiz aktualisiert') : `${statusName(item.before)} → ${statusName(item.after)}`));
      el.append(element('span',new Date(item.time).toLocaleTimeString(german()?'de-DE':'en-US',{hour:'2-digit',minute:'2-digit'})));
      return el;
    });
    $('close-history-list').replaceChildren(...(history.length ? history : [element('p',t('Your saved milestone updates will appear here.','Ihre gespeicherten Meilenstein-Änderungen erscheinen hier.'))]));
    storageNotice();
  }
  function populateTeams() {
    const current = $('close-team').value || 'all';
    const all = element('option',t('All teams','Alle Teams'));all.value='all';
    $('close-team').replaceChildren(all,...Object.keys(teams).map(team=>{const option=element('option',teamName(team));option.value=team;return option;}));
    $('close-team').value = current;
  }
  function populateDialog() {
    const task=byId.get(activeId);if(!task)return;
    $('close-task-id').textContent=task.id;
    $('close-task-title').textContent=title(task);
    $('close-task-meta').textContent=`${teamName(task.team)} · ${task.owner} · ${t('Due','Fällig')} ${wd(task.due)}`;
    const remaining=unfinished(task);
    $('close-task-guidance').textContent = remaining.length
      ? t(`${remaining.length} ${remaining.length===1?'prerequisite still needs':'prerequisites still need'} completion. Review them below.`,`${remaining.length} ${remaining.length===1?'Voraussetzung ist':'Voraussetzungen sind'} noch offen. Prüfen Sie diese unten.`)
      : state.statuses[task.id] === 'blocked' ? t('This milestone has a reported blocker. Review the note and update the status when resolved.','Dieser Meilenstein ist als blockiert gemeldet. Prüfen Sie die Notiz und aktualisieren Sie den Status nach der Klärung.') : '';
    $('close-dependencies').replaceChildren(...(task.dependencies.length ? dependencies(task).map(dep=>{
      const button=element('button',`${state.statuses[dep.id]==='done'?'✓ ':''}${title(dep)} — ${statusName(effective(dep))}`);
      button.type='button';button.dataset.dependency=dep.id;return button;
    }) : [element('p',t('No prerequisites.','Keine Voraussetzungen.'))]));
    const doneOption=$('close-task-status').querySelector('option[value=done]');doneOption.disabled=remaining.length>0;
  }
  function openTask(id) {
    if(!byId.has(id))return;activeId=id;populateDialog();
    $('close-task-status').value=state.statuses[id];
    $('close-task-note').value=state.notes[id] ?? (id==='C11' ? t('Two unmapped product codes need confirmation from the data owner.','Zwei nicht zugeordnete Produktcodes benötigen die Bestätigung des Datenverantwortlichen.') : '');
    $('close-task-error').hidden=true;
    if(!dialog.open)dialog.showModal();else $('close-task-title').scrollIntoView({block:'nearest'});
  }
  function closeTask() {
    const id=activeId;dialog.close();
    const trigger=$('close-list').querySelector(`[data-task="${id}"]`) || $('close-attention-list').querySelector(`[data-task="${id}"]`);
    if(trigger)trigger.focus({preventScroll:true});
  }
  $('close-task-form').addEventListener('submit',event=>{
    event.preventDefault();const task=byId.get(activeId);if(!task)return;
    const status=$('close-task-status').value;
    if(!validStatuses.includes(status)||(status==='done'&&unfinished(task).length)){
      $('close-task-error').hidden=false;$('close-task-error').textContent=t('Complete the prerequisites before marking this milestone complete.','Schließen Sie zuerst die Voraussetzungen ab.');return;
    }
    const before=state.statuses[task.id];state.statuses[task.id]=status;state.notes[task.id]=$('close-task-note').value.slice(0,600);
    const reopened=reopenDownstream();
    state.history.unshift({id:task.id,before,after:status,time:Date.now()});state.history=state.history.slice(0,6);
    save();render();closeTask();
    $('close-announcement').textContent=t(`${title(task)} saved. ${reopened.length?`${reopened.length} downstream ${reopened.length===1?'milestone':'milestones'} reopened.`:''}`,`${title(task)} gespeichert. ${reopened.length?`${reopened.length} ${reopened.length===1?'abhängiger Meilenstein':'abhängige Meilensteine'} erneut geöffnet.`:''}`);
  });
  $('close-list').addEventListener('click',event=>{const button=event.target.closest('[data-task]');if(button)openTask(button.dataset.task);});
  $('close-attention-list').addEventListener('click',event=>{const button=event.target.closest('[data-task]');if(button)openTask(button.dataset.task);});
  $('close-dependencies').addEventListener('click',event=>{const button=event.target.closest('[data-dependency]');if(button)openTask(button.dataset.dependency);});
  $('close-task-close').addEventListener('click',closeTask);
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeTask();}});
  for(const id of ['close-team','close-status','close-search','close-attention-only'])$(id).addEventListener('input',render);
  for(let day=1;day<=12;day++){const option=element('option',String(day));option.value=day;$('close-day').append(option);}
  $('close-day').value=state.day;
  $('close-day').addEventListener('change',()=>{state.day=Number($('close-day').value);save();render();});
  $('close-reset').addEventListener('click',()=>{state=fresh();$('close-day').value=state.day;$('close-team').value='all';$('close-status').value='all';$('close-search').value='';$('close-attention-only').checked=false;save();render();$('close-announcement').textContent=t('Demo reset to its original sample.','Demo auf den ursprünglichen Beispieldatensatz zurückgesetzt.');});
  $('close-export').addEventListener('click',()=>{
    const rows=[[t('Fictional close demo data','Fiktive Abschlussdaten')],['ID',t('Milestone','Meilenstein'),'Team',t('Owner','Verantwortlich'),t('Due working day','Fälliger Arbeitstag'),'Status',t('Dependencies','Voraussetzungen'),t('Review note','Prüfnotiz')],...filtered().map(task=>[task.id,title(task),teamName(task.team),task.owner,task.due,statusName(effective(task)),task.dependencies.join('; '),state.notes[task.id]||''])];
    const cell=value=>{let text=String(value);if(/^[=+\-@\t\r]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';};
    const blob=new Blob(['\ufeff'+rows.map(row=>row.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);const a=element('a');a.href=url;a.download='Close_Command_Center_Demo.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    $('close-announcement').textContent=t('The current filtered view has been exported.','Die aktuelle gefilterte Ansicht wurde exportiert.');
  });
  document.addEventListener('languagechange',()=>{populateTeams();render();if(dialog.open)populateDialog();$('close-search').setAttribute('aria-label',t('Search milestones or owners','Meilensteine oder Verantwortliche suchen'));});
  populateTeams();render();$('close-search').setAttribute('aria-label',t('Search milestones or owners','Meilensteine oder Verantwortliche suchen'));$('close-app').hidden=false;
})();
