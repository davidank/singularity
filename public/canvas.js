/////////////////////////////////////////////////////////////
// Initialize + Globals
const canvas = document.getElementById("main");

let innerHeight = window.innerHeight;
let innerWidth = window.innerWidth;

// Mouse Globals
let mousePosition = {
  x: null,
  y: null,
};

let mouseProximityThreshold = 10;
let mouseHold = false;
let intensityHold = false;
let mouseIntensity = 0;
let intensityToAccelerationScaler = 50;
let mouseIntensitySpeed = 0.005;
let ballsConsumed = 0;
let textColorAtMaxBalls = "#DAA520";

// Colors
let colors = [
  "#243752",
  "#0A6187",
  "#C7C7C7",
  "#F25944",
  "#F5F5FF",
];

let collisionColor = "green";

// Circle Globals
let circleFriction = 0.995;
let circleEndFrictionThreshold = 1.025
let totalBalls = 322;

// Canvas Globals
canvas.height = innerHeight;
canvas.width = innerWidth;

console.log('Canvas:', canvas);

let ctx = canvas.getContext('2d');

console.log('Context:', ctx);

/////////////////////////////////////////////////////////////
// Constructors
class Circle {
  // -> _ means original value
  constructor(x, y, r, dx, dy, color, ax, ay) {
    this.x = x;
    this.y = y;
    this.r = r;
    this._dx = dx;
    this._dy = dy;
    this._velocity = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    this.dx = dx;
    this.dy = dy;
    this.ax = ax || 0;
    this.ay = ay || 0;
    this.color = color || "black";
    this._color = color || "black";
    this.stopDraw = false;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, Math.PI * 2, false);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
    // ctx.stroke();
  }
  
  update() {
    // Should this particle Draw
    let dist = distanceFrom(this.x, this.y, mousePosition.x, mousePosition.y);
    if (!this.stopDraw) {
      // Apply Accelerations
      if (mouseIntensity > 0) {
        if (dist < mouseProximityThreshold) {
          dist = mouseProximityThreshold;
        }

        this.ay = (mouseIntensity * intensityToAccelerationScaler) * 
                  (mousePosition.y - this.y) /
                  (Math.pow(dist, 2));

        this.ax = (mouseIntensity * intensityToAccelerationScaler) * 
                  (mousePosition.x - this.x) /
                  (Math.pow(dist, 2));
      } else {
        this.ax = 0;
        this.ay = 0;
      }

      this.dx += this.ax;
      this.dy += this.ay;

      // Velocity Reset
      if (!mouseHold) {
        let currentVelocity = Math.sqrt(Math.pow(this.dx, 2) + Math.pow(this.dy, 2));
        if (currentVelocity > this._velocity) {
          if ((currentVelocity / this._velocity) < circleEndFrictionThreshold) {
            this.dx = (this.dx / circleEndFrictionThreshold);
            this.dy = (this.dy / circleEndFrictionThreshold);
          } else {
            this.dx = this.dx * circleFriction;
            this.dy = this.dy * circleFriction;
          }
        }
      }

      // Apply Velocities
      this.x += this.dx;
      this.y += this.dy;

      // Collision with canvas bounds when not intensifying
      if (!mouseHold) {
        // Right
        if (this.x > innerWidth - this.r && this.dx > 0) {
          this.dx = -this.dx;
        }

        // Left
        if (this.x < this.r && this.dx < 0) {
          this.dx = -this.dx;
        }

        // Bottom
        if (this.y > innerHeight -this.r && this.dy > 0) {
          this.dy = -this.dy;
        }

        // Top
        if (this.y < this.r && this.dy < 0) {
          this.dy = -this.dy;
        }
      }

      // Mouse Proximity Detection
      if (dist - this.r < mouseProximityThreshold && mouseIntensity === 1) {
        // this.color = collisionColor;
        this.stopDraw = true;
        mouseProximityThreshold += 0.25;
        ballsConsumed++
        // console.log('balls:', mouseProximityThreshold);
      } else {
        this.draw();
      }
    } else {
      if (mouseIntensity < 1) {
        this.stopDraw = false;
        mouseProximityThreshold -= 0.25;
        ballsConsumed--;
        this.x = mousePosition.x;
        this.y = mousePosition.y;
      }
    }

  }
};

