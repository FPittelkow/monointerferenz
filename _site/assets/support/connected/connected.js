var nodes = [];

function setup() {
  // Save the canvas element so we can modify its properties.
  let canvas = createCanvas(canvasWidth(), canvasHeight());
  canvas.parent(document.querySelector('main'));
  smooth();
  
  // Disable the default touch actions on the canvas to prevent scrolling.
  canvas.elt.style.touchAction = 'none';
  canvas.elt.addEventListener('touchmove', function(e) {
    e.preventDefault();
  }, { passive: false });
  
  // Create an initial array of 100 nodes.
  for (var i = 0; i < 100; i++) {
    nodes.push(new Node());
  }
  // Use a translucent black background to create motion trails.
  background(0);
}

function windowResized() {
  resizeCanvas(canvasWidth(), canvasHeight());
  background(0);
}

function canvasWidth() {
  var main = document.querySelector('main');
  return main ? main.clientWidth : windowWidth;
}

function canvasHeight() {
  var main = document.querySelector('main');
  return main ? main.clientHeight : windowHeight;
}

function draw() {
  // Create a fading effect to leave trails of past positions.
  fill(0, 20);
  noStroke();
  rect(0, 0, width, height);
  
  // Draw lines (neural connections) between nodes that are close to each other.
  for (var i = 0; i < nodes.length; i++) {
    for (var j = i + 1; j < nodes.length; j++) {
      var d = dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
      if (d < 150) {
        // The closer the nodes, the brighter the connection.
        stroke(150, 200, 255, map(d, 0, 150, 255, 0));
        line(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
      }
    }
  }
  
  // Update and display each node.
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].update();
    nodes[i].display();
  }
  
  // (Optional) Display the current node count.
  //fill(255);
  //textAlign(LEFT, TOP);
  //textSize(14);
  //text("Drag to increase or decrease the number of Ideas.);
}

// Modify the number of nodes based on drag direction.
// Dragging right (positive mouse movement) adds nodes,
// while dragging left removes nodes.
function mouseDragged() {
  let diff = mouseX - pmouseX;
  if (diff > 0) {
    // Add nodes: one for every 5 pixels dragged right.
    if (nodes.length < 601) {
      let nodesToAdd = floor(diff / 5);
      for (let i = 0; i < nodesToAdd; i++) {
        nodes.push(new Node());
      }
    }
  } else if (diff < 0) {
    // Remove nodes: one for every 5 pixels dragged left, but don't go below 10 nodes.
    let nodesToRemove = floor(abs(diff) / 5);
    for (let i = 0; i < nodesToRemove; i++) {
      if (nodes.length > 10) {
        nodes.pop();
      }
    }
  }
}

// For touch devices, prevent the default behavior and call mouseDragged.
function touchMoved(e) {
  e.preventDefault();  // Prevents page scrolling.
  mouseDragged();
  return false;
}

// Node class represents an individual "thought" moving on the canvas.
function Node() {
  this.x = random(width);
  this.y = random(height);
  this.vx = random(-2, 2);
  this.vy = random(-2, 2);
}

Node.prototype.update = function() {
  this.x += this.vx;
  this.y += this.vy;
  // Bounce off the edges of the canvas.
  if (this.x < 0 || this.x > width) this.vx *= -1;
  if (this.y < 0 || this.y > height) this.vy *= -1;
};

Node.prototype.display = function() {
  noStroke();
  fill(255, 200);
  ellipse(this.x, this.y, 10, 10);
};
