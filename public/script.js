let values = "";
let displayValues = "";
let valuesPrevious = "";
let displayValuesPrevious = "";
let degreeOrRadians = false;
let firstClick = true;

let preciseMath;
window.addEventListener('load', () => {
  preciseMath = math.create({ number: 'BigNumber' });
  setModeRad();
});

function clickMode() {
    if (degreeOrRadians) {
        setModeRad();
    } else {
        setModeDegree();
    }
    degreeOrRadians = !degreeOrRadians;
}

function setModeRad() {
    preciseMath.import({ 
        sin: (x) => { return Math.sin(x) },
        cos: (x) => { return Math.cos(x) },
        tan: (x) => { return Math.round(Math.tan(x), 16) },
        asin: (x) => { return Math.asin(x) },
        acos: (x) => { return Math.acos(x) },
        atan: (x) => { return Math.atan(x) }
    },{override: true});
    document.getElementById("radRD").innerHTML = 'Rad';
}

function setModeDegree() {
    preciseMath.import({ 
        sin: (x) => { return Math.round(Math.sin(x * Math.PI / 180), 16) },
        cos: (x) => { return Math.round(Math.cos(x * Math.PI / 180), 16) },
        tan: (x) => { return Math.round(Math.tan(x * Math.PI / 180), 16) },
        asin: (x) => { return Math.round(Math.asin(x), 16) * 180 / Math.PI },
        acos: (x) => { return Math.round(Math.acos(x), 16) * 180 / Math.PI },
        atan: (x) => { return Math.round(Math.atan(x), 16) * 180 / Math.PI }
    },{override: true});
    document.getElementById("radRD").innerHTML = '&#176;';
}


function render(DOM_ID) {
    document.getElementById(DOM_ID).innerHTML = displayValues.replace('16331239353195370', '&infin;').replace('Infinity', '&infin;');
    if (valuesPrevious == '') {
        [...document.getElementsByClassName('undo')].forEach((elem) => { elem.innerHTML = 'AC'});
    } else {
        [...document.getElementsByClassName('undo')].forEach((elem) => { elem.innerHTML = 'C'});
    }
    let constant = 100;
    if (firstClick) {
        constant = 4.6;
        firstClick = false;
    } else {
        constant = document.getElementById(DOM_ID).clientWidth / parseInt(document.getElementById(DOM_ID).style.fontSize.replace('px',''));
    }
    let vw10 = window.innerWidth * 0.1;
    let size = Math.min(window.innerWidth / constant, vw10);
    document.getElementById(DOM_ID).style.fontSize = size + 'px';
    document.documentElement.style.setProperty('--supFontsize', size / 2 + 'px');
}

let fraction; 
window.onload = () => {
    fraction = math.create({
        number: 'Fraction'
    });
};

function addToScreen(value, displayValue) {
    valuesPrevious = values;
    displayValuesPrevious = displayValues;
    values += value;
    displayValues += displayValue;
    render('screen', displayValues);
}

function clickParenthesis(value) {
    addToScreen(value, value);
}

function clickOperator(value) {
    if (['*', '/'].includes(values[values.length - 1])) return;
    let displayValue = value;
    if (value == '/') {
        displayValue = '&#xF7;';
    } else if (value == '*') {
        displayValue = '&#215;';
    }
    addToScreen(value, displayValue);
}

function clickConstant(value) {
    let displayValue = value;
    switch(value) {
        case '(pi)': displayValue = '&#960;'; break;
        case '(e)': displayValue = 'e'; break;
    }
    addToScreen(value, displayValue);
}

function clickNumber(value) {
    addToScreen(value, value);
}

function clickUnary(value) {
    let displayValue = value;
    if (value == '^2') {
        if (values.substr(values.length-2, values.length-1) == '^2') return;
        displayValue = `<sup style="font-size: var(--supFontsize)">2</sup>`;
    }
    addToScreen(value, displayValue);
}

function clickFunction(value) {
    let displayValue = value;
    switch(value) {
        case 'sqrt(': displayValue = '&radic;('; break;
        case 'asin(': displayValue = `sin<sup style="font-size: var(--supFontsize)"> -1</sup>(`; break;
        case 'acos(': displayValue = `cos<sup style="font-size: var(--supFontsize)"> -1</sup>(`; break;
        case 'atan(': displayValue = `tan<sup style="font-size: var(--supFontsize)"> -1</sup>(`; break;
        case 'log(': displayValue = 'ln('; break;
        case 'log10(': displayValue = 'log('; break;
    } 
    addToScreen(value, displayValue);
}

function calculate() {
    valuesPrevious = '';
    displayValuesPrevious = '';
    var p = matchParenthesis(values);
    for (i = 0; i < p; i++) {
        values += ')';
    }
    values = '' + preciseMath.evaluate(values).valueOf();
    displayValues = values;
    render('screen');
}

function undo() {
    values = valuesPrevious;
    displayValues = displayValuesPrevious;
    valuesPrevious = '';
    displayValuesPrevious = '';
    render('screen');

}

function matchParenthesis(str) {
    var openParenthesis = 0;
    var closedParenthesis = 0;
    for (i = 0; i < str.length; i++) {
        if (str.charAt(i) == '(') {
            openParenthesis++;
        } else if (str.charAt(i) == ')') {
            closedParenthesis++;
        }
    }
    return openParenthesis - closedParenthesis;
}

let buttonsIX = 0;
function changeButtons() {
    let buttonGroups = document.getElementsByClassName('buttons');
    buttonGroups[buttonsIX].style.display = "none";
    buttonsIX = (buttonsIX + 1) % buttonGroups.length;
    buttonGroups[buttonsIX].style.display = "block";
}