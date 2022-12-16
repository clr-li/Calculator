var dragging = false;
$('#dragbar').mousedown(function(e){
    e.preventDefault();
    
    dragging = true;
    var main = $('.graph');
    var ghostbar = $('<div>',
                    {id:'ghostbar',
                        css: {
                            height: main.outerHeight(),
                            top: main.offset().top,
                            left: main.offset().left
                            }
                    }).appendTo('body');
    
    $('#touchcatch').css("display","block");       
    $('#touchcatch').mousemove(function(e){
        ghostbar.css("left",e.pageX+2);
        e.preventDefault();
    });
});

$('#touchcatch').mouseup(function(e){
    if (dragging) 
    {
        $('.eqContainer').css("width",e.pageX+2);
        $('.graph').css("left",e.pageX+2);
        $('#ghostbar').remove();
        $('#touchcatch').unbind('mousemove');
        dragging = false;
        $('#touchcatch').css("display","none");
        resize();
    }
    e.preventDefault();
});

function resize() {
    // hide graphing calculator when device is horizontal
    let aspectRatio = 1; // 934.17/702.4; // height/width
    if (window.innerHeight < window.innerWidth * aspectRatio - 10) {
        document.getElementById('hidable').style.display = "block";
    } else {
        document.getElementById('hidable').style.display = "none";
    }
  
    // size plotly toolbar
    [...document.getElementsByClassName('modebar-btn')].forEach((elem) => {
        elem.style.fontSize = '32px';
    });

    // size graph window
    try {
        document.getElementById('scene').style.height = "calc(100vh - 42px)";
        document.getElementById('scene').style.width = "100%";
        document.getElementById('scene').style.top = "42px";
        document.getElementById('scene').style.left = "0px";
        document.getElementsByClassName('svg-container')[0].style.width = "100%";
    } catch {
        layout.height = document.getElementsByClassName('graph')[0].clientHeight;
        layout.width = document.getElementsByClassName('graph')[0].clientWidth;
        refresh();
    }
}
window.document.body.onclick = resize;
window.document.body.ontouchend = resize;

window.onresize = () => {
    resize();
};
window.onresize()

// simulate mouse moves from touch
document.getElementById('dragbar').addEventListener('touchstart', (event) => touchHandler(event));
document.getElementById('dragbar').addEventListener('touchmove', (event) => touchHandler(event));
document.getElementById('dragbar').addEventListener('touchend', (event) => touchHandler(event));
document.getElementById('touchcatch').addEventListener('touchstart', (event) => touchHandler(event));
document.getElementById('touchcatch').addEventListener('touchmove', (event) => touchHandler(event));
document.getElementById('touchcatch').addEventListener('touchend', (event) => touchHandler(event));

function touchHandler(event)
{
    console.log(`touchHandler triggered for event ${event.type}`);
    var touches = event.changedTouches,
        first = touches[0],
        type = "";
    switch(event.type)
    {
      case "touchenter": type = "mouseover"; break;
      case "touchleave": type = "mouseout";  break;
      case "touchstart": type = "mousedown"; break;
      case "touchmove":  type = "mousemove"; break;        
      case "touchend":   type = "mouseup";   break;
      default:           return;
    }

    var opts = {
      bubbles: true,
      screenX: first.screenX,
      screenY: first.screenY,
      clientX: first.clientX,
      clientY: first.clientY,
    };
  
    var simulatedEvent = new MouseEvent(type, opts);
  
    first.target.dispatchEvent(simulatedEvent);
    document.getElementById('touchcatch').dispatchEvent(simulatedEvent); // force simulation on touchcatch to make sure the dragbar gets the event
    // event.preventDefault();
}

// make equations draggable
function limit(val, min, max) {
  return (val <= min)? min : (val >= max)? max : val; 
}

let _startY = 0;		
let _offsetY = 0;
let _dragElements;
document.getElementById('equations').onmousedown = OnMouseDown;
document.onmouseup = OnMouseUp;

function OnMouseDown(event){
  document.getElementById('equations').onmousemove = OnMouseMove;
  _startY = event.clientY;
  _offsetY = document.getElementsByClassName('equation')[0].offsetTop;
  _dragElements = document.getElementsByClassName('equation');

}

function OnMouseMove(event){
  let contentHeight = document.getElementsByClassName('equation')[document.getElementsByClassName('equation').length - 1].offsetTop + 2* document.getElementsByClassName('equation')[0].offsetTop + document.getElementsByClassName('equation')[document.getElementsByClassName('equation').length - 1].clientHeight;
  document.getElementById('equations').scrollTo(0, -limit(_offsetY + event.clientY - _startY, document.getElementById('equations').clientHeight-contentHeight, 0));
}

function OnMouseUp(event){
  document.getElementById('equations').onmousemove = null;
  _dragElements=null;
}

document.getElementById('equations').addEventListener('touchstart', (event) => touchHandler(event));
document.getElementById('equations').addEventListener('touchmove', (event) => touchHandler(event));
document.getElementById('equations').addEventListener('touchend', (event) => touchHandler(event));

// force plotly relayout??
document.getElementById('plotly').addEventListener('touchend', (event) => touchHandler(event));