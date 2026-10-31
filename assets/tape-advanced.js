(function () {
  "use strict";
  function gcd(a,b){a=Math.abs(Math.round(a));b=Math.abs(Math.round(b));while(b){var t=a%b;a=b;b=t;}return a||1;}
  function decimalText(value){if(!Number.isFinite(value))return null;if(Object.is(value,-0))value=0;return Number(value.toPrecision(12)).toString();}
  function rationalText(value){
    if(!Number.isFinite(value))return null;
    if(Math.abs(value)<1e-12)value=0;
    if(Math.abs(value-Math.round(value))<1e-10)return String(Math.round(value));
    for(var denominator=2;denominator<=1000;denominator++){
      var numerator=Math.round(value*denominator);
      if(Math.abs(value-numerator/denominator)<1e-11){var common=gcd(numerator,denominator);return numerator/common+"/"+(denominator/common);}
    }
    return decimalText(value);
  }
  function superscript(value){var map={0:"⁰",1:"¹",2:"²",3:"³",4:"⁴",5:"⁵",6:"⁶",7:"⁷",8:"⁸",9:"⁹","-":"⁻"};return String(value).split("").map(function(character){return map[character]||character;}).join("");}
  function pretty(expression){
    return String(expression).replace(/\bpi\b/g,"π").replace(/\s*\*\s*/g,"·").replace(/\s*\^\s*(-?\d+)/g,function(_,power){return superscript(power);}).replace(/\s*\+\s*/g," + ").replace(/\s*-\s*/g," − ").replace(/^− /,"−").replace(/·(?=[A-Za-zπ(])/g,"").replace(/\s+/g," ").trim();
  }
  function normalizeAlgebra(source){return String(source).replace(/π/g,"pi").replace(/(\d|\))\s*([A-Za-z(])/g,"$1*$2");}
  function splitArgs(source){var args=[],start=0,depth=0;for(var i=0;i<source.length;i++){if(source[i]==="(")depth++;else if(source[i]===")")depth--;else if(source[i]===","&&depth===0){args.push(source.slice(start,i).trim());start=i+1;}}args.push(source.slice(start).trim());return args;}

  var unitAliases={
    "mm":"mm","millimeter":"mm","millimeters":"mm","millimetre":"mm","millimetres":"mm",
    "cm":"cm","centimeter":"cm","centimeters":"cm","centimetre":"cm","centimetres":"cm",
    "m":"m","meter":"m","meters":"m","metre":"m","metres":"m",
    "km":"km","kilometer":"km","kilometers":"km","kilometre":"km","kilometres":"km",
    "in":"in","inch":"in","inches":"in","ft":"ft","foot":"ft","feet":"ft","yd":"yd","yard":"yd","yards":"yd","mi":"mi","mile":"mi","miles":"mi",
    "mg":"mg","milligram":"mg","milligrams":"mg","g":"g","gram":"g","grams":"g","kg":"kg","kilogram":"kg","kilograms":"kg","oz":"oz","ounce":"oz","ounces":"oz","lb":"lb","lbs":"lb","pound":"lb","pounds":"lb",
    "ml":"mL","milliliter":"mL","milliliters":"mL","millilitre":"mL","millilitres":"mL","l":"L","liter":"L","liters":"L","litre":"L","litres":"L","tsp":"tsp","teaspoon":"tsp","teaspoons":"tsp","tbsp":"tbsp","tablespoon":"tbsp","tablespoons":"tbsp","cup":"cup","cups":"cup","pint":"pint","pints":"pint","quart":"qt","quarts":"qt","gallon":"gal","gallons":"gal","gal":"gal",
    "ms":"ms","millisecond":"ms","milliseconds":"ms","s":"s","sec":"s","secs":"s","second":"s","seconds":"s","min":"min","mins":"min","minute":"min","minutes":"min","h":"h","hr":"h","hrs":"h","hour":"h","hours":"h","dy":"day","day":"day","days":"day","wk":"week","wks":"week","week":"week","weeks":"week",
    "deg":"deg","degree":"deg","degrees":"deg","°":"deg","rad":"rad","radian":"rad","radians":"rad",
    "k":"K","kelvin":"K","degc":"degC","celsius":"degC","degree celsius":"degC","degrees celsius":"degC","degf":"degF","fahrenheit":"degF","degree fahrenheit":"degF","degrees fahrenheit":"degF",
    "km/h":"km/h","kph":"km/h","kilometer per hour":"km/h","kilometers per hour":"km/h","kilometre per hour":"km/h","kilometres per hour":"km/h","mi/h":"mi/h","mph":"mi/h","mile per hour":"mi/h","miles per hour":"mi/h","m/s":"m/s","meter per second":"m/s","meters per second":"m/s","metre per second":"m/s","metres per second":"m/s","ft/s":"ft/s","foot per second":"ft/s","feet per second":"ft/s"
  };
  Object.assign(unitAliases,{
    "um":"um","micrometer":"um","micrometers":"um","micrometre":"um","micrometres":"um","nm":"nm","nanometer":"nm","nanometers":"nm","nanometre":"nm","nanometres":"nm",
    "nmi":"nmi","nautical mile":"nmi","nautical miles":"nmi","furlong":"furlong","furlongs":"furlong","mil":"mil","mils":"mil",
    "acre":"acre","acres":"acre","hectare":"hectare","hectares":"hectare",
    "mcg":"ug","microgram":"ug","micrograms":"ug","tonne":"tonne","tonnes":"tonne","metric ton":"tonne","metric tons":"tonne","stone":"stone","stones":"stone","ton":"ton","tons":"ton",
    "floz":"floz","fluid ounce":"floz","fluid ounces":"floz","cubic inch":"in^3","cubic inches":"in^3","cubic foot":"ft^3","cubic feet":"ft^3","cubic yard":"yd^3","cubic yards":"yd^3",
    "ns":"ns","nanosecond":"ns","nanoseconds":"ns","us":"us","microsecond":"us","microseconds":"us","month":"month","months":"month","year":"year","years":"year",
    "hz":"Hz","hertz":"Hz","khz":"kHz","kilohertz":"kHz","mhz":"MHz","megahertz":"MHz","ghz":"GHz","gigahertz":"GHz",
    "n":"N","newton":"N","newtons":"N","kn":"kN","kilonewton":"kN","kilonewtons":"kN","lbf":"lbf","pound force":"lbf","pounds force":"lbf",
    "pa":"Pa","pascal":"Pa","pascals":"Pa","kpa":"kPa","kilopascal":"kPa","kilopascals":"kPa","mpa":"MPa","megapascal":"MPa","megapascals":"MPa","bar":"bar","bars":"bar","atm":"atm","atmosphere":"atm","atmospheres":"atm","psi":"psi",
    "j":"J","joule":"J","joules":"J","kj":"kJ","kilojoule":"kJ","kilojoules":"kJ","cal":"cal","calorie":"cal","calories":"cal","kcal":"kcal","kilocalorie":"kcal","kilocalories":"kcal","btu":"BTU",
    "w":"W","watt":"W","watts":"W","kw":"kW","kilowatt":"kW","kilowatts":"kW","mw":"MW","megawatt":"MW","megawatts":"MW","wh":"Wh","watt hour":"Wh","watt hours":"Wh","kwh":"kWh","kilowatt hour":"kWh","kilowatt hours":"kWh",
    "a":"A","amp":"A","amps":"A","ampere":"A","amperes":"A","v":"V","volt":"V","volts":"V","ohm":"ohm","ohms":"ohm","coulomb":"coulomb","coulombs":"coulomb",
    "lm":"lm","lumen":"lm","lumens":"lm","lx":"lux","lux":"lux","tesla":"T","teslas":"T","weber":"Wb","webers":"Wb"
  });
  Object.assign(unitAliases,{
    "mol":"mol","mole":"mol","moles":"mol","cd":"cd","candela":"cd","candelas":"cd","sr":"sr","steradian":"sr","steradians":"sr",
    "farad":"F","farads":"F","siemens":"S","henry":"H","henries":"H","becquerel":"Bq","becquerels":"Bq","gray":"Gy","grays":"Gy","sievert":"Sv","sieverts":"Sv","katal":"kat","katals":"kat",
    "square meter":"m^2","square meters":"m^2","square metre":"m^2","square metres":"m^2","square centimeter":"cm^2","square centimeters":"cm^2","square centimetre":"cm^2","square centimetres":"cm^2","square millimeter":"mm^2","square millimeters":"mm^2","square foot":"ft^2","square feet":"ft^2","square inch":"in^2","square inches":"in^2","square yard":"yd^2","square yards":"yd^2","square mile":"mi^2","square miles":"mi^2",
    "cubic meter":"m^3","cubic meters":"m^3","cubic metre":"m^3","cubic metres":"m^3","cubic centimeter":"cm^3","cubic centimeters":"cm^3","cubic centimetre":"cm^3","cubic centimetres":"cm^3"
  });
  [["Bq","1 Hz"],["Gy","1 J/kg"],["Sv","1 J/kg"],["kat","1 mol/s"],["sr","1 rad^2"],["nmi","1852 m"],["furlong","201.168 m"]].forEach(function(unit){try{window.math.createUnit(unit[0],unit[1]);}catch(e){}});
  var unitKeys=Object.keys(unitAliases).sort(function(a,b){return b.length-a.length;});
  var unitLabels={"mL":"mL","L":"L","K":"K","degC":"degC","degF":"degF","mi/h":"mph","km/h":"km/h","m/s":"m/s","ft/s":"ft/s","day":"day","week":"wk"};
  function unitName(value){return String(value).trim().toLowerCase().replace(/\./g,"").replace(/\s+/g," ");}
  function canonicalUnit(value){return unitAliases[unitName(value)]||null;}
  function parseQuantity(value){var text=String(value).trim().replace(/π/g,"pi");if(!/^[0-9piPIeE.+\-*/()\s]+$/.test(text))return null;try{var result=window.math.evaluate(text);return typeof result==="number"&&Number.isFinite(result)?result:null;}catch(e){return null;}}
  function parseMeasurement(source){
    var text=String(source).trim(),whole=canonicalUnit(text);
    if(whole)return {value:1,unit:whole};
    var lower=unitName(text);
    for(var i=0;i<unitKeys.length;i++){
      var key=unitKeys[i];
      if(lower.length<=key.length||lower.slice(-key.length)!==key)continue;
      var boundary=lower.length-key.length-1;
      if(boundary>=0&&!/\s/.test(lower[boundary]))continue;
      var quantity=parseQuantity(text.slice(0,text.length-key.length));
      if(quantity!==null)return {value:quantity,unit:unitAliases[key]};
    }
    return null;
  }
  function piText(degrees){
    var numerator=Math.round(degrees*1000000000),denominator=180000000000,common=gcd(numerator,denominator);numerator/=common;denominator/=common;
    if(numerator===0)return "0 rad";
    var sign=numerator<0?"−":"";numerator=Math.abs(numerator);
    return sign+(numerator===1?"":numerator)+"π"+(denominator===1?"":"/"+denominator)+" rad";
  }
  function convert(source){
    var match=String(source).match(/^(.+?)\s+to\s+(.+)$/i);if(!match)return null;
    var from=parseMeasurement(match[1]),to=canonicalUnit(match[2])||normalizeUnitExpression(match[2]);
    if(from&&from.unit==="deg"&&to==="rad")return {text:piText(from.value),number:from.value*Math.PI/180};
    try{var quantity=from?window.math.unit(from.value,from.unit):window.math.evaluate(normalizeUnitExpression(match[1])),converted=quantity.to(to),number=converted.toNumber(to),label=unitLabels[to]||to;return {text:decimalText(number)+" "+label,number:number};}catch(e){return null;}
  }
  function normalizeUnitExpression(source){
    var text=String(source).replace(/²/g,"^2").replace(/³/g,"^3");
    unitKeys.forEach(function(key){var escaped=key.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),pattern=new RegExp("(^|[^A-Za-z])("+escaped+")(?=$|[^A-Za-z])","gi");text=text.replace(pattern,function(_,before){return before+unitAliases[key];});});
    return text;
  }
  var unitCatalog="SI base: metre (m), kilogram (kg), second (s), ampere (A), kelvin (K), mole (mol), candela (cd).\nSI derived: radian (rad), steradian (sr), hertz (Hz), newton (N), pascal (Pa), joule (J), watt (W), coulomb, volt (V), farad (F), ohm, siemens (S), weber (Wb), tesla (T), henry (H), degree Celsius (degC), lumen (lm), lux, becquerel (Bq), gray (Gy), sievert (Sv), katal (kat).\nSI prefixes: quetta (Q), ronna (R), yotta (Y), zetta (Z), exa (E), peta (P), tera (T), giga (G), mega (M), kilo (k), hecto (h), deca (da), deci (d), centi (c), milli (m), micro (u), nano (n), pico (p), femto (f), atto (a), zepto (z), yocto (y), ronto (r), quecto (q).\nLength / area: nanometre, micrometre, millimetre, centimetre, metre, kilometre; inch, foot, yard, mile, nautical mile, mil, furlong; square units, hectare, acre.\nVolume: millilitre (mL), litre (L), cubic units; teaspoon, tablespoon, fluid ounce (floz), cup, pint, quart, gallon.\nMass / force: microgram, milligram, gram, kilogram, tonne; ounce, pound, stone, ton; newton, kilonewton, pound-force.\nTime / frequency: ns, us, ms, sec, min, hr, day, wk, month, year; Hz, kHz, MHz, GHz.\nPressure / energy / power: Pa, kPa, MPa, bar, atm, psi; J, kJ, cal, kcal, BTU; W, kW, MW, Wh, kWh.\nAngle / temperature: degree (deg), radian (rad); Celsius (degC), Fahrenheit (degF), kelvin (K).\nElectrical / light / magnetism: A, V, ohm, coulomb, F, S, Wb, T, H, lm, lux.\nCompound syntax: use *, /, ^2, or ^3—for example m/s, kg/m^3, cm^2, and 10 cm^2 / 50 mm to m.";

  function basechange(source){
    var args=splitArgs(source);if(args.length!==3)return null;
    var raw=args[0].replace(/^['"]|['"]$/g,"").trim(),from=Number(args[1]),to=Number(args[2]),negative=raw[0]==="-";if(negative)raw=raw.slice(1);
    if(!Number.isInteger(from)||!Number.isInteger(to)||from<2||from>36||to<2||to>36||!raw)return null;
    var value=0n,bigBase=BigInt(from);for(var i=0;i<raw.length;i++){var digit=parseInt(raw[i],36);if(!Number.isInteger(digit)||digit>=from)return null;value=value*bigBase+BigInt(digit);}
    return (negative?"−":"")+value.toString(to).toUpperCase();
  }

  function derivative(source){
    var args=splitArgs(source);if(args.length!==2||!/^[A-Za-z]$/.test(args[1]))return null;
    try{return pretty(window.math.simplify(window.math.derivative(normalizeAlgebra(args[0]),args[1])).toString());}catch(e){return null;}
  }
  function polyAdd(left,right,scale){var out={},key;Object.keys(left).forEach(function(k){out[k]=(out[k]||0)+left[k];});Object.keys(right).forEach(function(k){out[k]=(out[k]||0)+(scale||1)*right[k];});for(key in out)if(Math.abs(out[key])<1e-12)delete out[key];return out;}
  function polyMul(left,right){var out={};Object.keys(left).forEach(function(a){Object.keys(right).forEach(function(b){var power=Number(a)+Number(b);out[power]=(out[power]||0)+left[a]*right[b];});});return out;}
  function polyFromNode(node,variable){
    if(node.type==="ParenthesisNode")return polyFromNode(node.content,variable);
    if(node.type==="ConstantNode"){var value=Number(node.value);return Number.isFinite(value)?{0:value}:null;}
    if(node.type==="SymbolNode")return node.name===variable?{1:1}:null;
    if(node.type!=="OperatorNode")return null;
    if(node.fn==="unaryMinus"){var unary=polyFromNode(node.args[0],variable);return unary&&polyAdd({},unary,-1);}
    var left=polyFromNode(node.args[0],variable),right=polyFromNode(node.args[1],variable);if(!left||!right)return null;
    if(node.op==="+")return polyAdd(left,right,1);if(node.op==="-")return polyAdd(left,right,-1);if(node.op==="*")return polyMul(left,right);
    if(node.op==="/"){if(Object.keys(right).some(function(power){return Number(power)!==0;})||!right[0])return null;var divided={};Object.keys(left).forEach(function(power){divided[power]=left[power]/right[0];});return divided;}
    if(node.op==="^"){var exponent=right[0];if(Object.keys(right).length!==1||!Number.isInteger(exponent)||exponent<0||exponent>20)return null;var powered={0:1};for(var i=0;i<exponent;i++)powered=polyMul(powered,left);return powered;}
    return null;
  }
  function polynomialText(poly,variable){
    var powers=Object.keys(poly).map(Number).filter(function(power){return Math.abs(poly[power])>1e-12;}).sort(function(a,b){return b-a;});if(!powers.length)return "0";
    return powers.map(function(power,index){var coefficient=poly[power],negative=coefficient<0,absolute=Math.abs(coefficient),coefficientText=rationalText(absolute),body=power===0?coefficientText:(absolute===1?"":coefficientText)+(power===1?variable:variable+"^"+power);return (index?(negative?" - ":" + "):(negative?"-":""))+body;}).join("");
  }
  function integral(source){
    var args=splitArgs(source);if(args.length!==2&&args.length!==4||!/^[A-Za-z]$/.test(args[1]))return null;
    try{
      var poly=polyFromNode(window.math.parse(normalizeAlgebra(args[0])),args[1]);if(!poly)return null;
      var integrated={};Object.keys(poly).forEach(function(power){var next=Number(power)+1;integrated[next]=poly[power]/next;});
      if(args.length===2)return pretty(polynomialText(integrated,args[1]))+" + C";
      var lower=parseQuantity(args[2]),upper=parseQuantity(args[3]);if(lower===null||upper===null)return null;
      var result=0;Object.keys(integrated).forEach(function(power){result+=integrated[power]*(upper**Number(power)-lower**Number(power));});return rationalText(result);
    }catch(e){return null;}
  }
  function expand(source){try{return pretty(window.math.simplify(window.math.rationalize(normalizeAlgebra(source))).toString());}catch(e){return null;}}
  function simplifyExpression(source){
    var text=normalizeAlgebra(source),compact=text.replace(/\s+/g,"");
    var radical=compact.match(/^sqrt\(([+-]?\d+)\)$/i);if(radical&&window.QCAL_TAPE_MATH){var exact=window.QCAL_TAPE_MATH.simplifySquareRoot(Number(radical[1]));if(exact!==null)return exact;}
    radical=compact.match(/^sqrt\(([+-]?\d+)\/([+-]?\d+)\)$/i);if(radical&&window.QCAL_TAPE_MATH){var rationalRoot=window.QCAL_TAPE_MATH.simplifyRationalSquareRoot(Number(radical[1]),Number(radical[2]));if(rationalRoot!==null)return rationalRoot;}
    var identities=[
      [/^sin\(([^()]+)\)\^2\+cos\(\1\)\^2$/i,"1"],[/^cos\(([^()]+)\)\^2\+sin\(\1\)\^2$/i,"1"],
      [/^1\+tan\(([^()]+)\)\^2$/i,"sec($1)^2"],[/^tan\(([^()]+)\)\^2\+1$/i,"sec($1)^2"],
      [/^1\+cot\(([^()]+)\)\^2$/i,"csc($1)^2"],[/^cot\(([^()]+)\)\^2\+1$/i,"csc($1)^2"],
      [/^sin\(([^()]+)\)\/cos\(\1\)$/i,"tan($1)"],[/^cos\(([^()]+)\)\/sin\(\1\)$/i,"cot($1)"],
      [/^2\*sin\(([^()]+)\)\*cos\(\1\)$/i,"sin(2*$1)"],[/^1\/cos\(([^()]+)\)$/i,"sec($1)"],[/^1\/sin\(([^()]+)\)$/i,"csc($1)"]
    ];
    for(var i=0;i<identities.length;i++)if(identities[i][0].test(compact))return pretty(compact.replace(identities[i][0],identities[i][1]));
    // Canonicalize integer-coefficient, single-variable polynomials without
    // changing fractional, radical, rational-function or trig simplification.
    try{
      var tree=window.math.parse(text),symbols=new Set(),integerConstants=true;
      tree.traverse(function(node){if(node.type==="SymbolNode")symbols.add(node.name);if(node.type==="ConstantNode"&&!Number.isSafeInteger(Number(node.value)))integerConstants=false;});
      var variables=Array.from(symbols);
      if(integerConstants&&variables.length===1&&/^[A-Za-z]$/.test(variables[0])){
        var polynomial=null;try{polynomial=polyFromNode(tree,variables[0]);}catch(unsupportedPolynomial){}
        if(polynomial&&Object.keys(polynomial).every(function(power){return Number.isSafeInteger(polynomial[power]);}))return pretty(polynomialText(polynomial,variables[0]));
      }
      return pretty(window.math.simplify(text).toString());
    }catch(e){return null;}
  }
  function limit(source){
    var args=splitArgs(source);if(args.length!==3||!/^[A-Za-z]$/.test(args[1]))return null;
    try{
      var node=window.math.parse(normalizeAlgebra(args[0])),variable=args[1],pointText=args[2].trim().toLowerCase(),scope={},point;
      function at(value){scope[variable]=value;var result=node.evaluate(scope);return typeof result==="number"?result:Number(result);}
      if(pointText==="inf"||pointText==="infinity"||pointText==="∞"||pointText==="-inf"||pointText==="-infinity"||pointText==="-∞"){
        var sign=pointText[0]==="-"?-1:1,far=[1e6,1e8,1e10,1e12].map(function(value){return at(sign*value);});
        if(far.every(Number.isFinite)&&Math.abs(far[3])<1e-8)return "0";
        if(far.every(Number.isFinite)&&Math.abs(far[3]-far[2])<=Math.max(1e-7,Math.abs(far[3])*1e-6))return rationalText(far[3]);
        if(far.every(Number.isFinite)&&far[3]>1e12&&far[2]>0&&far[1]>0)return "∞";if(far.every(Number.isFinite)&&far[3]<-1e12&&far[2]<0&&far[1]<0)return "−∞";
        if(far.slice(-2).every(function(value){return value===Infinity;}))return "∞";if(far.slice(-2).every(function(value){return value===-Infinity;}))return "−∞";return null;
      }
      point=parseQuantity(args[2]);if(point===null)return null;scope[variable]=point;var direct=node.evaluate(scope);if(typeof direct==="number"&&Number.isFinite(direct))return rationalText(direct);
      var left=[],right=[];[1e-3,1e-4,1e-5,1e-6,1e-7].forEach(function(h){left.push(at(point-h));right.push(at(point+h));});var l=left[left.length-1],r=right[right.length-1];
      if(Number.isFinite(l)&&Number.isFinite(r)&&Math.abs(l-r)<=Math.max(1e-7,Math.abs(l+r)*5e-7)){var average=(l+r)/2;if(Math.abs(average-Math.round(average))<1e-6)average=Math.round(average);return rationalText(average);}
      if(l===Infinity&&r===Infinity)return "∞";if(l===-Infinity&&r===-Infinity)return "−∞";return null;
    }catch(e){return null;}
  }

  function flattenFactors(node,out){
    if(node.type==="ParenthesisNode")return flattenFactors(node.content,out);
    if(node.type==="OperatorNode"&&node.op==="*"){flattenFactors(node.args[0],out);flattenFactors(node.args[1],out);return;}
    if(node.type==="OperatorNode"&&node.op==="^"&&node.args[1].type==="ConstantNode"){
      var count=Number(node.args[1].value);if(Number.isInteger(count)&&count>0&&count<=6){for(var i=0;i<count;i++)out.push(node.args[0]);return;}
    }
    out.push(node);
  }
  function evaluateNode(node,variable,value){try{var scope={};scope[variable]=value;var result=node.evaluate(scope);return typeof result==="number"&&Number.isFinite(result)?result:null;}catch(e){return null;}}
  function linearInfo(node,variable){var f0=evaluateNode(node,variable,0),f1=evaluateNode(node,variable,1),f2=evaluateNode(node,variable,2);if(f0===null||f1===null||f2===null||Math.abs(f2-2*f1+f0)>1e-8||Math.abs(f1-f0)<1e-12)return null;return {node:node,a:f1-f0,b:f0,root:-f0/(f1-f0),text:pretty(node.toString()).replace(/^\((.*)\)$/,"$1")};}
  function solveLinearSystem(matrix,values){
    var n=values.length,a=matrix.map(function(row,i){return row.slice().concat(values[i]);});
    for(var column=0;column<n;column++){
      var pivot=column;for(var row=column+1;row<n;row++)if(Math.abs(a[row][column])>Math.abs(a[pivot][column]))pivot=row;
      if(Math.abs(a[pivot][column])<1e-11)return null;var swap=a[column];a[column]=a[pivot];a[pivot]=swap;
      var divisor=a[column][column];for(var j=column;j<=n;j++)a[column][j]/=divisor;
      for(row=0;row<n;row++){if(row===column)continue;var factor=a[row][column];for(j=column;j<=n;j++)a[row][j]-=factor*a[column][j];}
    }
    return a.map(function(row){return row[n];});
  }
  function partialFraction(source,variable){
    if(!/^[A-Za-z]$/.test(variable))return null;
    try{
      var tree=window.math.parse(normalizeAlgebra(source)),root=tree.type==="ParenthesisNode"?tree.content:tree;if(root.type!=="OperatorNode"||root.op!=="/")return null;
      var numerator=root.args[0],denominator=root.args[1],factorNodes=[];flattenFactors(denominator,factorNodes);var infos=factorNodes.map(function(node){return linearInfo(node,variable);});if(infos.some(function(info){return !info;}))return null;
      var groups=[];infos.forEach(function(info){var group=groups.find(function(item){return Math.abs(item.root-info.root)<1e-8;});if(group)group.count++;else groups.push({root:info.root,count:1,info:info});});
      var terms=[];groups.forEach(function(group){for(var power=1;power<=group.count;power++)terms.push({info:group.info,power:power});});
      var samples=[],x=0;while(samples.length<terms.length&&x<100){var candidate=(x%2?-(x+1)/2:(x+2)/2);if(infos.every(function(info){return Math.abs(info.a*candidate+info.b)>1e-6;}))samples.push(candidate);x++;}
      if(samples.length!==terms.length)return null;
      var matrix=[],values=[];samples.forEach(function(sample){var den=evaluateNode(denominator,variable,sample),num=evaluateNode(numerator,variable,sample);if(den===null||num===null)return;values.push(num/den);matrix.push(terms.map(function(term){return 1/((term.info.a*sample+term.info.b)**term.power);}));});
      var coefficients=solveLinearSystem(matrix,values);if(!coefficients)return null;
      var output="";coefficients.forEach(function(coefficient,index){if(Math.abs(coefficient)<1e-10)return;var negative=coefficient<0,absolute=Math.abs(coefficient),text=rationalText(absolute),den="("+terms[index].info.text+")"+(terms[index].power===1?"":"^"+terms[index].power),piece=(Math.abs(absolute-1)<1e-10?"":text+"/")+ (Math.abs(absolute-1)<1e-10?"1/":"")+den;if(!output)output=(negative?"−":"")+piece;else output+=(negative?" − ":" + ")+piece;});
      return pretty(output||"0");
    }catch(e){return null;}
  }

  function polynomialAnalysis(source,variable,kind){
    var args=splitArgs(source);if(args.length===2){source=args[0];variable=args[1];}else if(!variable){variable="x";}
    if(!/^[A-Za-z]$/.test(variable))return null;
    try{
      var poly=polyFromNode(window.math.parse(normalizeAlgebra(source)),variable);if(!poly)return null;
      function deriv(p){var out={};Object.keys(p).forEach(function(power){power=Number(power);if(power)out[power-1]=p[power]*power;});return out;}
      function roots(p){var a=p[2]||0,b=p[1]||0,c=p[0]||0;if(Math.abs(a)<1e-12)return Math.abs(b)<1e-12?[]:[-c/b];var d=b*b-4*a*c;return d<0?[]:[(-b-Math.sqrt(Math.max(0,d)))/(2*a),(-b+Math.sqrt(Math.max(0,d)))/(2*a)];}
      function at(p,x){return Object.keys(p).reduce(function(sum,power){return sum+p[power]*Math.pow(x,Number(power));},0);}
      var first=deriv(poly),critical=roots(first),second=deriv(first),points;
      if(kind==="inflection")points=roots(second).filter(function(x){var e=1e-4;return at(second,x-e)*at(second,x+e)<0;});
      else points=critical;
      if(!points.length)return kind==="inflection"?"No inflection points":"No extrema";
      var described=points.map(function(x){var y=at(poly,x),classification=at(second,x)>0?"minimum":at(second,x)<0?"maximum":"stationary point";return {x:x,y:y,type:kind==="inflection"?"inflection":classification};});
      if(kind==="min"||kind==="max"){var wanted=kind==="min"?"minimum":"maximum",found=described.filter(function(p){return p.type===wanted;});return found.length?wanted+" at ("+rationalText(found[0].x)+", "+rationalText(found[0].y)+")":"No "+wanted;}
      return described.map(function(p){return p.type+" at ("+rationalText(p.x)+", "+rationalText(p.y)+")";}).join("; ");
    }catch(e){return null;}
  }
  function domain(source){
    var text=String(source).trim(),m=text.match(/^sqrt(?:\((.+)\)|\s+(.+))$/i);if(m){var radicand=m[1]||m[2],linear=String(radicand).replace(/\s+/g,"").match(/^([+-]?(?:\d*\.?\d+)?)\*?x([+-]\d*\.?\d+)?$/i);if(linear){var a=linear[1];a=a===""||a==="+"?1:a==="-"?-1:Number(a);var b=Number(linear[2]||0),r=-b/a;return a>0?"["+rationalText(r)+", ∞)":"(−∞, "+rationalText(r)+"]";}return "Values where "+pretty(radicand)+" ≥ 0";}
    m=text.match(/^(?:log|ln)\((.+)\)$/i);if(m)return "Values where "+pretty(m[1])+" > 0";
    if(text.indexOf("/")!==-1)return "All real numbers except where the denominator is 0";
    return "(−∞, ∞)";
  }
  function rangeOf(source){
    var args=splitArgs(source),expression=args[0],variable=args[1]||"x";
    try{var p=polyFromNode(window.math.parse(normalizeAlgebra(expression)),variable);if(!p)return null;var a=p[2]||0,b=p[1]||0,c=p[0]||0;if(a){var y=c-b*b/(4*a);return a>0?"["+rationalText(y)+", ∞)":"(−∞, "+rationalText(y)+"]";}return Math.abs(p[1]||0)>1e-12?"(−∞, ∞)":"{"+rationalText(c)+"}";}catch(e){return null;}
  }

  window.QCAL_TAPE_ADVANCED={splitArgs:splitArgs,convert:convert,basechange:basechange,derivative:derivative,integral:integral,expand:expand,simplify:simplifyExpression,limit:limit,partialFraction:partialFraction,polynomialAnalysis:polynomialAnalysis,domain:domain,range:rangeOf,rationalText:rationalText,decimalText:decimalText,pretty:pretty,normalizeAlgebra:normalizeAlgebra,unitCatalog:unitCatalog,normalizeUnitExpression:normalizeUnitExpression};
}());