class MouseRadius{
  constructor(mpt, _mousePosition) {
    this.mpt = mpt;
    this._mousePosition = _mousePosition;
    this.color = rgba(0, 0, 0, mouseIntensity);
  }

  draw() {
    if (this._mousePosition.x !== undefined && this._mousePosition.y !== undefined) {
      ctx.beginPath();
      ctx.arc(this._mousePosition.x, this._mousePosition.y, this.mpt, Math.PI * 2, false);
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.stroke();
    }

    if (ballsConsumed > 0) {
      let font = "bold " + this.mpt + "px serif";
      let display = '' + ballsConsumed;
      let textColor = "white";
      if (ballsConsumed === totalBalls) {
        textColor = textColorAtMaxBalls;
      }
      ctx.font = font;
      ctx.textBasleline = "middle";
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.fillText(display, this._mousePosition.x, this._mousePosition.y + this.mpt / 4);
    }
  }

  update() {
    this.mpt = mouseProximityThreshold;
    this._mousePosition = mousePosition;
    this.color = rgba(0, 0, 0, mouseIntensity);
    this.draw();
  }
}

/////////////////////////////////////////////////////////////
// Utility
const randomInRange = (min, max) => {
  return (Math.random() * (max - min)) + min;
}

const rgba = (r, g, b, a) => {
  if (a > 1) {
    a = 1;
  }
  if (a < 0) {
    a = 0;
  }
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const distanceFrom = (x1, y1, x2, y2, offset) => {
  if (offset === undefined) {
    offset = 0;
  }
  return Math.sqrt(Math.pow(Math.abs(x1 - x2) - offset, 2) + Math.pow(Math.abs(y1 - y2) - offset, 2));
}

const circleParameters = () => {
  return [
    randomInRange(70, innerWidth - 70), // xPosition
    randomInRange(70, innerHeight - 70), // yPosition
    randomInRange(2, 5), // radius
    randomInRange(-5,5), // dx
    randomInRange(-5,5), // dy
    colors[Math.floor((randomInRange(0, 4.5)))], // color
  ];
}

const generateCircle = (n) => {
  let circles = [];
  for (let i = 0; i < n; i++) {
    circles.push(new Circle(...circleParameters()));
  }
  return circles;
}

const drawAll = function() {
  [].forEach.call(arguments, (objClass) => {
    objClass.forEach((objInstance) => {
      objInstance.draw();
    });
  });
}

const updateAll = function() {
  [].forEach.call(arguments, (objClass) => {
    objClass.forEach((objInstance) => {
      objInstance.update();
    });
  })
}

const handleMouseIntensity = () => {
  if (!intensityHold) {
    if (mouseHold) {
      if (mouseIntensity < 1) {
        mouseIntensity += mouseIntensitySpeed;
      } else {
        mouseIntensity = 1;
      }
    } else {
      if (mouseIntensity > 0) {
        mouseIntensity -= mouseIntensitySpeed;
      } else {
        mouseIntensity = 0;
      }
    }
  }
  // console.log('mi:', mouseIntensity);
}

/////////////////////////////////////////////////////////////
// Main
const init = () => {
  // Refresh Screen
  ctx.clearRect(0, 0, innerWidth, innerHeight);

  // Init Drawn Objects
  let circles = generateCircle(totalBalls);
  let mouseRadius = [new MouseRadius(mouseProximityThreshold, mousePosition)];
  drawAll(circles, mouseRadius);

  // Init Event Listeners
  window.addEventListener("mousemove", (e) => {
    mousePosition.x = e.x;
    mousePosition.y = e.y;
  });

  window.addEventListener("mousedown", (e) => {
    mouseHold = true;
  });

  window.addEventListener("mouseup", (e) => {
    mouseHold = false;
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === ' ') {
      intensityHold = true;
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === ' ') {
      intensityHold = false;
    }
  });

  // Animation Loop
  const animate = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    handleMouseIntensity();
    updateAll(circles, mouseRadius);
    window.requestAnimationFrame(animate);
  }

  animate();
}

init();
