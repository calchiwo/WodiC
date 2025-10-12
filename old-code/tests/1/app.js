/* app.js — main logic for WodiC */
const exprEl = document.getElementById('expression');
const resEl = document.getElementById('result');
let expr = '';
let degMode = true; // DEG by default
let invMode = false;

function updateScreen(){
  exprEl.textContent = expr || '';
}

function setResult(val){
  resEl.textContent = String(val);
}

function safeReplace(text){
  return text.replace(/×/g,'*').replace(/÷/g,'/').replace(/π/g,'pi');
}

function insert(token){
  if(token === 'pi') token = 'pi';
  expr += token;
  updateScreen();
}

function backspace(){
  expr = expr.slice(0,-1);
  updateScreen();
}

function clearAll(){
  expr = '';
  setResult(0);
  updateScreen();
}

function factorial(n){
  n = Math.floor(n);
  if(n < 0) return NaN;
  let f = 1;
  for(let i=2;i<=n;i++) f*=i;
  return f;
}

function applyFunction(fnName, arg){
  const x = Number(arg);
  if(isNaN(x)) return NaN;
  const a = degMode && (fnName==='sin' || fnName==='cos' || fnName==='tan' || fnName==='asin' || fnName==='acos' || fnName==='atan') ? x * Math.PI/180 : x;
  switch(fnName){
    case 'sin': return Math.sin(a);
    case 'cos': return Math.cos(a);
    case 'tan': return Math.tan(a);
    case 'asin': return degMode ? Math.asin(a) * 180/Math.PI : Math.asin(a);
    case 'acos': return degMode ? Math.acos(a) * 180/Math.PI : Math.acos(a);
    case 'atan': return degMode ? Math.atan(a) * 180/Math.PI : Math.atan(a);
    case 'ln': return Math.log(x);
    case 'log': return Math.log10 ? Math.log10(x) : Math.log(x)/Math.LN10;
    case 'sqrt': return Math.sqrt(x);
    default: return NaN;
  }
}

function evaluateExpression(source){
  if(!source) return 0;
  // replace common tokens
  let s = source.replace(/π/g,'Math.PI').replace(/e/g,'Math.E');
  s = s.replace(/×/g,'*').replace(/÷/g,'/').replace(/–/g,'-');
  // handle power ^ => Math.pow(a,b)
  s = s.replace(/(\d|\))\s*\^\s*(\d|\()/g, function(_,a,b){return a + ' ** ' + b});

  // handle percent — if trailing number after operator, treat as number/100
  s = s.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

  // handle factorial n!
  s = s.replace(/(\d+)\s*!/g, function(_,n){return factorial(Number(n));});

  // handle functions (sin|cos|tan|ln|log|sqrt)
  // We'll map a simple pattern function(arg)
  s = s.replace(/\b(sin|cos|tan|asin|acos|atan|ln|log|sqrt)\s*\(([^)]+)\)/g, function(_,fn,arg){
    // evaluate inner arg recursively
    const val = evaluateExpression(arg);
    const out = applyFunction(fn, val);
    return '('+out+')';
  });

  try{
    // Evaluate using Function (exposing Math only)
    // allow ** operator in modern browsers; if unsupported, users will see errors.
    const fn = new Function('Math','return ('+s+')');
    return fn(Math);
  }catch(e){
    return 'Error';
  }
}

// central event handling
document.addEventListener('click', e =>{
  const t = e.target.closest('button');
  if(!t) return;
  if(t.id === 'clear'){ clearAll(); return; }
  if(t.id === 'back'){ backspace(); return; }
  if(t.id === 'equals'){
    const value = evaluateExpression(expr);
    setResult(value);
    return;
  }
  if(t.dataset.insert){
    const token = t.dataset.insert;
    insert(token);
    return;
  }
  if(t.dataset.fn){
    const fn = t.dataset.fn;
    // apply on last number or evaluate as function around whole expression
    // simple strategy: if there's a trailing number or parenthesis, wrap it
    if(/\d$|\)$/.test(expr)){
      expr = expr + fn + '(';
      // if user expects to compute immediately, we try to compute: append closing ) and compute
      expr += ')';
      updateScreen();
    }else{
      // just append fn(
      expr += fn + '(';
      updateScreen();
    }
    return;
  }
});

// toggle DEG/INV
document.getElementById('degToggle').addEventListener('click', (e)=>{
  degMode = !degMode;
  e.target.textContent = degMode ? 'DEG' : 'RAD';
});

document.getElementById('invToggle').addEventListener('click', (e)=>{
  invMode = !invMode;
  e.target.textContent = invMode ? 'INV' : 'INV';
  // flip sin/cos/tan to inverse labels (visual only)
  document.querySelectorAll('[data-fn]').forEach(btn=>{
    if(btn.dataset.fn === 'sin') btn.textContent = invMode ? 'sin⁻¹' : 'sin';
    if(btn.dataset.fn === 'cos') btn.textContent = invMode ? 'cos⁻¹' : 'cos';
    if(btn.dataset.fn === 'tan') btn.textContent = invMode ? 'tan⁻¹' : 'tan';
  });
  // change behavior
  document.querySelectorAll('[data-fn]').forEach(btn=>{
    if(btn.dataset.fn === 'sin') btn.dataset.fn = invMode ? 'asin' : 'sin';
    if(btn.dataset.fn === 'cos') btn.dataset.fn = invMode ? 'acos' : 'cos';
    if(btn.dataset.fn === 'tan') btn.dataset.fn = invMode ? 'atan' : 'tan';
  });
});

// simple install prompt logic
let deferredPrompt;
const installBanner = document.getElementById('installPrompt');
const installBtn = document.getElementById('installBtn');
const dismissInstall = document.getElementById('dismissInstall');

window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  installBanner.classList.remove('hidden');
});
installBtn.addEventListener('click', async ()=>{
  installBanner.classList.add('hidden');
  if(deferredPrompt){
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
  }
});
dismissInstall.addEventListener('click', ()=>installBanner.classList.add('hidden'));

// Service worker registration & update notification
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/sw.js').then(reg =>{
    // listen for updates
    reg.addEventListener('updatefound', ()=>{
      const newWorker = reg.installing;
      newWorker.addEventListener('statechange', ()=>{
        if(newWorker.state === 'installed' && navigator.serviceWorker.controller){
          // show update available
          if(confirm('Update available — install now?')){
            newWorker.postMessage({action:'skipWaiting'});
            window.location.reload();
          }
        }
      });
    });
  }).catch(()=>{});

  navigator.serviceWorker.addEventListener('controllerchange', ()=>{
    // new SW took control
  });
}

// keyboard support
window.addEventListener('keydown', e =>{
  if(e.key === 'Enter') document.getElementById('equals').click();
  if(e.key === 'Backspace') document.getElementById('back').click();
  if(/[0-9\.\+\-\*\/\^\(\)%]/.test(e.key)){
    insert(e.key);
  }
});

// initial
clearAll();
