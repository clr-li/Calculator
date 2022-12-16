function range(start, end, steps) {
    return Array.from(Array(steps).keys(),n=>(end-start)*n/(steps-1)+start);
}

let data = [];

let x = range(-10,10,50);
let y = range(-10,10,50);
let z = range(-80,80,50); // [-1, 0, 1]; //
let layout = {
  uirevision: true,
  scene: {
    aspectmode: "manual",
    aspectratio: {
     x: 1, y: 1, z: 1,
    },
    xaxis: {
      nticks: 10,
      range: [x[0], x[x.length-1]],
    },
    yaxis: {
      nticks: 10,
      range: [y[0], y[y.length-1]],
    },
    zaxis: {
      nticks: 10,
      range: [z[0], z[z.length-1]],
    }
  }
};

Plotly.newPlot('plotly', data.flat(), layout);

let crashed = false;
function refresh() { // graphs all the graphs in 'data' and reloads plotly if an error occured on the last call to refresh()
    try {
        if (crashed) {
            console.log('Creating new plotly instance');
            $.getScript("https://cdn.plot.ly/plotly-2.14.0.min.js")
            .done(function (script, textStatus) {
                console.log(textStatus);
                Plotly.newPlot('plotly', data.flat(), layout);
            })
            .fail(function (jqxhr, settings, exception) {
                console.log("Triggered ajaxError handler.");
            });
            crashed = false;
        } else {
            Plotly.react('plotly', data.flat(), layout);
        }
    } catch {
        crashed = true;
        console.log('Crashed');
    }
}

let brights = ['#0c6dcf', 'turquoise', 'green', 'gold', 'white', 'violet'];
let darks = ['rgb(0,0,19)', '#0c6dcf', 'black', 'brown', 'crimson', 'purple'];
let colorIX = 0;

function getNextColorscale() {
    let result = [[0, darks[colorIX]], [1, brights[colorIX]]];
    colorIX = (colorIX + 1) % darks.length;
    return result;
}

function getVals3D(code, irange, jrange) {
    let vals = [];
    let ival, jval;
    for (let j = 0; j < jrange.length; j++) {
        vals.push([]);
        for (let i = 0; i < irange.length; i++) {
            ival = irange[i];
            jval = jrange[j];
            vals[j][i] = code(ival, jval, NaN);
            if (vals[j][i] == Infinity) vals[j][i] = NaN;
        }
    }
    return vals;
}

function meshdata(I, J, K, X, Y, Z, colorscale) { // plotly doesn't support vertical surfaces, so we make meshes for them manually
  return {
    type: 'mesh3d',
    x: X,
    y: Y,
    z: Z,
    i: I,
    j: J,
    k: K,
    opacity:1, 
    intensity: Z, 
    showscale: false,
    colorscale: colorscale,
    flatshading: true,
    lighting: {
      diffuse: 0
    }
  };
}

function trisurfacedata(Tri, X, Y, Z, colorscale) {
    let I = Tri.map(function(f) { return f[0] });
    let J = Tri.map(function(f) { return f[1] });
    let K = Tri.map(function(f) { return f[2] });
  return meshdata(I, J, K, X, Y, Z, colorscale);
}

