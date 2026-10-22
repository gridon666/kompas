(() => {
  const form = document.getElementById('search-form');
  if (!form) return;
  const input = document.getElementById('company-input');
  const result = document.getElementById('result');
  const message = document.getElementById('search-message');
  const levels = {low:{label:'Низкий риск',className:'risk-low'},medium:{label:'Средний риск',className:'risk-medium'},high:{label:'Высокий риск',className:'risk-high'}};
  let selected = null;
  const setText = (id, value) => { document.getElementById(id).textContent = value; };
  function search(value) {
    const query = value.trim().toLocaleLowerCase('ru');
    selected = null;
    result.hidden = true;
    if (!query) { message.textContent = 'Введите название компании для поиска.'; return; }
    const exact = companies.find(company => company.name.toLocaleLowerCase('ru') === query);
    const matches = companies.filter(company => company.name.toLocaleLowerCase('ru').includes(query));
    const company = exact || (matches.length === 1 ? matches[0] : null);
    if (!company) {
      message.textContent = matches.length > 1 ? `Найдено несколько совпадений: ${matches.map(item => item.name).join(', ')}. Уточните название.` : 'Компания не найдена в демонстрационном справочнике. Попробуйте один из примеров ниже.';
      return;
    }
    selected = company;
    message.textContent = '';
    const date = new Date().toLocaleDateString('ru-RU');
    const risk = levels[company.risk];
    setText('result-name', company.name);
    setText('result-country', `${company.country} · ${company.industry}`);
    setText('detail-country', company.country);
    setText('detail-industry', company.industry);
    setText('detail-sanctions', company.sanctions);
    setText('detail-risk', risk.label);
    setText('detail-date', date);
    setText('detail-advice', company.advice);
    const pill = document.getElementById('risk-pill');
    pill.className = `risk-pill ${risk.className}`;
    pill.textContent = risk.label;
    result.hidden = false;
    result.scrollIntoView({behavior:'smooth',block:'start'});
  }
  form.addEventListener('submit', event => {event.preventDefault();search(input.value);});
  document.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => {input.value=button.dataset.example;search(input.value);}));
  document.getElementById('download-report').addEventListener('click', () => {
    if (!selected) return;
    const risk = levels[selected.risk].label;
    const content = ['КОМПАСВЭД — ДЕМОНСТРАЦИОННЫЙ ОТЧЁТ','',`Дата: ${new Date().toLocaleDateString('ru-RU')}`,`Компания: ${selected.name}`,`Страна: ${selected.country}`,`Сфера деятельности: ${selected.industry}`,`Санкционный статус: ${selected.sanctions}`,`Уровень риска: ${risk}`,'',`Рекомендация: ${selected.advice}`,'','ВНИМАНИЕ: Вымышленные сведения. Не является юридическим заключением. Не использовать для реальных решений.'].join('\r\n');
    const blob = new Blob(['\ufeff',content],{type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url;a.download=`KompasVED_${selected.name.replace(/\s+/g,'_')}.txt`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
})();

(() => {
  const form = document.getElementById('search-form');
  if (!form) return;
  const explanations = {
    low: 'В учебном сценарии отсутствуют индикаторы повышенного риска. Это не подтверждает безопасность реальной сделки.',
    medium: 'В учебном сценарии есть признаки, требующие дополнительного уточнения. До принятия решения следует проверить документы и связанные стороны.',
    high: 'Учебный сценарий содержит повышенные индикаторы риска. Требуется углублённая независимая проверка.'
  };
  const factors = ['Регистрационные сведения и полномочия представителей', 'Структура владения и связанные организации', 'Товар, маршрут поставки и условия расчётов'];
  const key = 'kompasved_history_v2';
  const read = () => {try {return JSON.parse(localStorage.getItem(key) || '[]')} catch {return []}};
  const list = document.getElementById('history-list');
  function renderHistory(){
    const items=read();list.replaceChildren();
    if(!items.length){const p=document.createElement('p');p.className='muted';p.textContent='Проверок пока нет.';list.append(p);return}
    items.forEach(item=>{const button=document.createElement('button');button.type='button';button.className='history-item';const name=document.createElement('strong');name.textContent=item.name;const date=document.createElement('span');date.textContent=item.date;button.append(name,date);button.addEventListener('click',()=>{document.getElementById('company-input').value=item.name;form.requestSubmit()});list.append(button)})
  }
  form.addEventListener('submit',()=>setTimeout(()=>{
    const result=document.getElementById('result');if(result.hidden)return;
    const name=document.getElementById('result-name').textContent;
    const company=companies.find(c=>c.name===name);if(!company)return;
    document.getElementById('risk-explanation').textContent=explanations[company.risk];
    const ul=document.getElementById('risk-factors');ul.replaceChildren();factors.forEach(f=>{const li=document.createElement('li');li.textContent=f;ul.append(li)});
    const items=read().filter(i=>i.name!==name);items.unshift({name,date:new Date().toLocaleDateString('ru-RU')});
    try{localStorage.setItem(key,JSON.stringify(items.slice(0,8)))}catch{}renderHistory();
  },0));
  document.querySelectorAll('[data-example]').forEach(btn=>btn.addEventListener('click',()=>setTimeout(()=>{
    const company=companies.find(c=>c.name===document.getElementById('result-name').textContent);
    if(!company)return;
    document.getElementById('risk-explanation').textContent=explanations[company.risk];
    const ul=document.getElementById('risk-factors');ul.replaceChildren();factors.forEach(f=>{const li=document.createElement('li');li.textContent=f;ul.append(li)});
    const items=read().filter(i=>i.name!==company.name);items.unshift({name:company.name,date:new Date().toLocaleDateString('ru-RU')});try{localStorage.setItem(key,JSON.stringify(items.slice(0,8)))}catch{}renderHistory();
  },0)));
  document.getElementById('clear-history').addEventListener('click',()=>{localStorage.removeItem(key);renderHistory()});renderHistory();
})();

(() => {
  const list=document.getElementById('monitor-list');if(!list)return;
  const events=[
    {date:'18.10.2026',source:'ЕС',category:'Санкционные списки',title:'Учебное обновление перечня организаций',desc:'Пример записи об изменении состава санкционного списка. Сведения не относятся к реальным компаниям.'},
    {date:'16.10.2026',source:'OFAC',category:'Санкционные списки',title:'Демонстрационная запись о новых совпадениях',desc:'Образец уведомления для последующей проверки связей контрагента.'},
    {date:'14.10.2026',source:'Великобритания',category:'Регуляторные изменения',title:'Пример изменения порядка проверки',desc:'Макет сообщения о необходимости пересмотреть внутренний контроль сделки.'},
    {date:'11.10.2026',source:'ООН',category:'Санкционные списки',title:'Учебная корректировка записи',desc:'Пример обновления реквизитов в перечне без привязки к реальному событию.'},
    {date:'09.10.2026',source:'ЕС',category:'Судебная практика',title:'Пример правовой позиции по проверке контроля',desc:'Демонстрация карточки для аналитической заметки о цепочках владения.'},
    {date:'06.10.2026',source:'OFAC',category:'Регуляторные изменения',title:'Образец разъяснения по проверке операций',desc:'Условная запись о необходимости уточнить участников и характер операции.'},
    {date:'03.10.2026',source:'Великобритания',category:'Санкционные списки',title:'Учебное изменение записи в перечне',desc:'Пример оповещения о пересмотре данных в источнике.'},
    {date:'01.10.2026',source:'ЕС',category:'Регуляторные изменения',title:'Демонстрационное уведомление для импортёров',desc:'Условная карточка изменения требований к отдельным товарным категориям.'}
  ];
  const source=document.getElementById('source-filter'),category=document.getElementById('category-filter'),query=document.getElementById('monitor-search');
  function render(){list.replaceChildren();const filtered=events.filter(e=>(source.value==='all'||e.source===source.value)&&(category.value==='all'||e.category===category.value)&&`${e.title} ${e.desc} ${e.source}`.toLowerCase().includes(query.value.trim().toLowerCase()));document.getElementById('monitor-count').textContent=`Найдено записей: ${filtered.length}`;
    if(!filtered.length){const empty=document.createElement('p');empty.className='muted';empty.textContent='По выбранным фильтрам записей нет.';list.append(empty)}
    filtered.forEach(e=>{const card=document.createElement('article');card.className='monitor-item';const meta=document.createElement('div');meta.className='monitor-meta';meta.textContent=`${e.date}  /  ${e.source}`;const content=document.createElement('div');const h=document.createElement('h3');h.textContent=e.title;const p=document.createElement('p');p.textContent=e.desc;content.append(h,p);const tag=document.createElement('span');tag.className='monitor-tag';tag.textContent=e.category;card.append(meta,content,tag);list.append(card)})}
  [source,category].forEach(el=>el.addEventListener('change',render));query.addEventListener('input',render);render();
})();
