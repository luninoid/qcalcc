(function () {
  "use strict";
  var help="Sorry, I cannot solve that. I can solve polynomial equations through degree four, linear inequalities, basic absolute-value and radical equations, linear symbolic isolation, polynomial analysis, derivatives and integrals, algebraic expansion, and partial fractions with linear factors.";
  function parseSide(source){
    var text=source.replace(/[−–]/g,"-").replace(/\s+/g,"").replace(/\*/g,"").replace(/X/g,"x"),coefficients=[0,0,0,0,0],terms;
    if(!text||!/^[0-9x.+\-^]+$/.test(text))return null;
    if(text[0]!=="+"&&text[0]!=="-")text="+"+text;
    terms=text.match(/[+-][^+-]+/g);
    if(!terms||terms.join("")!==text)return null;
    for(var i=0;i<terms.length;i++){
      var sign=terms[i][0]==="-"?-1:1,body=terms[i].slice(1),power=0,value;
      if(body.indexOf("x")!==-1){
        var pieces=body.split("x");
        if(pieces.length!==2)return null;
        value=pieces[0]===""?1:Number(pieces[0]);
        if(pieces[1]==="")power=1;
        else if(/^\^[0-4]$/.test(pieces[1]))power=Number(pieces[1].slice(1));
        else return null;
      }else value=Number(body);
      if(!Number.isFinite(value))return null;
      coefficients[power]+=sign*value;
    }
    return coefficients;
  }
  function nice(value){if(Math.abs(value)<1e-9)value=0;if(Math.abs(value-Math.round(value))<1e-8)return String(Math.round(value));return Number(value.toPrecision(9)).toString();}
  function rational(value){
    if(Math.abs(value-Math.round(value))<1e-8)return String(Math.round(value));
    for(var denominator=2;denominator<=1000;denominator++){
      var numerator=Math.round(value*denominator);
      if(Math.abs(value-numerator/denominator)<1e-9)return numerator+"/"+denominator;
    }
    return nice(value);
  }
  function add(a,b){return {re:a.re+b.re,im:a.im+b.im};}
  function sub(a,b){return {re:a.re-b.re,im:a.im-b.im};}
  function mul(a,b){return {re:a.re*b.re-a.im*b.im,im:a.re*b.im+a.im*b.re};}
  function div(a,b){var d=b.re*b.re+b.im*b.im;if(d<1e-24)d=1e-24;return {re:(a.re*b.re+a.im*b.im)/d,im:(a.im*b.re-a.re*b.im)/d};}
  function polynomial(coefficients,z){var value={re:coefficients[coefficients.length-1],im:0};for(var i=coefficients.length-2;i>=0;i--)value=add(mul(value,z),{re:coefficients[i],im:0});return value;}
  function complexRoots(coefficients){
    var degree=coefficients.length-1,lead=coefficients[degree],normalized=coefficients.map(function(value){return value/lead;}),radius=1+Math.max.apply(null,normalized.slice(0,-1).map(Math.abs)),roots=[];
    for(var k=0;k<degree;k++){var angle=2*Math.PI*(k+.25)/degree;roots.push({re:radius*Math.cos(angle),im:radius*Math.sin(angle)});}
    for(var iteration=0;iteration<200;iteration++){
      var next=[],largest=0;
      for(var i=0;i<degree;i++){
        var denominator={re:1,im:0};
        for(var j=0;j<degree;j++)if(i!==j)denominator=mul(denominator,sub(roots[i],roots[j]));
        var delta=div(polynomial(normalized,roots[i]),denominator),updated=sub(roots[i],delta);
        largest=Math.max(largest,Math.hypot(delta.re,delta.im));next.push(updated);
      }
      roots=next;if(largest<1e-11)break;
    }
    return roots;
  }
  function formatRoot(root){
    var re=Math.abs(root.re)<1e-7?0:root.re,im=Math.abs(root.im)<1e-7?0:root.im;
    if(im===0)return rational(re);
    if(re===0)return rational(im)+"i";
    return rational(re)+(im<0?" − ":" + ")+rational(Math.abs(im))+"i";
  }
  function symbolicSolve(source,variable){
    if(!window.math||!/^[A-Za-z][A-Za-z0-9_]*$/.test(variable))return null;
    var sides=source.split("=");if(sides.length>2)return null;
    try{
      var expression="("+sides[0]+")-("+(sides[1]||"0")+")",derivative=window.math.simplify(window.math.derivative(expression,variable)),dText=derivative.toString();
      if(new RegExp("\\b"+variable+"\\b").test(dText))return null;
      var remainder=window.math.simplify("("+expression+")-("+dText+")*"+variable),rText=remainder.toString();
      if(dText==="0")return window.math.simplify(expression).toString()==="0"?"All real numbers":"No solution";
      return variable+" = "+window.QCAL_TAPE_ADVANCED.pretty(window.math.simplify("-("+rText+")/("+dText+")").toString());
    }catch(e){return null;}
  }
  function solve(source){
    var requested="x",depth=0,split=-1;
    for(var q=0;q<source.length;q++){if(source[q]==="(")depth++;else if(source[q]===")")depth--;else if(source[q]===","&&depth===0)split=q;}
    if(split!==-1){requested=source.slice(split+1).trim();source=source.slice(0,split).trim();var symbolic=symbolicSolve(source,requested);return symbolic||help;}
    var special=source.replace(/\s+/g,"").match(/^(abs|sqrt|cbrt)\((x(?:[+-]\d+(?:\.\d+)?)?)\)=([+-]?\d+(?:\.\d+)?)$/i);
    if(special){var kind=special[1].toLowerCase(),shift=Number((special[2].match(/[+-]\d+(?:\.\d+)?$/)||[0])[0]),target=Number(special[3]);if(kind!=="cbrt"&&target<0)return "No solution";if(kind==="abs")return target===0?"x = "+rational(-shift):"x = "+[target-shift,-target-shift].sort(function(a,b){return a-b;}).map(rational).join(", ");if(kind==="sqrt")return "x = "+rational(target*target-shift);return "x = "+rational(target*target*target-shift);}
    var sides=source.split("=");
    if(sides.length>2)return help;
    var left=parseSide(sides[0]),right=parseSide(sides.length===2?sides[1]:"0");
    if(!left||!right)return help;
    var coefficients=left.map(function(value,index){return value-right[index];}),degree=4;
    while(degree>0&&Math.abs(coefficients[degree])<1e-12)degree--;
    coefficients=coefficients.slice(0,degree+1);
    if(degree===0)return Math.abs(coefficients[0])<1e-12?"All real numbers":"No solution";
    var roots;
    if(degree===1)roots=[{re:-coefficients[0]/coefficients[1],im:0}];
    else if(degree===2){
      var a=coefficients[2],b=coefficients[1],c=coefficients[0],discriminant=b*b-4*a*c;
      if(discriminant>=0)roots=[{re:(-b+Math.sqrt(discriminant))/(2*a),im:0},{re:(-b-Math.sqrt(discriminant))/(2*a),im:0}];
      else roots=[{re:-b/(2*a),im:Math.sqrt(-discriminant)/(2*Math.abs(a))},{re:-b/(2*a),im:-Math.sqrt(-discriminant)/(2*Math.abs(a))}];
    }else roots=complexRoots(coefficients);
    roots.sort(function(x,y){var real=x.re-y.re;return Math.abs(real)>1e-7?real:x.im-y.im;});
    var formatted=[];roots.forEach(function(root){var value=formatRoot(root);if(formatted.indexOf(value)===-1)formatted.push(value);});
    return "x "+(degree>2?"≈":"=")+" "+formatted.join(", ");
  }
  window.QCAL_EQUATION_SOLVER={solve:solve,help:help};
}());