function trisurface(ivals, jrange, krange) {
  let i = [];
  let j = [];
  let k = [];
  let triangles = [];
  for (let kix = 0; kix < krange.length; kix++) {
    for (let jix = 0; jix < jrange.length; jix++) {
      i.push(ivals[kix][jix]);
      j.push(jrange[jix]);
      k.push(krange[kix]);
      // isNan.push(isNaN(ivals[kix][jix])); // keep track of points that contain NaN values, could remove later
      // if (jix < jrange.length - 1 && kix < krange.length - 1) {
      //   triangles.push([kix*jrange.length+jix, (kix+1)*jrange.length+jix, kix*jrange.length+jix+1]);
      //   triangles.push([(kix+1)*jrange.length+jix+1, (kix+1)*jrange.length+jix, kix*jrange.length+jix+1]);
      // }
    }
  }
  for (let kix = 0; kix < krange.length-1; kix++) { // only generate triangles w/o NaN points
    for (let jix = 0; jix < jrange.length-1; jix++) {
      if (!(isNaN(i[kix*jrange.length+jix]) || isNaN(i[(kix+1)*jrange.length+jix]) ||
         isNaN(i[kix*jrange.length+jix+1]) || isNaN(i[(kix+1)*jrange.length+jix+1]))) {
        triangles.push([kix*jrange.length+jix, (kix+1)*jrange.length+jix, kix*jrange.length+jix+1]);
        triangles.push([(kix+1)*jrange.length+jix+1, (kix+1)*jrange.length+jix, kix*jrange.length+jix+1]);
      }
    }
  }
  for (let ix = i.length - 1; ix >= 0; ix--) {
    if (isNaN(i[ix])) {
      i.splice(ix,1);
      j.splice(ix,1);
      k.splice(ix,1);
      triangles.forEach((t) => {
        if (t[0] >= ix) t[0] = t[0] -1;
        if (t[1] >= ix) t[1] = t[1] -1;
        if (t[2] >= ix) t[2] = t[2] -1;
      });
    }
  }
  return { i: i, j: j, k: k, tri: triangles };
}

function getData3DZ(code, colorscale) {
    let vals = getVals3D(code, x, y);
    let tris = trisurface(vals, x, y);
    return trisurfacedata(tris.tri, tris.j, tris.k, tris.i, colorscale)
    // return {z: getVals3D(code, x, y), x: x, y: y, colorscale: colorscale, showscale: false, opacity: 1, type: 'surface'};
}

function getData3DX(code, colorscale) {
    let vals = getVals3D(code, y, z);
    let tris = trisurface(vals, y, z);
    return trisurfacedata(tris.tri, tris.i, tris.j, tris.k, colorscale)
}

function getData3DY(code, colorscale) {
    let vals = getVals3D(code, x, z);
    let tris = trisurface(vals, x, z);
    return trisurfacedata(tris.tri, tris.j, tris.i, tris.k, colorscale)
}

function getData2D(code, colorscale) {
  
    //return {z: z, x: x, y: y, colorscale: colorscale, showscale: false, opacity: 1, type: 'surface'};
}

function combineTrisurfaces(datas) {
    // Remove duplicate points and triangles
    let X = datas[0].x;
    let Y = datas[0].y;
    let Z = datas[0].z;
    let I = datas[0].i;
    let J = datas[0].j;
    let K = datas[0].k;
    for (let i = 1; i < datas.length; i++) {
        let Xnew = datas[i].x;
        let Ynew = datas[i].y;
        let Znew = datas[i].z;
        let points = new Array(Xnew.length);
        for (let j = 0; j < Xnew.length; j++) {
            points[j] = false;
            for (let k = 0; k < X.length; k++) {
              if (Xnew[j] == X[k] && Ynew[j] == Y[k] && Znew[j] == Z[k]) {
                points[j] = k;
                break;
              }
            }
            if (points[j] === false) { // need triple equals not ! since it has to be exact type boolean
              points[j] = X.length;
              X.push(Xnew[j]);
              Y.push(Ynew[j]);
              Z.push(Znew[j]);
            }
        }
        let Inew = datas[i].i;
        let Jnew = datas[i].j;
        let Knew = datas[i].k;
        for (let j = 0; j < Inew.length; j++) {
            let exists = false;
            for (let k = 0; k < I.length; k++) {
              if (points[Inew[j]] == I[k] && points[Jnew[j]] == J[k] && points[Knew[j]] == K[k]) {
                exists = true;
                break;
              }
            }
            if (exists === false) {
              I.push(points[Inew[j]]);
              J.push(points[Jnew[j]]);
              K.push(points[Knew[j]]);
            }
        }
    }
    return meshdata(I, J, K, X, Y, Z, datas[0].colorscale);
}

