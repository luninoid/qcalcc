(function(){
  "use strict";
  function esc(value){return String(value).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];});}
  function mathHTML(value){
    function inline(text){return esc(text).replace(/(?:sqrt|√)\(([^()]+)\)/gi,'<span class="math-root"><span>√</span><span>$1</span></span>')
      .replace(/(?:cbrt|∛)\(([^()]+)\)/gi,'<span class="math-root cube"><span>∛</span><span>$1</span></span>')
      .replace(/√([^\s+−;,]+)/g,'<span class="math-root"><span>√</span><span>$1</span></span>')
      .replace(/∛([^\s+−;,]+)/g,'<span class="math-root cube"><span>∛</span><span>$1</span></span>')
      .replace(/\^\(?([A-Za-z0-9+−-]+)\)?/g,'<sup>$1</sup>');}
    var text=String(value),fraction=text.match(/^(.*?)(\([^()]+\)|[−-]?[A-Za-z0-9√∛.]+)\s*\/\s*(\([^()]+\)|[A-Za-z0-9√∛.]+)(.*)$/),safe=fraction?inline(fraction[1])+'<span class="math-frac"><span>'+inline(fraction[2])+'</span><span>'+inline(fraction[3])+'</span></span>'+inline(fraction[4]):inline(text);
    return '<span class="typeset-math">'+safe+'</span>';
  }
  function parseFunction(source){var args=window.QCAL_TAPE_ADVANCED.splitArgs(source),expression=args[0].trim().replace(/^[fy]\s*\(\s*x\s*\)\s*=\s*/i,"").replace(/^y\s*=\s*/i,""),variable=args[1]||"x";if(!expression||!/^[A-Za-z]$/.test(variable))return null;try{return {node:window.math.parse(window.QCAL_TAPE_ADVANCED.normalizeAlgebra(expression)),expression:expression,variable:variable};}catch(e){return null;}}
  function graph(source,options){
    options=options||{};
    var fn=parseFunction(source);if(!fn)return null;
    var scope={},values=[],xMin=-10,xMax=10,i;
    function yAt(x){try{scope[fn.variable]=x;var y=fn.node.evaluate(scope);return typeof y==="number"&&Number.isFinite(y)?y:null;}catch(e){return null;}}
    var ym1=yAt(-1),y0=yAt(0),y1=yAt(1),y2=yAt(2);if([ym1,y0,y1,y2].every(Number.isFinite)){var qa=(y1+ym1-2*y0)/2,qb=(y1-ym1)/2;if(Math.abs((y2-(4*qa+2*qb+y0)))<1e-7&&Math.abs(qa)>1e-10){var vx=-qb/(2*qa),span=Math.max(3,Math.min(12,4/Math.sqrt(Math.abs(qa))));xMin=Math.min(0,vx-span);xMax=Math.max(0,vx+span);}}
    for(i=0;i<=400;i++){var x=xMin+(xMax-xMin)*i/400,y=yAt(x);if(y!==null&&Math.abs(y)<1e5)values.push({x:x,y:y});}
    if(values.length<2)return null;
    var ys=values.map(function(p){return p.y;}).sort(function(a,b){return a-b;}),lo=ys[Math.floor(ys.length*.05)],hi=ys[Math.floor(ys.length*.95)];if(!(hi>lo)){lo-=1;hi+=1;}var margin=(hi-lo)*.15,yMin=Math.min(0,lo-margin),yMax=Math.max(0,hi+margin),w=520,h=270,pad=18;
    function px(x){return pad+(x-xMin)/(xMax-xMin)*(w-2*pad);}function py(y){return pad+(yMax-y)/(yMax-yMin)*(h-2*pad);}
    var path="",drawing=false,roots=[],previous=null;values.forEach(function(p){if(p.y<yMin*2-Math.abs(yMax)||p.y>yMax*2+Math.abs(yMin)){drawing=false;previous=null;return;}path+=(drawing?"L":"M")+px(p.x).toFixed(1)+" "+py(p.y).toFixed(1)+" ";drawing=true;if(previous&&previous.y*p.y<0)roots.push((previous.x+p.x)/2);previous=p;});
    var extrema=[];for(i=1;i<values.length-1;i++){var a=values[i-1],b=values[i],c=values[i+1];if((b.y<a.y&&b.y<c.y)||(b.y>a.y&&b.y>c.y))if(!extrema.length||Math.abs(b.x-extrema[extrema.length-1].x)>.25)extrema.push(b);}
    var labels=(options.labels===false?extrema.slice(0,1).map(function(p){return '<circle class="plot-extremum" cx="'+px(p.x).toFixed(1)+'" cy="'+py(p.y).toFixed(1)+'" r="3"/>';}).join(""):roots.slice(0,6).map(function(x){return '<g class="plot-label"><circle cx="'+px(x).toFixed(1)+'" cy="'+py(0).toFixed(1)+'" r="3"/><text x="'+(px(x)+5).toFixed(1)+'" y="'+(py(0)-6).toFixed(1)+'">('+window.QCAL_TAPE_ADVANCED.rationalText(x)+', 0)</text></g>';}).join("")+extrema.slice(0,6).map(function(p){return '<g class="plot-label"><circle cx="'+px(p.x).toFixed(1)+'" cy="'+py(p.y).toFixed(1)+'" r="3"/><text x="'+(px(p.x)+5).toFixed(1)+'" y="'+(py(p.y)-6).toFixed(1)+'">('+window.QCAL_TAPE_ADVANCED.rationalText(p.x)+', '+window.QCAL_TAPE_ADVANCED.rationalText(p.y)+')</text></g>';}).join(""));
    var html='<figure class="tape-visual'+(options.className?' '+esc(options.className):'')+'"><svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Graph of '+esc(fn.expression)+'"><rect x=".5" y=".5" width="'+(w-1)+'" height="'+(h-1)+'"/><line class="plot-axis" x1="'+pad+'" y1="'+py(0)+'" x2="'+(w-pad)+'" y2="'+py(0)+'"/><line class="plot-axis" x1="'+px(0)+'" y1="'+pad+'" x2="'+px(0)+'" y2="'+(h-pad)+'"/><path class="plot-curve" d="'+path+'"/>'+labels+'</svg><figcaption>'+(options.caption?esc(options.caption):'automatic window · intercepts and extrema labeled')+'</figcaption></figure>';
    return {text:"Graph of "+fn.expression,html:html};
  }
  function normalizeSet(source){return String(source).replace(/\bU\b|∪/g," ∪ ").replace(/\bintersection\b|∩/gi," ∩ ").trim();}
  function numline(source){
    var text=normalizeSet(source),domain=text.match(/^domain\s+(.+)$/i);if(domain)text=window.QCAL_TAPE_ADVANCED.domain(domain[1]);
    var w=520,h=92,pad=28,parts=text.split(/\s+(∪|∩)\s+/),marks=[],segments=[],finite=[],i;
    function addInterval(item,row){var m=item.trim().match(/^([([])\s*([^,]+)\s*,\s*([^\])]+)\s*([\])])$/);if(!m)return false;var left=m[2],right=m[3],a=/∞/.test(left)?-10:Number(left),b=/∞/.test(right)?10:Number(right);if(!Number.isFinite(a)||!Number.isFinite(b))return false;if(!/∞/.test(left))finite.push(a);if(!/∞/.test(right))finite.push(b);segments.push({a:a,b:b,left:m[1],right:m[4],row:row,leftInf:/∞/.test(left),rightInf:/∞/.test(right)});return true;}
    for(i=0;i<parts.length;i+=2)if(!addInterval(parts[i],i/2)){var m=parts[i].match(/^x\s*(<=|>=|<|>|≤|≥)\s*([+-]?\d+(?:\.\d+)?)$/i);if(!m)return null;var n=Number(m[2]),less=m[1]==="<"||m[1]==="<="||m[1]==="≤";segments.push({a:less?-10:n,b:less?n:10,left:less?"(":(m[1].indexOf("=")>=0||m[1]==="≥"?"[":"("),right:less?(m[1].indexOf("=")>=0||m[1]==="≤"?"]":")"):")",leftInf:less,rightInf:!less,row:i/2});finite.push(n);}
    var extent=Math.max(5,finite.reduce(function(max,n){return Math.max(max,Math.abs(n)+2);},0));function px(x){return pad+(x+extent)/(2*extent)*(w-2*pad);}var body=segments.map(function(s){var y=42+s.row*18,a=s.leftInf?-extent:s.a,b=s.rightInf?extent:s.b;return '<line class="numline-set" x1="'+px(a)+'" y1="'+y+'" x2="'+px(b)+'" y2="'+y+'"/>'+(!s.leftInf?'<circle class="'+(s.left==="["?"closed":"open")+'" cx="'+px(s.a)+'" cy="'+y+'" r="5"/>':'')+(!s.rightInf?'<circle class="'+(s.right==="]"?"closed":"open")+'" cx="'+px(s.b)+'" cy="'+y+'" r="5"/>':'');}).join("");
    return {text:text,html:'<figure class="tape-visual numline"><svg viewBox="0 0 '+w+' '+(h+Math.max(0,segments.length-1)*18)+'"><line class="plot-axis" x1="'+pad+'" y1="42" x2="'+(w-pad)+'" y2="42"/>'+body+'</svg><figcaption>'+esc(text)+'</figcaption></figure>'};
  }
  function interval(source){
    var s=String(source).trim(),m=s.match(/^x\s*(<=|>=|<|>|≤|≥)\s*([+-]?\d+(?:\.\d+)?)$/i);if(!m)return /^[([][^,]+,[^\])]+[\])]$/.test(s)?s:null;var closed=m[1].indexOf("=")>=0||m[1]==="≤"||m[1]==="≥",less=m[1][0]==="<"||m[1]==="≤";return less?"(−∞, "+m[2]+(closed?"]":")"):(closed?"[":"(")+m[2]+", ∞)";
  }
  function algebraic(source){var s=String(source).trim(),m=s.match(/^([([])\s*([^,]+)\s*,\s*([^\])]+)\s*([\])])$/);if(!m)return /[<>≤≥]/.test(s)?s:null;var left=/−?∞/.test(m[2])?null:(m[1]==="["?m[2]+" ≤ x":m[2]+" < x"),right=/∞/.test(m[3])?null:(m[4]==="]"?"x ≤ "+m[3]:"x < "+m[3]);return [left,right].filter(Boolean).join(" and ")||"All real numbers";}
  function solveInequality(source){
    var m=String(source).replace(/\s+/g,"").match(/^([+-]?(?:\d*\.?\d+)?)\*?x([+-]\d*\.?\d+)?(<=|>=|<|>|≤|≥)([+-]?\d+(?:\.\d+)?)$/i);if(!m)return null;var a=m[1];a=a===""||a==="+"?1:a==="-"?-1:Number(a);if(!a)return null;var b=Number(m[2]||0),n=(Number(m[4])-b)/a,op=m[3];if(a<0)op={"<":">",">":"<","<=":">=",">=":"<=","≤":"≥","≥":"≤"}[op];return "x "+op.replace("<=","≤").replace(">=","≥")+" "+window.QCAL_TAPE_ADVANCED.rationalText(n);}
  window.QCAL_TAPE_VISUAL={mathHTML:mathHTML,graph:graph,numline:numline,interval:interval,algebraic:algebraic,solveInequality:solveInequality};
}());
