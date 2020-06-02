//Calculus-Calculator v1.0.0
//by Eddie Krystowski and Joey Krystowski

//have to list p5 as a global variable to stop code editor from thinking it is undefined
/*global p5 */

// client-side javascript, loaded by index.html
// run by the browser each time the page is loaded

// TODO:
// - vertical asymptotes
// - add inequality constraints (makeshift piecewise functions)
// - put style in css file
// - fix functions like sqrt that lag when mouse goes left of them with deriv mode on
// - Add setting to let people change the increments on the x axis from 5 to something else (not less than 1?)
// - Add area inbetween functions? see p5js erase and consider drawing axes AFTER plotting functions
// - Add rainbow colored lines!
// - Add console art!
// - Display slope in tangent line mode!!!!!
// - Display position of mouse cursor?

//import mathjs into project
//this library is for calculating the derivative of a function at a certain point
//used in tangent line mode
const { create, all } = require('mathjs');
const math = create(all);

//this is a simple class that is made to toggle console.log on or off
const Logger = function(){
  this.oldConsoleLog = null;
  
  this.enableLogger = function(){
    if(this.oldConsoleLog === null) return;
    window['console']['log'] = this.oldConsoleLog;
  }
  
  this.disableLogger = function(){
    this.oldConsoleLog = console.log;
    window['console']['log'] = function() {};
  }
}

//this is used in production, because any logging to the console will slow down performance, and is unnecessary
//any console.log() statements after this will not be run, but are left in for debugging if we turn this back on later
const logger = new Logger();
logger.disableLogger();


console.log("running script.js");

//import expr-eval into the project
//this library is much much much more lightweight and faster than mathjs, so it is used for intepreting and evaluating functions for graphing
var Parser = require("expr-eval").Parser;
var parser = new Parser();

//RIEMANN SUMS!
//this function only support equal partitions
//this function draws and evaluates Riemann sum at the same time.
function riemann(type, equation, start, end, partitions){
  //determine number of steps based on given range and partitions
  let step = (end-start)/(partitions);
  let total = 0;
  //change the start to be start + step/2 if it is a midpoint Riemann sum
  start = (type === 'Midpoint' ? start + step/2 : start);
  
  //loop through the partitions
  for(let p = 0; p < partitions; p++){
    //calculate x position based on current partition we are drawing/evaluating
    let x = start+p*step;
    //calculate the x position of the left size of the rectangle we are drawing
    //we cheat and draw all rectangles from left to right even if it is a right Riemann sum
    let left_x = (type === 'Midpoint' ? x - step/2 : x);
    //draw the rectangle
    this.rect(left_x, equation.evaluate(x), left_x +step, 0);
    //add area to the total
    total += equation.evaluate( (type === 'Midpoint' ? x + step/2 : x) )*step;
  }
  return total;
}

//integrate! (definitely)
//basically identical to a midpoint riemann sum, just with very small step
//it is explicitly made its own function only for naming purposes
function integrate (equation, start, end, step) {
  let total = 0;
  step = step || 0.01;
  for (let x = start; x < end; x += step) {
    total += equation.evaluate(x + step / 2) * step
  }
  //.toFixed(4) rounds it to 4 decimal places
  return total.toFixed(4);
}