let is3D = false;
function set3D() {
  
}

function set2D() {
  layout.scene.camera = {};
  layout.scene.camera.center = {x: 0, y: 0, z: 0};
  layout.scene.camera.eye = {x: 0.001, y: 0, z: 1.3};
  layout.scene.camera.up = {x: 0, y: 1, z: 0};
  layout.scene.aspectratio.z = 0.001;
  layout.scene.zaxis.visible = false;
  refresh();
  resize();
}

function createEquation(expression, colorscale) {
    let parsed = nerdamer(addParen(expression));
    let variables = parsed.variables();
    let latex = nerdamer.convertToLaTeX(expression); //parsed.toTeX();
    let data = [];
    try { 
      // solve for z
      if (variables.includes('z')) { // 3D equation
        let functions = [parsed.solveFor('z')].flat(); // ensure it's iterable
        functions.forEach((f) => {
          let code = nerdamer(f).buildFunction(['x','y','i']);
          data.push(getData3DZ(code, colorscale));
        });
      }

      // solve for y
      if (variables.includes('y')) {
        let functions = [parsed.solveFor('y')].flat(); // ensure it's iterable
        functions.forEach((f) => {
          let code = nerdamer(f).buildFunction(['x','z','i']);
          data.push(getData3DY(code, colorscale));
        });
      }

      // solve for x
      if (variables.includes('x')) {
        let functions = [parsed.solveFor('x')].flat(); // ensure it's iterable
        functions.forEach((f) => {
          let code = nerdamer(f).buildFunction(['y','z','i']);
          data.push(getData3DX(code, colorscale));
        });
      }

      // combine trisurfaces into one mesh to fix jittering and color scale
      d = data
      data = [combineTrisurfaces(data)];
    } catch (error) {
      console.log('not a graphable equation: ' + error);
      latex = '\\) ⚠ \\( ' + latex;
    }

    return {
        latex: latex,
        data: data,
        colorscale: colorscale
    }
}

function addParen(expression) { // surround variables by parenthesis
  let str = expression + " ";
  let re = /[xyz][^\)]+/;
  let match;
  while ((match = re.exec(str)) != null) { 
    str = str.substring(0, match.index) + "(" + str.charAt(match.index) + ")" + str.substring(match.index+1); 
  }
  return str.substring(0, str.length-1);
}

let equations = []
function newEquation(expression) {
    let equation = createEquation(expression, getNextColorscale())
    equations.push(equation);
    data.push(equation.data);
    refresh();
}

function update(ix) {
    let expression = document.getElementById('input-'+ix).value;
    let colorscale = equations[ix].colorscale;
    equations[ix] = createEquation(expression, colorscale);
    data[ix] = equations[ix].data;
    document.getElementById('latex-'+ix).textContent = `\\( ${equations[ix].latex} \\)`;
    MathJax.typesetPromise([document.getElementById('latex-'+ix)]).then(() => {});
    refresh();
}

function createEquationInput(val = "") {
    newEquation(val);
    let ix = equations.length - 1;
    let html = `
    <div class="equation" style="border-color: ${equations[ix].colorscale[1][1]}">
        <label class="custom-field">
            <input type="text" spellcheck="false" value="${val}" id="input-${ix}" onfocusout="update(${ix})"/>
            <span class="placeholder" id="latex-${ix}">\\( ${equations[ix].latex} \\)</span>
        </label>
    </div>`;
    document.getElementById('equations').innerHTML += html;
    MathJax.typesetPromise([document.getElementById('latex-'+ix)]).then(() => {});
}

document.getElementById('addEquation').onclick = () => {
    createEquationInput("z = 0");
};

window.onload = () => { 
    createEquationInput("z = sqrt(2)sin(x)+y^2/atan(y)+floor(x)");
    resize();
};