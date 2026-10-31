(function () {
  'use strict';
  const titles = { 'column-drills': 'Arithmetic by Columns Drills', 'division-drills': 'Long Division Drills' };
  const integer = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const bounds = d => [10 ** (d - 1), 10 ** d - 1];
  function adjust(s, key, edge, value, cap) {
    s[key + edge] = Math.max(1, Math.min(cap, Math.trunc(Number(value)) || 1));
    if (edge === 'Min' && s[key + 'Min'] > s[key + 'Max']) s[key + 'Max'] = s[key + 'Min'];
    if (edge === 'Max' && s[key + 'Max'] < s[key + 'Min']) s[key + 'Min'] = s[key + 'Max'];
  }
  const escape = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function answer(p) {
    if(p.op==='+')return String(p.a+p.b);
    if(p.op==='−')return String(p.a-p.b);
    if(p.op==='×')return String(p.a*p.b);
    const r=p.a%p.b;return String(Math.floor(p.a/p.b))+(r?' R '+r:'');
  }
  function sequentialPrint(showKey, restore, printWindow) {
    printWindow=printWindow||window;
    printWindow.addEventListener('afterprint',function(){
      showKey();
      printWindow.addEventListener('afterprint',restore,{once:true});
      printWindow.setTimeout(function(){try{printWindow.print();}catch(e){restore();}},250);
    },{once:true});
    printWindow.print();
  }
  function divisionSteps(p) {
    let remainder=0,started=false;const steps=[];
    [...String(p.a)].forEach((digit,end)=>{
      const partial=remainder*10+Number(digit),q=Math.floor(partial/p.b);
      remainder=partial-q*p.b;
      if(q||started||end===String(p.a).length-1){steps.push({partial,product:q*p.b,remainder,end});started=true;}
    });
    return steps;
  }
  function columnModel(p) {
    if(p.op==='×')return {partials:[...String(p.b)].reverse().map((d,i)=>p.a*Number(d)*10**i)};
    const negative=p.op==='−'&&p.a<p.b,top=String(negative?p.b:p.a),bottom=String(negative?p.a:p.b);
    const digits=[...top].reverse().map(Number),other=[...bottom].reverse().map(Number),carries=[];
    if(p.op==='+'){
      let carry=0;for(let i=0;i<Math.max(digits.length,other.length);i++){carry=Math.floor(((digits[i]||0)+(other[i]||0)+carry)/10);carries[i+1]=carry||'';}
      return {carries:Array.from({length:Math.max(digits.length,other.length)+1},(_,i)=>carries[Math.max(digits.length,other.length)-i]||'')};
    }
    for(let i=0;i<digits.length;i++)if(digits[i]<(other[i]||0)){
      let j=i+1;while(digits[j]===0){digits[j]=9;j++;}digits[j]--;digits[i]+=10;
    }
    return {negative,top,bottom,borrowed:digits.reverse()};
  }
  function columnWork(problem,p,result) {
    const stack=problem.querySelector('.stacked-problem'),model=columnModel(p);
    if(p.op==='×'){
      model.partials.forEach((value,i)=>{const row=document.createElement('span');row.className='partial-product';row.textContent=(i?'+ ':'')+value;stack.insertBefore(row,result);});
      result.classList.add('sum-partials');return;
    }
    if(p.op==='+'){
      const row=document.createElement('span');row.className='column-carries';
      model.carries.forEach(v=>{const cell=document.createElement('span');const small=document.createElement('small');small.textContent=v;cell.appendChild(small);row.appendChild(cell);});
      stack.insertBefore(row,stack.firstChild);return;
    }
    let target=stack;
    if(model.negative){
      const caption=document.createElement('small');caption.className='magnitude-note';caption.textContent='Magnitude; negate for the answer above.';problem.appendChild(caption);
      target=document.createElement('div');target.className='stacked-problem magnitude-work';
      const a=document.createElement('span'),b=document.createElement('span'),v=document.createElement('span');
      a.textContent=model.top;b.className='stacked-bottom';b.textContent='− '+model.bottom;v.textContent=p.b-p.a;
      target.append(a,b,v);problem.appendChild(target);
    }
    const top=target.firstElementChild;top.textContent='';top.classList.add('borrow-top');
    [...model.top].forEach((digit,i)=>{
      const cell=document.createElement('span');cell.className='borrow-digit';
      if(Number(digit)!==model.borrowed[i]){const change=document.createElement('small');change.textContent=model.borrowed[i];const old=document.createElement('s');old.textContent=digit;cell.append(change,old);}else cell.textContent=digit;
      top.appendChild(cell);
    });
  }
  function divisionWork(p) {
    const work=document.createElement('div');work.className='division-work';
    function row(value,end,subtract,width) {
      const line=document.createElement('div');line.className='division-step';
      const text=document.createElement('span');text.textContent=String(value);
      const n=width||String(value).length;
      text.style.marginLeft=(end+1-n)+'ch';text.style.width=n+'ch';
      if(subtract){text.className='division-subtract';const sign=document.createElement('i');sign.textContent='−';text.prepend(sign);}
      line.appendChild(text);work.appendChild(line);
    }
    const steps=divisionSteps(p);
    steps.forEach((s,i)=>{
      if(i)row(s.partial,s.end,false);
      row(s.product,s.end,true,Math.max(String(s.partial).length,String(s.product).length));
    });
    const last=steps[steps.length-1];row(last.remainder,last.end,false);
    return work;
  }
  function header(title, type, intro, classes) {
    return '<header class="paper-title unified-title '+(classes || '')+'"><div class="sheet-heading-row"><div class="sheet-wordmark"><img src="quokka-mark.png" alt=""><div class="wordmark-text"><b>qCal.cc</b><span>'+escape(type)+'</span></div></div><p class="name-field">Name: <span class="name-line" aria-hidden="true"></span></p></div><h1>'+escape(title)+'</h1>'+(intro?'<p>'+escape(intro)+'</p>':'')+'</header>';
  }
  function generate(kind, s) {
    const division = kind === 'division-drills';
    const columns = Math.max(s.aMax, s.bMax) > 4 ? 2 : 3;
    const work = division ? s.aMax + 2 : s.ops.includes('×') ? s.bMax + 2 + s.aMax * .2 : 2 + Math.max(s.aMax, s.bMax) * .3;
    const rows = Math.max(2, Math.min(6, Math.floor(18 / (work * .65 + 1))));
    const problems = [];
    for (let i = 0; i < columns * rows; i++) {
      let ad = integer(s.aMin, s.aMax), bd = integer(s.bMin, s.bMax);
      let [lo, hi] = bounds(ad), [bl, bh] = bounds(bd);
      let a, b, op;
      if (division) {
        if (!s.remainders) {
          // Select only feasible digit-length pairs, then an exact multiple.
          const pairs = [];
          for (let x = s.aMin; x <= s.aMax; x++) for (let y = s.bMin; y <= s.bMax; y++) if (y <= x) pairs.push([x, y]);
          if (!pairs.length) throw Error('Exact division needs a dividend digit range that can be at least as large as the divisor digit range.');
          [ad, bd] = pairs[integer(0, pairs.length - 1)];
          [lo, hi] = bounds(ad); [bl, bh] = bounds(bd);
          // Restrict divisor so at least one multiple fits the dividend range.
          do { b = integer(bl, Math.min(bh, hi)); } while (Math.ceil(lo / b) > Math.floor(hi / b));
          a = b * integer(Math.ceil(lo / b), Math.floor(hi / b));
        } else { a = integer(lo, hi); b = integer(bl, bh); }
        op = '÷';
      } else {
        if (!s.ops.length) throw Error('Select at least one operation.');
        a = integer(lo, hi); b = integer(bl, bh); op = s.ops[i % s.ops.length];
        if (op === '−' && s.pastZero === false) {
          const pairs=[];
          for(let x=s.aMin;x<=s.aMax;x++)for(let y=s.bMin;y<=s.bMax;y++)if(x>=y)pairs.push([x,y]);
          if(!pairs.length)throw Error('For subtraction without negative answers, increase the first-row digit range, decrease the second-row range, or allow subtraction past zero.');
          [ad,bd]=pairs[integer(0,pairs.length-1)];
          [lo,hi]=bounds(ad);[bl,bh]=bounds(bd);
          a=integer(Math.max(lo,bl),hi);b=integer(bl,Math.min(bh,a));
        }
      }
      problems.push({ a, b, op });
    }
    // Shuffle mixed operations so the pattern does not repeat down the page.
    for (let i = problems.length - 1; i > 0; i--) { const j = integer(0, i); [problems[i], problems[j]] = [problems[j], problems[i]]; }
    return { problems, columns, rows };
  }
  function mount(kind, host) {
    const division = kind === 'division-drills';
    const s = { aMin: division ? 6 : 2, aMax: division ? 6 : 2, bMin: 2, bMax: 2, ops: ['+', '−', '×'], remainders: true, pastZero: true };
    host.innerHTML = '<div class="preview-layout"><article class="print-sheet dynamic-sheet">' + header(titles[kind], 'Practice · Arithmetic', '', 'drill-title') + '<div class="drill-grid"></div></article><aside class="drill-controls" aria-label="Worksheet controls"><div class="sheet-actions"><button type="button" class="print-drills print-action">Print</button><button type="button" class="regenerate help-action">Regenerate</button><button type="button" class="reset-drills clear-action">Reset</button></div><h2>Customize</h2><div class="range-controls"></div><fieldset class="operation-controls"><legend>' + (division ? 'Division' : 'Operations') + '</legend>' + (division ? '<label><input type="checkbox" data-remainders checked> Allow remainders</label>' : s.ops.map(op => '<label><input type="checkbox" data-op="' + op + '" checked> ' + ({ '+': 'Addition', '−': 'Subtraction', '×': 'Multiplication' }[op]) + '</label>').join('') + '<label><input type="checkbox" data-past-zero checked> Subtraction past zero</label>') + '</fieldset><p class="drill-status" role="status"></p><label class="print-key-option"><input type="checkbox" data-print-key> Print with key</label><label class="solutions-option"><input type="checkbox" data-solutions disabled> With solutions</label><p class="print-key-note">Two print dialogs: worksheet, then answer key.</p></aside></div>';
    const grid = host.querySelector('.drill-grid'), status = host.querySelector('.drill-status');
    let current=null,printing=false;
    function render() {
      try {
        const data = generate(kind, s);
        current=data;
        grid.style.setProperty('--drill-columns', data.columns); grid.style.setProperty('--drill-rows', data.rows);
        grid.innerHTML = data.problems.map((p, i) => '<div class="drill-problem"><span class="problem-index">' + (i + 1) + '.</span>' + (division ? '<div class="division-problem"><span>' + p.b + '</span><span class="division-dividend">' + p.a + '</span></div>' : '<div class="stacked-problem"><span>' + p.a + '</span><span class="stacked-bottom"><b>' + p.op + '</b>' + p.b + '</span></div>') + '</div>').join('');
        status.textContent = division ? (s.remainders ? 'Remainders may occur.' : 'Every problem divides exactly.') : s.pastZero ? 'Subtraction may have negative answers.' : 'Subtraction answers are zero or positive.';
        host.dataset.valid = 'true';
      } catch (e) { grid.innerHTML = ''; status.textContent = e.message; host.dataset.valid = 'false'; }
    }
    const ranges = host.querySelector('.range-controls');
    [[division ? 'Dividend' : 'First row', 'a', 7], [division ? 'Divisor' : 'Second row', 'b', division ? 3 : 6]].forEach(([label, key, cap]) => {
      const f = document.createElement('fieldset'); f.innerHTML = '<legend>' + label + ' digits</legend>';
      ['Min', 'Max'].forEach((edge) => {
        const id = key + edge, wrap = document.createElement('div'); wrap.className = 'digit-control';
        wrap.innerHTML = '<label for="digits-' + id + '">' + (edge === 'Min' ? 'Minimum' : 'Maximum') + '</label><div class="digit-stepper"><input id="digits-' + id + '" type="number" step="1" value="' + s[id] + '"><span><button type="button" data-step="1" aria-label="Increase ' + label + ' ' + edge.toLowerCase() + '">▲</button><button type="button" data-step="-1" aria-label="Decrease ' + label + ' ' + edge.toLowerCase() + '">▼</button></span></div>';
        const input = wrap.querySelector('input');
        function change(value) { adjust(s, key, edge, value, cap); sync(); render(); }
        input.addEventListener('change', () => change(input.value));
        wrap.querySelectorAll('button').forEach(b => b.addEventListener('click', () => change(s[id] + Number(b.dataset.step))));
        f.appendChild(wrap);
      }); ranges.appendChild(f);
    });
    function sync() {
      ['a', 'b'].forEach(key => ['Min', 'Max'].forEach(edge => {
        const input = host.querySelector('#digits-' + key + edge), cap = key === 'a' ? 7 : division ? 3 : 6;
        input.min = 1; input.max = cap; input.value = s[key + edge];
        const buttons = input.parentElement.querySelectorAll('button'); buttons[0].disabled = s[key + edge] >= Number(input.max); buttons[1].disabled = s[key + edge] <= Number(input.min);
      }));
    }
    host.querySelectorAll('[data-op]').forEach(c => c.addEventListener('change', () => {
      const checked = [...host.querySelectorAll('[data-op]:checked')];
      if (!checked.length) { c.checked = true; status.textContent = 'Keep at least one operation selected.'; return; }
      s.ops = checked.map(x => x.dataset.op); render();
    }));
    const remainders = host.querySelector('[data-remainders]');
    if (remainders) remainders.addEventListener('change', () => { s.remainders = remainders.checked; render(); });
    const pastZero=host.querySelector('[data-past-zero]');
    if(pastZero)pastZero.addEventListener('change',()=>{s.pastZero=pastZero.checked;render();});
    host.querySelector('.regenerate').addEventListener('click', render);
    host.querySelector('.reset-drills').addEventListener('click', () => {
      Object.assign(s, {aMin:division?6:2,aMax:division?6:2,bMin:2,bMax:2,ops:['+','−','×'],remainders:true,pastZero:true});
      host.querySelectorAll('[data-op], [data-remainders], [data-past-zero]').forEach(c => { c.checked=true; });
      host.querySelector('[data-print-key]').checked=false;
      host.querySelector('[data-solutions]').checked=false;
      host.querySelector('[data-solutions]').disabled=true;
      sync(); render();
    });
    host.querySelector('[data-print-key]').addEventListener('change',function(){
      host.querySelector('[data-solutions]').disabled=!this.checked;
    });
    host.querySelector('.print-drills').addEventListener('click', () => {
      if(host.dataset.valid==='false'||printing)return;
      if(!host.querySelector('[data-print-key]').checked){window.print();return;}
      printing=true;
      const article=host.querySelector('.print-sheet');
      const controls=[...host.querySelectorAll('button,input')].map(el=>[el,el.disabled]);
      controls.forEach(([el])=>{el.disabled=true;});
      // Hide the original page during key printing, without replacing its live nodes.
      const key=article.cloneNode(true);key.classList.add('answer-key-sheet');
      key.querySelector('.sheet-wordmark span').textContent+=' · Answer Key';
      key.querySelectorAll('.drill-problem').forEach((problem,i)=>{
        const result=document.createElement('span');
        result.className=division?'division-answer':'column-answer';
        const p=current.problems[i];
        result.textContent=division?String(Math.floor(p.a/p.b)):answer(p);
        problem.querySelector(division?'.division-dividend':'.stacked-problem').appendChild(result);
        if(division){const rem=document.createElement('span');rem.className='division-remainder';rem.textContent='r '+p.a%p.b;result.appendChild(rem);}
        if(host.querySelector('[data-solutions]').checked){
          if(division)problem.querySelector('.division-dividend').appendChild(divisionWork(p));
          else columnWork(problem,p,result);
        }
      });
      const restorePage=()=>{key.remove();article.hidden=false;article.classList.remove('worksheet-hidden');printing=false;controls.forEach(([el,disabled])=>{el.disabled=disabled;});};
      sequentialPrint(()=>{article.classList.add('worksheet-hidden');article.after(key);},restorePage);
    });
    sync(); render();
  }
  window.QCAL_DRILLS = { generate, mount, titles, adjust, header, answer, sequentialPrint, divisionSteps, columnModel };
}());
