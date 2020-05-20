//have to list p5 variables used here otherwise they will give fake Reference Error */
/* global createCanvas background point rect ellipse fill stroke noFill noStroke width height colorMode HSB line strokeWeight push pop translate scale frameCount p5 math mouseX pmouseX mouseY pmouseY d*/
// client-side js, loaded by index.html
// run by the browser each time the page is loaded

// TODO:
// - add icon to browser tab
// - check how well it runs on chromebook
// - vertical/horizontal asymptotes
// - add phone pinch/zoom in
// - add inequality constraints (makeshift piecewise functions)
// - make UI work/look fit on phone
// - window/canvas resize
// - quality slider in settings that changes inc?
// - put style in css file
// - add mathjax representation of equations?
// - fix functions like sqrt
// - don't let them zoom in so much?


console.log("running script.js");
var Parser = require("expr-eval").Parser;
var parser = new Parser();

const math = require('mathjs');

console.log("watch found watch found  epic");
const sketch = p => {
  
   //JQuery stuff here
  $(document).ready(function(){
      
      //prevent default keyboard behaviors
      $(window).keydown(function(event){
        if(event.keyCode == 13) {
          //prevent form submission on enter
          event.preventDefault();
          return false;
        }
      });
    
    
      //zoom buttons
      /*
      $('#zoomInButton').on('click', function(){
        p.rescale(null,-7);
      })
      $('#zoomOutButton').on('click', function(){
        p.rescale(null,7);
      })*/

      let $menu = $('#menuContainer');
      let $manageMenuButtonDiv = $('#manageMenuButtonDiv');
      let $manageMenuButton = $('#manageMenuButton');
      
      //set class to match size of menu
      $menu.on('animationend', function(){
        if($menu.hasClass('growing')){
          $menu.addClass('grown');
        } else if ($menu.hasClass('shrinking')){
          $menu.addClass('normal');
        }
      })

      //expand/contract menu buttons
      $('#manageMenuButton').on('click', function(){
        console.log('manage menu clicked')
        if($menu.hasClass('normal')){
          $menu.addClass('growing');
          $menu.removeClass('shrinking');
          $menu.removeClass('normal');
          console.log('check 1');
          $manageMenuButtonDiv.addClass('movingRight');
          $manageMenuButtonDiv.removeClass('movingLeft');
          $manageMenuButton.prop('value','<<');
        } else if ($menu.hasClass('grown')){
          $menu.removeClass('grown');
          $menu.removeClass('growing');
          $menu.addClass('shrinking');
          $manageMenuButtonDiv.addClass('movingLeft')
          $manageMenuButtonDiv.removeClass('movingRight');
          $manageMenuButton.prop('value','>>');
        }
      });
    
    $('#updateEquationsButton').on('click', function(){
      funcs = [];
      //check if input is valid
      for(let i = 0; i < TOTAL_EQUATIONS; i++){
        let func = $('.equation')[i].value;
        if(func.length > 0){
          funcs[i]= func;
          value_store[func] = {};
          p.clear();
          p.plot();
        }
      }
    });
    
    $('#clearEquationsButton').on('click', function(){
      if(confirm("Are you sure you want to clear all equations?")){
        $('.equation').prop('value', "");
        funcs = [];
        value_store = {};
        p.clear();
        p.plot();
      }
    })
    
  })
  //end of JQuery stuff
  
  console.log("starting sketch...");
  //set up camera/view variables
  let domain = 64;
  let range = 64;
  let xOff = 0;
  let yOff = 0;
  let factor = 1;
  let aspect_ratio = window.innerWidth / window.innerHeight;
  let funcs = [];
  let value_store = {};
  let TOTAL_EQUATIONS = 3;
  
  let canvas_left; 
  let canvas_right;
  let canvas_bottom;
  let canvas_top;
  
  let inc;

  //amount of space (in pixels) between each line
  let sep_x =(window.innerWidth / domain) *(window.innerWidth > window.innerHeight ? 1 : window.innerHeight / window.innerWidth);
  let sep_y = (window.innerHeight / range) * (window.innerHeight > window.innerWidth ? 1 : window.innerWidth / window.innerHeight);

  //classic setup function
  p.setup = function() {
    console.log("in setup");
    let canvas = p.createCanvas(window.innerWidth, window.innerHeight);
    
    canvas_left = -p.width / 2 - xOff;
    canvas_right = p.width / 2 - xOff;
    canvas_bottom = -p.height / 2 + yOff;
    canvas_top = p.height / 2 + yOff;
    
    inc = 0.0025*sep_x;//sep_x/domain;
    //canvas.mouseWheel(p.rescale);
    p.background(255);
    p.textSize(16);
    p.textAlign(p.CENTER);
    p.plot();
  };
  
  //shift canvas with mouse drag
  p.mouseDragged = function() {
    p.clear();
    //console.log('mouse drag')
    xOff += p.mouseX - p.pmouseX;
    yOff += p.mouseY - p.pmouseY;
    if(p.frameCount % 10 === 0) p.plot();
    //prevent default behaviors
    return false;
  };
  
 /*  p.mouseClicked = function(){
    p.clear();
    p.goto_x(2);
    p.plot();
  }  */
  
  p.goto_x = function(x_position){
    //console.log(x_position, sep_x, xOff);
    xOff = -x_position*sep_x;
  }

  p.plot = function() {
    //define canvas/view boundaries (what intervals to draw on)
    canvas_left = -p.width / 2 - xOff;
    canvas_right = p.width / 2 - xOff;
    canvas_bottom = -p.height / 2 + yOff;
    canvas_top = p.height / 2 + yOff;

    p.push();
      p.translate(p.width / 2 + xOff, p.height / 2 + yOff);
      p.scale(1, -1);

      //y is POSITIVE UP
      //draw grid
      //vertical lines
      p.stroke(0);
      p.strokeWeight(0.2);
      for (let i = 0; i < canvas_right; i += sep_x * factor) {
        p.line(i, canvas_top, i, canvas_bottom);
        if(i % (5*sep_x) === 0 && i !== 0) {
          p.scale(1,-1);
          p.text((Math.floor(i/(sep_x))).toString(),i, Math.min(Math.max(-4, -canvas_top+16), -canvas_bottom));
          p.scale(1,-1);
        }
      }
      for (let i = 0; i > canvas_left; i -= sep_x * factor) {
        p.line(i, canvas_top, i, canvas_bottom);
        if(i % (5*sep_x) === 0 && i !== 0) {
          p.scale(1,-1);
          p.text((Math.floor(i/(sep_x))).toString(),i, Math.min(Math.max(-4, -canvas_top +16), -canvas_bottom));
          p.scale(1,-1);
        }
      }
      //horizontal lines
      for (let j = 0; j < canvas_top; j += sep_y * factor) {
        p.line(canvas_left, j, canvas_right, j);
        if(j % (5*sep_y) === 0 && j !== 0) {
          p.scale(1,-1);
          let axis_num = Math.floor(j/(sep_y));
          let digits = Math.floor(Math.log10(axis_num)) +1;
          p.text(axis_num.toString(),Math.max( Math.min(digits*4 +4, canvas_right-digits*4-20), canvas_left + digits*4 + 8),-j);
          p.scale(1,-1);
        }
      }
      for (let j = 0; j > canvas_bottom; j -= sep_y * factor) {
        p.line(canvas_left, j, canvas_right, j);
        if(j % (5*sep_y) === 0 && j !== 0) {
          p.scale(1,-1);
          let axis_num = Math.ceil(j/(sep_y));
          let digits = Math.floor(Math.log10(Math.abs(axis_num))) +1;
          p.text(axis_num.toString(),Math.max(Math.min(digits*4 + 4, canvas_right-digits*4-20), canvas_left + digits*4+8),-j);
          p.scale(1,-1);
        }
      }
      //draw main axes in BOLD
      p.strokeWeight(3);
      //y-axis
      p.line(0, canvas_top, 0, canvas_bottom);
      //x-axis
      p.line(canvas_left, 0, canvas_right, 0);

      
      //not sure if this is the best way to do this
      //but i didn't want to have to multiply each value by sep_x or sep_y every time.
      //might be easier to do that in the long run idk
      p.scale(1 * sep_x, 1 * sep_y);
      p.strokeWeight(1 / sep_x);


      p.strokeWeight(2/sep_x)

      
      //console.log(xOff, yOff)
      for (let x = Math.floor((canvas_left)/sep_x); x < Math.ceil((canvas_right)/sep_x); x += inc) {
        for(const [i,func] of funcs.entries()){
          if(!func) continue;
          if(!value_store[func].hasOwnProperty(x)) value_store[func][x] = func.evaluate(x);
          if(!value_store[func.hasOwnProperty(x+inc)]) value_store[func][x+inc] = func.evaluate(x+inc);
          let col = document.getElementById(`equation${i+1}Color`).value;
          p.stroke(p.color(col))
          p.line(x, value_store[func][x], x + inc, value_store[func][x+inc]);
        }     
      }
    p.pop();
  };
};

var myp5 = new p5(sketch);
console.log(myp5);

String.prototype.evaluate = function(x_value) {
  return parser.evaluate(this.valueOf(), {x: x_value}); //math.evaluate(this.valueOf(), {x:x_value});
};

