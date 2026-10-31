(function () {
  'use strict';
  const api = window.QCAL_DRILLS;
  const titles = {
    'linear-literal-drills': 'Equation Drills',
    'systems-drills': 'Systems of Linear Equations Drills'
  };
  Object.assign(api.titles, titles);
  const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const fraction = (n, d) => { const g = gcd(n, d); n /= g; d /= g; return d === 1 ? String(n) : n + '/' + d; };
  const defaultVariables = 'abcdefghijklmnopqrstuvwxyz';
  const variablePresets = {
    clear: {label:'Clear', symbols:''},
    upperLatin: {label:'Uppercase Latin', symbols:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'},
    lowerLatin: {label:'Lowercase Latin', symbols:'abcdefghijklmnopqrstuvwxyz'},
    upperGreek: {label:'Uppercase Greek', symbols:'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'},
    lowerGreek: {label:'Lowercase Greek', symbols:'αβγδεζηθικλμνξοπρστυφχψω'},
    shapes: {label:'Basic Shapes', symbols:'○□△▭◇⋆⬠⬡'},
    emoji: {label:'Basic Emojis', symbols:'🌳🚗🍎😀🐈🐕'}
  };
  const latexVariables = {
    alpha:'α', beta:'β', gamma:'γ', delta:'δ', epsilon:'ϵ', varepsilon:'ε',
    zeta:'ζ', eta:'η', theta:'θ', vartheta:'ϑ', iota:'ι', kappa:'κ', varkappa:'ϰ',
    lambda:'λ', mu:'μ', nu:'ν', xi:'ξ', omicron:'ο', pi:'π', varpi:'ϖ',
    rho:'ρ', varrho:'ϱ', sigma:'σ', varsigma:'ς', tau:'τ', upsilon:'υ',
    phi:'ϕ', varphi:'φ', chi:'χ', psi:'ψ', omega:'ω',
    Alpha:'Α', Beta:'Β', Gamma:'Γ', Delta:'Δ', Epsilon:'Ε', Zeta:'Ζ', Eta:'Η',
    Theta:'Θ', Iota:'Ι', Kappa:'Κ', Lambda:'Λ', Mu:'Μ', Nu:'Ν', Xi:'Ξ',
    Omicron:'Ο', Pi:'Π', Rho:'Ρ', Sigma:'Σ', Tau:'Τ', Upsilon:'Υ',
    Phi:'Φ', Chi:'Χ', Psi:'Ψ', Omega:'Ω', ell:'ℓ', hbar:'ℏ', imath:'ı', jmath:'ȷ',
    triangle:'△', tri:'△', square:'□', sq:'□',
    circ:'○', circle:'○', sircle:'○', bigcirc:'○',
    rect:'▭', rectangle:'▭', diamond:'◇', diam:'◇', lozenge:'◇', rhombus:'◇',
    tree:'🌳', car:'🚗', apple:'🍎',
    star:'⋆', pentagon:'⬠', hexagon:'⬡'
  };
  function uniqueVars(value) {
    const source = String(value || '').normalize('NFC');
    const variables = [];
    // Graphemes keep emoji ZWJ sequences, modifiers, flags and keycaps intact.
    const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter(undefined, {granularity:'grapheme'}) : null;
    if (!segmenter) throw Error('This browser needs Unicode grapheme support for variable names. Please use a current browser.');
    for (let i = 0; i < source.length;) {
      const character = String.fromCodePoint(source.codePointAt(i));
      if (/\s/u.test(character)) { i += character.length; continue; }
      if (character === '\\') {
        const command = source.slice(i + 1).match(/^[A-Za-z]+/);
        if (!command || !Object.prototype.hasOwnProperty.call(latexVariables, command[0])) {
          throw Error('Unknown variable command: ' + (command ? '\\' + command[0] : '\\') + '. Use a letter or a command such as \\theta, followed by a space.');
        }
        variables.push(latexVariables[command[0]]);
        i += command[0].length + 1;
      } else {
        const symbol = segmenter.segment(source.slice(i))[Symbol.iterator]().next().value.segment;
        const letter = /^\p{L}\p{M}*$/u.test(symbol);
        const shape = /^[\u25A0-\u25FF\u2B00-\u2BFF\u22C6][\uFE0E\uFE0F]?$/u.test(symbol);
        const emoji = /\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Regional_Indicator}|\u20E3/u.test(symbol);
        if (!letter && !shape && !emoji) throw Error('Use letters, shapes, emoji or supported LaTeX variable commands; separate commands with spaces.');
        variables.push(symbol); i += symbol.length;
      }
    }
    return [...new Set(variables)];
  }
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function applyVariablePreset(value, name) {
    if (!Object.prototype.hasOwnProperty.call(variablePresets, name)) throw Error('Unknown variable preset.');
    if (name === 'clear') return '';
    const present = new Set(uniqueVars(value));
    const additions = uniqueVars(variablePresets[name].symbols).filter(symbol => !present.has(symbol));
    if (!additions.length) return String(value || '');
    return [String(value || '').trim(), additions.join('')].filter(Boolean).join(' ');
  }
  const isEmoji = symbol => /\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Regional_Indicator}|\u20E3/u.test(symbol);
  function formatSymbols(value) {
    const segments = new Intl.Segmenter(undefined, {granularity:'grapheme'}).segment(String(value));
    return Array.from(segments, ({segment}) => isEmoji(segment) ? '<span class="emoji-variable">' + escape(segment) + '</span>' : escape(segment)).join('');
  }
  function formatProblem(problem) {
    if (problem.type !== 'system') return formatSymbols(problem.prompt).replace(/\n/g, '<br>');
    const lines = problem.prompt.split('\n');
    return '<div class="system-equations" role="group" aria-label="System of ' + lines.length + ' equations">' +
      '<svg class="system-brace" viewBox="0 0 16 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M15 1 C6 1 6 5 6 12 L6 43 C6 48 2 50 1 50 C2 50 6 52 6 57 L6 88 C6 95 6 99 15 99"></path></svg>' +
      lines.map(line => '<span class="system-line">' + formatSymbols(line) + '</span>').join('') + '</div>';
  }
  const term = (coefficient, variable) => (Math.abs(coefficient) === 1 ? '' : Math.abs(coefficient)) + variable;
  function expression(coefficients, variables) {
    return coefficients.map((c, i) => {
      if (!c) return '';
      return (c < 0 ? '− ' : '+ ') + term(c, variables[i]);
    }).filter(Boolean).join(' ').replace(/^\+ /, '');
  }
  function makeSingle(variable, settings) {
    const denominator = settings.fractional && Math.random() < .45 ? rand(2, 5) : 1;
    let numerator = rand(1, 9) * (settings.negative && Math.random() < .4 ? -1 : 1);
    if (denominator > 1 && numerator % denominator === 0) numerator += numerator < 0 ? -1 : 1;
    const multiplier = rand(1, 3), rightCoefficient = rand(1, 5);
    const leftCoefficient = rightCoefficient + multiplier * denominator;
    const leftConstant = rand(-9, 9), rightConstant = leftConstant + multiplier * numerator;
    const side = (a, b) => term(a, variable) + (b ? (b < 0 ? ' − ' : ' + ') + Math.abs(b) : '');
    const equation = side(leftCoefficient, leftConstant) + ' = ' + side(rightCoefficient, rightConstant);
    const answer = variable + ' = ' + fraction(numerator, denominator);
    return {type:'linear', variables:[variable], prompt:'Solve:\n' + equation, answer,
      steps:[equation, term(leftCoefficient - rightCoefficient, variable) + ' = ' + (rightConstant - leftConstant), answer],
      leftCoefficient, rightCoefficient, leftConstant, rightConstant, solution:numerator / denominator};
  }
  function makeLiteral(variables, settings) {
    const a = settings.fractional ? rand(2, 5) : 1;
    const coefficients = variables.map((v, i) => i ? rand(1, 8) * (settings.negative && Math.random() < .35 ? -1 : 1) : a);
    const c = rand(8, 30) * (settings.negative && Math.random() < .3 ? -1 : 1);
    const equation = expression(coefficients, variables) + ' = ' + c;
    const numerator = String(c) + coefficients.slice(1).map((b, i) => ' ' + (b < 0 ? '+ ' : '− ') + term(b, variables[i + 1])).join('');
    const answer = variables[0] + ' = ' + (a === 1 ? numerator : '(' + numerator + ')/' + a);
    return { type: 'literal', prompt: 'Solve for ' + variables[0] + ':\n' + equation, answer,
      steps: ['Move the other variable terms to the right:', term(a, variables[0]) + ' = ' + numerator].concat(a === 1 ? [] : ['Divide both sides by ' + a + ':', answer]),
      variables, coefficients, constant: c };
  }
  // Exact rational arithmetic keeps elimination steps free of rounding errors.
  function rational(n, d = 1n) {
    n = BigInt(n); d = BigInt(d);
    if (d < 0n) { n = -n; d = -d; }
    let a = n < 0n ? -n : n, b = d;
    while (b) { const t = a % b; a = b; b = t; }
    return [n / (a || 1n), d / (a || 1n)];
  }
  const sub = (a, b) => rational(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
  const mul = (a, b) => rational(a[0] * b[0], a[1] * b[1]);
  const div = (a, b) => rational(a[0] * b[1], a[1] * b[0]);
  const rationalText = a => String(a[0]) + (a[1] === 1n ? '' : '/' + a[1]);
  function eliminationSteps(matrix, rhs, variables) {
    const m = matrix.map((row, i) => row.concat(rhs[i]).map(x => rational(x)));
    const steps = ['Eliminate:'];
    for (let k = 0; k < m.length; k++) {
      if (!m[k][k][0]) {
        const pivot = m.findIndex((row, i) => i > k && row[k][0]);
        [m[k], m[pivot]] = [m[pivot], m[k]];
        steps.push('Swap rows ' + (k + 1) + ' and ' + (pivot + 1) + '.');
      }
      for (let i = k + 1; i < m.length; i++) {
        if (!m[i][k][0]) continue;
        const factor = div(m[i][k], m[k][k]);
        for (let j = k; j <= m.length; j++) m[i][j] = sub(m[i][j], mul(factor, m[k][j]));
        steps.push('R' + (i + 1) + ' ← R' + (i + 1) + ' − (' + rationalText(factor) + ')R' + (k + 1));
      }
    }
    const solved = [];
    steps.push('Back-substitute:');
    for (let i = m.length - 1; i >= 0; i--) {
      let value = m[i][m.length];
      for (let j = i + 1; j < m.length; j++) value = sub(value, mul(m[i][j], solved[j]));
      solved[i] = div(value, m[i][i]);
      steps.push(variables[i] + ' = ' + rationalText(solved[i]));
    }
    return steps;
  }
  function makeSystem(variables, settings) {
    const n = variables.length;
    const denominator = settings.fractional && Math.random() < .48 ? rand(2, 4) : 1;
    const numerators = variables.map(() => settings.negative ? rand(-8, 8) : rand(1, 9));
    if (denominator > 1 && numerators.every(v => v % denominator === 0)) numerators[0]++;
    // A triangular matrix followed by row additions remains nonsingular.
    const base = variables.map((v, i) => variables.map((w, j) => j < i ? 0 : rand(1, 5)));
    for (let i = n - 1; i > 0; i--) base[i] = base[i].map((v, j) => v + base[i - 1][j]);
    const matrix = base.map(row => row.map(v => v * denominator));
    const rhs = base.map(row => row.reduce((sum, v, j) => sum + v * numerators[j], 0));
    const equations = matrix.map((row, i) => expression(row, variables) + ' = ' + rhs[i]);
    return { type: 'system', prompt: equations.join('\n'),
      answer: variables.map((v, i) => v + ' = ' + fraction(numerators[i], denominator)).join(',  '),
      steps: eliminationSteps(matrix, rhs, variables), matrix, rhs, variables,
      solution: numerators.map(v => v / denominator) };
  }
  function adjustCount(settings, edge, value, minimum = 1) {
    settings[edge] = Math.max(minimum, Math.min(6, Math.trunc(Number(value)) || minimum));
    if (edge === 'countMin' && settings.countMin > settings.countMax) settings.countMax = settings.countMin;
    if (edge === 'countMax' && settings.countMax < settings.countMin) settings.countMin = settings.countMax;
  }
  function shuffle(values) {
    const result = values.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = rand(0, i); [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function balancedVariables(variables) {
    const groups = new Map();
    variables.forEach(variable => {
      let family;
      if (isEmoji(variable)) family = 'emoji';
      else if (!/^\p{L}/u.test(variable)) family = 'shapes';
      else {
        const script = /\p{Script=Latin}/u.test(variable) ? 'Latin' : /\p{Script=Greek}/u.test(variable) ? 'Greek' : /\p{Script=Cyrillic}/u.test(variable) ? 'Cyrillic' : 'other';
        const letterCase = /^\p{Lu}/u.test(variable) ? 'upper' : /^\p{Ll}/u.test(variable) ? 'lower' : 'uncased';
        family = script + '-' + letterCase;
      }
      if (!groups.has(family)) groups.set(family, []);
      groups.get(family).push(variable);
    });
    const queues = shuffle(Array.from(groups.values(), shuffle));
    const result = [];
    // Interleave families so later appended alphabets appear on the same sheet.
    for (let i = 0; result.length < variables.length; i++) {
      queues.forEach(queue => { if (i < queue.length) result.push(queue[i]); });
    }
    return result;
  }
  function generate(kind, settings) {
    const variables = uniqueVars(settings.variables);
    const min = settings.countMin === undefined ? 2 : Number(settings.countMin);
    const max = settings.countMax === undefined ? 2 : Number(settings.countMax);
    const systems = kind === 'systems-drills';
    const minimum = systems ? 2 : 1;
    if (!Number.isInteger(min) || !Number.isInteger(max) || min < minimum || max > 6 || min > max) throw Error('Choose a count range from ' + minimum + ' to 6.');
    if (variables.length < max) throw Error('Enter at least ' + max + ' different letters for the selected range.');
    const count = systems ? (max <= 2 ? 10 : max === 3 ? 6 : max === 4 ? 4 : 2) : (max > 3 ? 6 : 10);
    const pool = balancedVariables(variables);
    let cursor = 0;
    return Array.from({length: count}, () => {
      const n = rand(min, max);
      const chosen = Array.from({length: n}, (_, j) => pool[(cursor + j) % pool.length]);
      cursor += n;
      return systems ? makeSystem(chosen, settings) : n === 1 ? makeSingle(chosen[0], settings) : makeLiteral(chosen, settings);
    });
  }
  function mount(kind, host) {
    const systems = kind === 'systems-drills';
    const title = titles[kind];
    const minimum = systems ? 2 : 1;
    const settings = { variables: defaultVariables, negative: false, fractional: false, countMin: 2, countMax: 2 };
    host.innerHTML = '<div class="preview-layout algebra-preview"><article class="print-sheet dynamic-sheet algebra-sheet">' +
      api.header(title, 'Practice · Algebra', systems ? 'Solve each system. Show your work in the space provided.' : 'Solve each equation. For multiple variables, isolate the indicated variable.', 'algebra-drill-title') +
      '<div class="algebra-drill-grid"></div></article><aside class="drill-controls algebra-controls" aria-label="Worksheet controls"><div class="sheet-actions"><button type="button" class="algebra-print print-action">Print</button><button type="button" class="algebra-regenerate help-action">Regenerate</button><button type="button" class="algebra-reset clear-action">Reset</button></div><h2>Customize</h2><fieldset><legend>Allowable variables</legend><label class="variable-input-label" for="algebra-variables">Variable names</label><input id="algebra-variables" class="variable-input" type="text" spellcheck="false" value="' + settings.variables + '" aria-describedby="variable-help"><label class="full-color-emoji-option"><input type="checkbox" data-color-emoji disabled> Full Color Emoji</label><details class="variable-presets"><summary>Variable presets</summary><div class="variable-preset-buttons">' + Object.keys(variablePresets).map(name => '<button type="button" data-variable-preset="' + name + '">' + variablePresets[name].label + '</button>').join('') + '</div></details><small id="variable-help">Letters (case-sensitive), shapes and emoji can be combined; worksheets mix the available sets; spaces between letters are ignored. Separate LaTeX commands with spaces (for example: x \\theta \\chi). Enter enough distinct variables for the selected maximum. Emoji use outlines unless Full Color Emoji is on.</small></fieldset>' +
      '<fieldset><legend>' + (systems ? 'System size' : 'Variable count') + '</legend>' + ['countMin', 'countMax'].map((edge, i) => '<label class="digit-control"><span>' + (i ? 'Maximum' : 'Minimum') + '</span><span class="digit-stepper"><input type="number" min="' + minimum + '" max="6" value="2" data-count="' + edge + '" aria-label="' + (systems ? 'System size' : 'Variable count') + (i ? ' maximum' : ' minimum') + '"><span><button type="button" data-edge="' + edge + '" data-step="1" aria-label="Increase ' + (i ? 'maximum' : 'minimum') + '">▲</button><button type="button" data-edge="' + edge + '" data-step="-1" aria-label="Decrease ' + (i ? 'maximum' : 'minimum') + '">▼</button></span></span></label>').join('') + '<small>' + (systems ? 'Variables and equations per system.' : 'Variables per equation.') + ' Range: ' + minimum + '–6.</small></fieldset>' + '<fieldset class="algebra-options"><legend>Solutions</legend><label><input type="checkbox" data-negative> Allow negative solutions</label><label><input type="checkbox" data-fractional> Allow fractional solutions</label></fieldset><p class="drill-status" role="status"></p><label class="print-key-option"><input type="checkbox" data-print-key> Print with key</label><label class="solutions-option"><input type="checkbox" data-solutions disabled> With solutions</label><p class="print-key-note">Two print dialogs: worksheet, then matching answer key.</p></aside></div>';
    const grid = host.querySelector('.algebra-drill-grid');
    const status = host.querySelector('.drill-status');
    const variableInput = host.querySelector('#algebra-variables');
    let current = [], printing = false, preparingPrint = false;
    function render() {
      settings.variables = variableInput.value;
      settings.negative = host.querySelector('[data-negative]').checked;
      settings.fractional = host.querySelector('[data-fractional]').checked;
      try {
        current = generate(kind, settings);
        const colorEmoji = host.querySelector('[data-color-emoji]');
        colorEmoji.disabled = !uniqueVars(settings.variables).some(isEmoji);
        if (colorEmoji.disabled) colorEmoji.checked = false;
        host.querySelector('.algebra-sheet').classList.toggle('color-emoji', colorEmoji.checked);
        grid.innerHTML = current.map((p, i) => '<section class="algebra-problem"><span class="problem-index">' + (i + 1) + '.</span><div class="algebra-prompt">' + formatProblem(p) + '</div><div class="algebra-workspace"></div></section>').join('');
        const columns = settings.countMax > (systems ? 4 : 3) ? 1 : 2;
        grid.style.setProperty('--algebra-columns', columns);
        grid.style.setProperty('--algebra-rows', current.length / columns);
        grid.classList.toggle('large-systems', systems && settings.countMax > 3);
        host.dataset.valid = 'true';
        status.textContent = systems ? current.length + ' systems, each with a unique solution.' : current.length + ' equations to solve.';
      } catch (error) {
        current = []; grid.innerHTML = ''; host.dataset.valid = 'false'; status.textContent = error.message;
        const colorEmoji = host.querySelector('[data-color-emoji]'); colorEmoji.disabled = true; colorEmoji.checked = false;
        host.querySelector('.algebra-sheet').classList.toggle('color-emoji', false);
      }
    }
    function syncCount() {
      host.querySelectorAll('[data-count]').forEach(input => { input.value = settings[input.dataset.count]; });
      host.querySelectorAll('[data-step]').forEach(button => {
        button.disabled = Number(button.dataset.step) > 0 ? settings[button.dataset.edge] >= 6 : settings[button.dataset.edge] <= minimum;
      });
    }
    host.querySelectorAll('[data-count]').forEach(input => input.addEventListener('change', () => {
      adjustCount(settings, input.dataset.count, input.value, minimum); syncCount(); render();
    }));
    host.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
      adjustCount(settings, button.dataset.edge, settings[button.dataset.edge] + Number(button.dataset.step), minimum); syncCount(); render();
    }));
    syncCount();
    variableInput.addEventListener('change', render);
    variableInput.addEventListener('input', () => { host.dataset.valid = 'false'; status.textContent = 'Update the variable list to regenerate the worksheet.'; });
    host.querySelectorAll('[data-negative], [data-fractional]').forEach(input => input.addEventListener('change', render));
    host.querySelectorAll('[data-variable-preset]').forEach(button => button.addEventListener('click', () => {
      try {
        variableInput.value = applyVariablePreset(variableInput.value, button.dataset.variablePreset);
        render();
      } catch (error) { host.dataset.valid = 'false'; status.textContent = error.message; }
    }));
    host.querySelector('[data-color-emoji]').addEventListener('change', () => {
      host.querySelector('.algebra-sheet').classList.toggle('color-emoji', host.querySelector('[data-color-emoji]').checked);
    });
    host.querySelector('.algebra-regenerate').addEventListener('click', render);
    host.querySelector('.algebra-reset').addEventListener('click', () => {
      variableInput.value = defaultVariables;
      settings.countMin = settings.countMax = 2; syncCount();
      host.querySelector('[data-color-emoji]').checked = false;
      host.querySelector('[data-negative]').checked = false;
      host.querySelector('[data-fractional]').checked = false;
      host.querySelector('[data-print-key]').checked = false;
      host.querySelector('[data-solutions]').checked = false;
      host.querySelector('[data-solutions]').disabled = true;
      render();
    });
    host.querySelector('[data-print-key]').addEventListener('change', function () {
      host.querySelector('[data-solutions]').disabled = !this.checked;
      if (!this.checked) host.querySelector('[data-solutions]').checked = false;
    });
    host.querySelector('.algebra-print').addEventListener('click', async () => {
      if (printing || preparingPrint) return;
      if (document.fonts && document.fonts.load) {
        preparingPrint = true;
        try {
          const family = host.querySelector('[data-color-emoji]').checked ? 'OpenMoji Color' : 'OpenMoji Black';
          if (!host.querySelector('[data-color-emoji]').disabled) await document.fonts.load('16px "' + family + '"');
          await document.fonts.ready;
        } catch (error) { status.textContent = 'The emoji font could not load. Please retry before printing.'; return; }
        finally { preparingPrint = false; }
      }
      if (host.dataset.valid === 'false') { status.textContent = 'Regenerate the worksheet before printing.'; return; }
      if (!host.querySelector('[data-print-key]').checked) { window.print(); return; }
      const article = host.querySelector('.algebra-sheet');
      const key = article.cloneNode(true); key.classList.add('answer-key-sheet');
      key.querySelector('.sheet-wordmark span').textContent += ' · Answer Key';
      const withSolutions = host.querySelector('[data-solutions]').checked;
      key.querySelectorAll('.algebra-problem').forEach((problem, i) => {
        const p = current[i];
        const answer = document.createElement('div'); answer.className = 'algebra-answer'; answer.innerHTML = formatSymbols(p.answer); problem.appendChild(answer);
        if (withSolutions) { const steps = document.createElement('pre'); steps.className = 'algebra-worked'; steps.innerHTML = formatSymbols(p.steps.join('\n')); problem.appendChild(steps); }
      });
      const controls = Array.from(host.querySelectorAll('input, button'), el => [el, el.disabled]);
      controls.forEach(([el]) => { el.disabled = true; });
      printing = true;
      const restore = () => { key.remove(); article.hidden = false; article.classList.remove('worksheet-hidden'); printing = false; controls.forEach(([el, disabled]) => { el.disabled = disabled; }); };
      try { api.sequentialPrint(() => { article.classList.add('worksheet-hidden'); article.after(key); }, restore); } catch (error) { restore(); status.textContent = 'Printing could not start. Please try again.'; }
    });
    render();
  }
  const oldMount = api.mount;
  api.mount = function (kind, host) { if (titles[kind]) mount(kind, host); else oldMount(kind, host); };
  api.applyAlgebraVariablePreset = applyVariablePreset;
  api.algebraVariablePresets = variablePresets;
  api.formatAlgebraProblem = formatProblem;
  api.formatAlgebraSymbols = formatSymbols;
  api.parseAlgebraVariables = uniqueVars;
  api.generateAlgebra = generate;
  api.adjustAlgebraCount = adjustCount;
}());
