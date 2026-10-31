(function () {
  "use strict";

  function gcd(a,b){a=a<0n?-a:a;b=b<0n?-b:b;while(b){var t=a%b;a=b;b=t;}return a;}
  function fraction(n,d){if(d===0n)throw new Error("division by zero");if(d<0n){n=-n;d=-d;}var common=gcd(n,d);return {n:n/common,d:d/common};}
  function add(a,b){return fraction(a.n*b.d+b.n*a.d,a.d*b.d);}
  function subtract(a,b){return fraction(a.n*b.d-b.n*a.d,a.d*b.d);}
  function multiply(a,b){return fraction(a.n*b.n,a.d*b.d);}
  function divide(a,b){return fraction(a.n*b.d,a.d*b.n);}
  function decimal(value){var parts=value.split(".");if(parts.length===1)return fraction(BigInt(value),1n);var scale=10n**BigInt(parts[1].length);return fraction(BigInt(parts[0]+parts[1]),scale);}
  function mixed(value){var negative=value.n<0n,n=negative?-value.n:value.n,whole=n/value.d,remainder=n%value.d,sign=negative?"−":"";if(remainder===0n)return sign+whole;if(whole===0n)return sign+remainder+"/"+value.d;return sign+whole+" "+remainder+"/"+value.d;}

  function exactFraction(expression){
    var compact=expression.replace(/\s+/g,"");
    if(compact.indexOf("/")<0||!/^[\d.+\-*/()]+$/.test(compact))return null;
    var tokens=compact.match(/\d+(?:\.\d+)?|[()+\-*/]/g)||[];
    if(tokens.join("")!==compact)return null;
    var at=0;
    function primary(){var token=tokens[at++];if(token==="+")return primary();if(token==="-"){var value=primary();return fraction(-value.n,value.d);}if(token==="("){var value=expressionLevel();if(tokens[at++]!==")")throw new Error("missing parenthesis");return value;}if(!/^\d/.test(token||""))throw new Error("number expected");return decimal(token);}
    function term(){var value=primary();while(tokens[at]==="*"||tokens[at]==="/"){var op=tokens[at++],right=primary();value=op==="*"?multiply(value,right):divide(value,right);}return value;}
    function expressionLevel(){var value=term();while(tokens[at]==="+"||tokens[at]==="-"){var op=tokens[at++],right=term();value=op==="+"?add(value,right):subtract(value,right);}return value;}
    try{var result=expressionLevel();return at===tokens.length?mixed(result):null;}catch{return null;}
  }

  function formatBase(value,radix){
    var number=Number(value);
    if(!Number.isSafeInteger(number))return null;
    return (number<0?"−":"")+Math.abs(number).toString(radix).toUpperCase();
  }

  function rootParts(value,index){
    var number=Number(value),negative=number<0,outside=1,inside=1,n,power,prime;
    if(!Number.isSafeInteger(number)||Math.abs(number)>1e12||index===2&&negative)return null;
    n=Math.abs(number);
    if(n===0)return {negative:false,outside:0,inside:1};
    for(prime=2;prime*prime<=n;prime++){
      if(n%prime)continue;
      power=0;
      while(n%prime===0){n/=prime;power++;}
      outside*=prime**Math.floor(power/index);
      inside*=prime**(power%index);
    }
    if(n>1)inside*=n;
    return {negative:negative,outside:outside,inside:inside};
  }
  function formatRoot(parts,index,denominator){
    var common=gcd(BigInt(parts.outside),BigInt(denominator)),outside=parts.outside/Number(common),below=denominator/Number(common),sign=parts.negative?"−":"",above;
    if(parts.inside===1)above=String(outside);
    else above=(outside===1?"":String(outside))+(index===2?"√":"∛")+parts.inside;
    return sign+above+(below===1?"":"/"+below);
  }
  function simplifyRoot(value,index){
    var parts=rootParts(value,index);
    return parts===null?null:formatRoot(parts,index,1);
  }
  function simplifyRationalRoot(numerator,denominator,index){
    var top=Number(numerator),bottom=Number(denominator),common,expanded,parts;
    if(!Number.isSafeInteger(top)||!Number.isSafeInteger(bottom)||bottom===0)return null;
    if(bottom<0){top=-top;bottom=-bottom;}
    common=Number(gcd(BigInt(top),BigInt(bottom)));top/=common;bottom/=common;
    expanded=Math.abs(top)*bottom**(index-1);
    if(!Number.isSafeInteger(expanded)||expanded>1e12)return null;
    parts=rootParts(top<0?-expanded:expanded,index);
    return parts===null?null:formatRoot(parts,index,bottom);
  }

  window.QCAL_TAPE_MATH={exactFraction:exactFraction,formatBase:formatBase,simplifySquareRoot:function(value){return simplifyRoot(value,2);},simplifyCubeRoot:function(value){return simplifyRoot(value,3);},simplifyRationalSquareRoot:function(numerator,denominator){return simplifyRationalRoot(numerator,denominator,2);},simplifyRationalCubeRoot:function(numerator,denominator){return simplifyRationalRoot(numerator,denominator,3);}};
}());