//this is creating a p5 'sketch'
//p5 is the library we are using to efficiently draw things on the screen using the HTML Canvas
const sketch = p => {
  
  //Inside $(document).ready, we add all of the user input functionality, such as clicking on buttons, checking checkbox, etc.
  $(document).ready(function(){
      
      //prevent default keyboard behaviors
      $(window).keydown(function(event){
        if(event.keyCode == 13) {
          //prevent form submission on enter (this would refresh page)
          event.preventDefault();
          return false;
        }
      });
    
    
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
      });

      //expand/contract menu buttons
      //fancy sliding animation
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
    
    //'Update'button is clicked
    $('#updateEquationsButton').on('click', function(){
      funcs = [];
      //check if input is valid
      for(let i = 0; i < TOTAL_EQUATIONS; i++){
        //sanitize input
        let func = $('.equation')[i].value.toLowerCase();
        func = func.replace('e^', 'exp ')
        
        //try to parse and evaluate the function
        //if it fails and there is an error, then we know they entered an invalid equation.
        try {
          //try to parse function
          parser.parse(func);
          parser.evaluate(func, {x:1});
        } catch (error){
          //if there is an error, skip this function and show error message
          console.log('Error!');
          //if the function is empty, there is no point in throwing error
          if(func !== ''){
            $('.equation').eq(i).css('border', '2px solid red');
            $(`#error${i+1}`).css('display', 'block');
          }
          continue;
        }
        
        // if we reach here, then the function is a success!
        //make sure the error message is off
        $('.equation').eq(i).css('border', '2px solid black');
        $(`#error${i+1}`).css('display', 'none');
        
        //add it to the list to graph and plot it
        if(func.length > 0){
          funcs[i]= func;
          value_store[func] = {};
          p.clear();
          p.plot();
        }
      }
    });
    
    //if the clear button is clicked
    $('#clearEquationsButton').on('click', function(){
      if(confirm("Are you sure you want to clear all equations?")){
        $('.equation').prop('value', "");
        //empty all of the functions and value store values.
        funcs = [];
        value_store = {};
        p.clear();
        p.plot();
      }
    })
    
    //show/hide equation1 options
    $('#equation1OptionsButton').on('click', function(){
      
      $('#equation1OptionsDiv').toggleClass('hidden');
      if($('#equation1OptionsDiv').hasClass('hidden')){
        $('#equation1OptionsButton').prop('value', "Show Options")
      } else {
        $('#equation1OptionsButton').prop('value', "Hide Options")
      }
      
    })
    
    //show/hide equation2 options
    $('#equation2OptionsButton').on('click', function(){
      
      $('#equation2OptionsDiv').toggleClass('hidden');
      if($('#equation2OptionsDiv').hasClass('hidden')){
        $('#equation2OptionsButton').prop('value', "Show Options")
      } else {
        $('#equation2OptionsButton').prop('value', "Hide Options")
      }
      
    })
    
    //show/hide equation3 options
    $('#equation3OptionsButton').on('click', function(){
      
      $('#equation3OptionsDiv').toggleClass('hidden');
      if($('#equation3OptionsDiv').hasClass('hidden')){
        $('#equation3OptionsButton').prop('value', "Show Options")
      } else {
        $('#equation3OptionsButton').prop('value', "Hide Options")
      }
    })
    
    //when the riemann checkbox changes state
    $('.checkbox.riemann').change(function(){
      //if integral mode is on, turn it off
      if($(`#integralMode${this.id.slice(-1)}`).prop('checked') === true){
        $(`#integralMode${this.id.slice(-1)}`).prop('checked', false);
      }
    })
    
    //when the integral checkbox changes state
    $('.checkbox.integral').change(function(){
      //if riemann mode is on, turn if off
      if($(`#riemannMode${this.id.slice(-1)}`).prop('checked') === true){
        $(`#riemannMode${this.id.slice(-1)}`).prop('checked', false);
      }
    })
    
    //when a key is pressed inside the goto textboxes
    $('.goto').on('keyup', function(event){
      //if the key was ENTER
      if(event.which === 13){
        //if there is a value for 'x' field, change x position.
        if( $('#gotoX').val().length !== 0 && !isNaN(Number($('#gotoX').val())) ){
          p.goto_x(Number($('#gotoX').val()));
        }
        //if there is a value for 'y' field, change y position.
        if( $('#gotoY').val().length !== 0 && !isNaN(Number($('#gotoY').val())) ){
          p.goto_y(Number($('#gotoY').val()));
        }
      }
    })
    
    //make the help screen vanish when the 'x' button is pressed
    $('#helpExitButton').on('click', function(){
      $('#helpContainer').css('display', 'none');
    })
    
    //make the help screen appear when the '?' button is pressed
    $('#helpButton').on('click', function(){
      $('#helpContainer').css('display', 'block');
    })
    
  })
  //end of JQuery event handlers
  
  console.log("starting sketch...");
  
  //set up camera/view variables
  //domain & range are how many boxes are shown on screen at once
  let domain = 64;
  let range = 64;
  //xOff and yOff are offsets that allow you to 'pan' the graph around
  let xOff = 0;
  let yOff = 0;
  //obsolete variable used in old zooming, keeping here in case we want to experiment with zooming again
  let factor = 1;
  let aspect_ratio = window.innerWidth / window.innerHeight;
  //funcs is the list of functions that the user has entered
  let funcs = [];
  //one of the key ways we improved performance was through the value store. There is no need to ever evaluate a function
  //at the same x position more than once. We store all values we have evaluated in value_store so that way we can just look them up
  //if we have already done them, which is much faster than doing them especially on more complex functions
  let value_store = {};
  let TOTAL_EQUATIONS = 3;
  
  //variables for keeping track of the x/y position of the boundaries of what you can see.
  let canvas_left; 
  let canvas_right;
  let canvas_bottom;
  let canvas_top;
  
  //inc is how quickly the graphing algorithm goes across the screen
  //the smaller inc is, the slower the graphing, but the higher the quality
  //this will be defined later
  let inc;

  //amount of space (in pixels) between each line
  let sep_x =(window.innerWidth / domain) *(window.innerWidth > window.innerHeight ? 1 : window.innerHeight / window.innerWidth);
  let sep_y = (window.innerHeight / range) * (window.innerHeight > window.innerWidth ? 1 : window.innerWidth / window.innerHeight);

  //disable p5 error system to increase performance
  p5.disableFriendlyErrors = true;
  
  //setup function, automatically run once at the beginning of the 'sketch' by p5
  p.setup = function() {
    console.log("in setup");
    //create the canvas
    let canvas = p.createCanvas(window.innerWidth, window.innerHeight);
    
    //make the canvas draggable so it will listen to the drag event handlers
    document.getElementById('defaultCanvas0').draggable = true;
    
    //create a blank png so no overlay is shown when dragging.
    let dragImg = document.createElement('img'); 
    dragImg.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    
    document.getElementById('defaultCanvas0').ondragstart = function(event){
      //set the dragImage
      event.dataTransfer.setDragImage(dragImg, 0, 0);
    }
    
    document.getElementById('defaultCanvas0').ondrag = function(event){
      //change the x and y offset based on mouse/finger position during dragging
      //divide by 5 to slow it down a bit
      xOff += (p.mouseX - p.pmouseX)/5;
      yOff += (p.mouseY - p.pmouseY)/5;
      //prevent default behaviors
      return false;
    }
    
    //same thing as other drag event listeners, but these are for mobile devices
    document.getElementById('defaultCanvas0').addEventListener('touchstart', function(event){
      event.dataTransfer.setDragImage(dragImg, 0, 0);
    })
    
    document.getElementById('defaultCanvas0').addEventListener('touchmove',function(event){
      //if they haven't disabled dragging on mobile
      if(!document.getElementById('disableDragCheckbox').checked){
        xOff += (p.mouseX - p.pmouseX)*5;
        yOff += (p.mouseY - p.pmouseY)*5;
      }
    })
  
    
    //define boundaries
    canvas_left = -p.width / 2 - xOff;
    canvas_right = p.width / 2 - xOff;
    canvas_bottom = -p.height / 2 + yOff;
    canvas_top = p.height / 2 + yOff;
    
    //we found through trial and error that this increment works well for this domain/range
    inc = 0.0025*sep_x;
    
    //set the background of the canvas to white
    p.background(255);
    //set up other p5 variables
    p.textSize(16);
    p.textAlign(p.CENTER);
    p.rectMode(p.CORNERS);
    //draw empty graph
    p.plot();
  };
  
  //this is simply here for debugging purposes. Don't worry about it
  p.draw = function(){}
  
  //Adjust xOff to go to a certain x position
  p.goto_x = function(x_position){
    xOff = -x_position*sep_x;
  }
  
  //Adjust yOff to go to a certain y position
  p.goto_y = function(y_position){
    yOff = y_position*sep_y;
  }

  //this is where all the fun is
  //this function is called every 45 milliseconds to refresh the graph
  p.plot = function() {
    //for debugging to see how long the function takes
    let startTime = p.millis()
    
    //define canvas/view boundaries (what intervals to draw on)
    //has to be done every time p.plot() is called because it is constantly changing
    canvas_left = -p.width / 2 - xOff;
    canvas_right = p.width / 2 - xOff;
    canvas_bottom = -p.height / 2 + yOff;
    canvas_top = p.height / 2 + yOff;

    //p.push() is a p5 function that saves the transform/position of the canvas
    //this allows us to make modifications to the canvas to simulate 'panning' around the canvas with drag
    //Think of a camera with a piece of paper underneath. Instead of moving the camera around the piece of paper,
    //we move the piece of paper under the camera, and only draw what is on the paper if that section is under the camera
    p.push();
      //translate shifts the entire coordinate grid
      p.translate(p.width / 2 + xOff, p.height / 2 + yOff);
      //the second argument to the scale function is the y-scale
      //this needs to be -1 (flipped) because computers have positive y direction as down, but when we graph functions obviously
      //the positive y direction is up
      p.scale(1, -1);
    
      //draw the grid!
      //when we draw the grid, 4 loops are required because we can't simply go from canvas_left to canvas_right drawing lines
      // because then the lines would not line up with the axes. We must start at x=0 and y=0 for every set of lines we draw
      p.stroke(0);
      p.strokeWeight(0.2);
    
      //vertical lines to the right of y-axis
      for (let i = 0; i < canvas_right; i += sep_x * factor) {
        p.line(i, canvas_top, i, canvas_bottom);
        if(i % (5*sep_x) === 0 && i !== 0) {
          p.scale(1,-1);
          p.text((Math.floor(i/(sep_x))).toString(),i, Math.min(Math.max(-4, -canvas_top+16), -canvas_bottom));
          p.scale(1,-1);
        }
      }
    
      //vertial lines to the left of y-axis    
      for (let i = 0; i > canvas_left; i -= sep_x * factor) {
        p.line(i, canvas_top, i, canvas_bottom);
        if(i % (5*sep_x) === 0 && i !== 0) {
          p.scale(1,-1);
          p.text((Math.floor(i/(sep_x))).toString(),i, Math.min(Math.max(-4, -canvas_top +16), -canvas_bottom));
          p.scale(1,-1);
        }
      }
      //horizontal lines above the x-axis
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
    
      //horizontal lines below the x-axis
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

      
      //scale up the graph so that 1 box = 1 unit
      p.scale(1 * sep_x, 1 * sep_y);
 
      //make the lineThickness based on the separation so if there is a small window, the line won't be huge
      p.strokeWeight(2/sep_x)

      //array for storing tangent line equations
      let funcsTangent = [];
      //draw tangent line!
      //loop through all of the functions
      for (let i=0; i < funcs.length; i++) {
        //if they don't have Tangent Line mode on for that function, skip it
        if(!document.getElementById(`deriv${i+1}`).checked) continue;
        
        //determine the x_value of their mouse cursor relative to the graph
        let x_val = (p.mouseX-xOff-p.width/2)/sep_x;
        //get the slope at that point
        let slope = math.derivative(funcs[i], 'x').evaluate({x: x_val});
        //generate the tangent line with point slope form
        let tangentLine = `${slope}*(x-${x_val}) + ${funcs[i].evaluate(x_val)}`;
        //add the tangent line equation to the array
        funcsTangent[i] = (tangentLine);
        
        //display slope and equation in menu. 
        document.getElementById(`slope${i+1}`).textContent = slope.toFixed(4);
        document.getElementById(`tangentEquation${i+1}`).textContent = 'y = ' + `${slope.toFixed(4)}*(x-${x_val.toFixed(4)}) + ${funcs[i].evaluate(x_val).toFixed(4)}`;
      }
    
      //plot the functions
      //loop through all functions
      for(const [i,func] of funcs.entries()){
        //loop through all x_values, stepping up by inc each time
        for (let x = Math.floor((canvas_left)/sep_x); x < Math.ceil((canvas_right)/sep_x); x += inc) {
          
          //make sure the function is not empty
          if(!func) continue;
          //if the values we are about to plot are not in the value store, calculate and insert them
          if(!value_store[func].hasOwnProperty(x)) value_store[func][x] = func.evaluate(x);
          if(!value_store[func.hasOwnProperty(x+inc)]) value_store[func][x+inc] = func.evaluate(x+inc);
          let col = p.color(document.getElementById(`equation${i+1}Color`).value);
          
          //draw the line segment
          p.stroke(col);
          p.noFill();
          p.line(x, value_store[func][x], x + inc, value_store[func][x+inc]);
          
          //If integral mode is on, SHADE!
          //Note: this is NOT where the definite integral is calculated, that is a bit later
          if(document.getElementById(`integralMode${i+1}`).checked){
            //get the min bound and if it is empty, use canvas_left instead
            let minBound = document.getElementById(`minBound${i+1}`).value.trim();
            minBound = (minBound === "" ? Math.floor((canvas_left)/sep_x) : Number(minBound));
        
            //get the max bound and if it is empty, use canvas_right instead
            let maxBound = document.getElementById(`maxBound${i+1}`).value.trim();
            maxBound = (maxBound === "" ? Math.ceil((canvas_right)/sep_x) : Number(maxBound));
            
            //swap the values if the minBound is bigger than the maxBound
            let flipped = false;
            if(minBound > maxBound){
              let temp = minBound;
              minBound = maxBound;
              maxBound = temp;
              flipped = true;
            }
            
            //add some alpha
            col = p.color(document.getElementById(`equation${i+1}Color`).value + '30');
            
            //shade under the curve using thin rectangles
            p.noStroke();
            p.fill(col);
            if(x >= minBound && x <= maxBound){
              p.rect(x, value_store[func][x], x+inc, 0);
            }
          }  
        } // end of looping through x's by inc  
        
        //if integral mode is on, calculate the area!
        //this is done redundantly outside of the loop because doing this calculation inside the loop is totally unnecessary
          //since it will always yield the same result every frame and doesn't need to be done at every x value
        //there is probably a cleaner way to avoid reusing these several lines of code, but its not too big of a deal
        if(document.getElementById(`integralMode${i+1}`).checked){
          //calculate and display integral area

          //get the min bound and if it is empty, use canvas_left instead
          let minBound = document.getElementById(`minBound${i+1}`).value.trim();
          minBound = (minBound === "" ? Math.floor((canvas_left)/sep_x) : Number(minBound));

          //get the max bound and if it is empty, use canvas_right instead
          let maxBound = document.getElementById(`maxBound${i+1}`).value.trim();
          maxBound = (maxBound === "" ? Math.ceil((canvas_right)/sep_x) : Number(maxBound));

          //swap the values if the minBound is bigger than the maxBound
          let flipped = false;
          if(minBound > maxBound){
            let temp = minBound;
            minBound = maxBound;
            maxBound = temp;
            flipped = true;
          }

          //calculate!
          //if the min bound and max bound exist, calculate the area
          if(document.getElementById(`minBound${i+1}`).value !== '' && document.getElementById(`maxBound${i+1}`).value !== ''){
            //use the custom 'integrate' function to calculate the area. (Just a very close estimate to save performance)
            //we make sure to multiply by -1 if the bounds were flipped
            document.getElementById(`integralArea${i+1}`).textContent = integrate(func, minBound, maxBound) * (flipped ? -1 : 1);
          } else {
            //otherwise, put N/A because infinite area is not supported
            document.getElementById(`integralArea${i+1}`).textContent = 'N/A';
          }
        }

        //if Riemann mode is on, shade the rectangles and calculate the Riemann area!
        if(document.getElementById(`riemannMode${i+1}`).checked){
          console.log('its checked')
          //get the bounds
          let minRiemann = Number(document.getElementById(`minRiemann${i+1}`).value.trim());
          let maxRiemann = Number(document.getElementById(`maxRiemann${i+1}`).value.trim());
          //get the partitions
          let partitions = Number(document.getElementById(`partitionNumber${i+1}`).value.trim());
          //get the type
          let type = document.getElementById(`riemannType${i+1}`).value;
          //get the color
          let col = document.getElementById(`equation${i+1}Color`).value;
          //add some alpha to the color
          p.fill(p.color(col + '20'));
          p.stroke(p.color(col +'50'));

          console.log(minRiemann);
          console.log(maxRiemann);

          //check to make sure all info is entered (only partitions matters, empty bounds will be treated as 0)
          if(partitions && partitions >= 0){
            //calculate riemann and shade it on graph
            let p_riemann = riemann.bind(p, type, func, minRiemann, maxRiemann, partitions);
            let total = p_riemann();
            //display the area
            document.getElementById(`riemannArea${i+1}`).textContent = total.toFixed(4);
          }
        }

      }

      //graph the tangent lines
      //loop through x values
      for(const [i, equation] of funcsTangent.entries()) {
        for (let x = Math.floor((canvas_left)/sep_x); x < Math.ceil((canvas_right)/sep_x); x += inc) {
          //if the equation doesn't exist, skip it
          if(!equation) continue;
          //get the color and add some alpha
          let col = document.getElementById(`equation${i+1}Color`).value + '50';
          p.stroke(p.color(col));
          //draw the tangent line!
          p.line(x, equation.evaluate(x), x+inc, equation.evaluate(x+inc));
        }
      }
    
    //p.pop() is a p5 function similar to p.push(), it restores the transform that p.push saved at the beginning
    //p.pop() must be used with p.push(), they are a pair!
    p.pop();
    
    //used for debugging performance
    if(p.frameCount % 45 === 0){
      console.log(`p.plot() took ${p.millis()-startTime} milliseconds`);
    }
  }; //END OF p.plot()
  
  //finally, run p.clear() and p.plot() every 45 milliseconds
  setInterval(function(){
    p.clear();
    p.plot();
  },  45);
};

//create the sketch!
var myp5 = new p5(sketch);

//custom extension of native String class that allows us to easily evaluate a string as a
//mathematical expression
String.prototype.evaluate = function(x_value) {
  //try to evaluate it, if it fails then return undefined
    try {
      let output = parser.evaluate(this.valueOf().toLowerCase(), {x: x_value});
      return output;
    } catch(error){
      return undefined;
    }
};