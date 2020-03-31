/**
 *
 * @param {number} max
 * @param {number} min
 * @param {boolean} floor
 * @returns {number}
 */
function getRandomWithMaxMin(max, min, disableFloor = false) {
  return !disableFloor
    ? Math.ceil(Math.random() * (max - min) + min)
    : Math.random() * (max - min) + min;
}

/**
 *
 * @param {string[]} availableColors
 * @returns {string}
 */
function getRandomColor(availableColors) {
  return availableColors[getRandomWithMaxMin(availableColors.length, 0)];
}

/**
 * @returns {number}
 */
function getRandomRadius() {
  return getRandomWithMaxMin(20, 15);
}

/**
 * @returns {number}
 */
function getRandomSign() {
  return Math.random() < 0.5 ? -1 : 1;
}

/**
 * @returns {Victor}
 */
function getRandomMovementVector() {
  return new Victor(
    +(Math.random() * 7 * getRandomSign()).toFixed(2),
    +(Math.random() * 7 * getRandomSign()).toFixed(2)
  );
}

/**
 * @param {number} length
 * @param {Victor} initialVector
 * @returns {Circle[]}
 */
function generateCircles(length, initialVector) {
  return new Array(length).fill("").map(circle => {
    const c = getRandomWithMaxMin(400, 300);
    const r = getRandomRadius();
    return {
      color: getRandomColor(COLORS),
      ir: r,
      r,
      step: getRandomWithMaxMin(0.2, 0.3, true),
      c: new Victor(c, c).add(initialVector),
      iv: new Victor(initialVector.x, initialVector.y),
      v: new Victor(initialVector.x, initialVector.y),
      mv: getRandomMovementVector()
    };
  });
}

/**
 *
 * @param {Victor} positionVector
 * @return {MouseCircle}
 */
function generateMouseCircle(positionVector) {
  return {
    v: positionVector,
    ir: 50,
    r: 0,
    mr: getRandomWithMaxMin(200, 100),
    step: getRandomWithMaxMin(4, 3, true),
  };
}

const easing = t => t * t * t * t * t;
const easing2 = t => 1 + --t * t * t * t * t;

/**
 * @typedef {Object} Victor
 * @property {number} x
 * @property {number} y
 * @property {Function} add
 */

/**
 * @typedef {Object} Circle
 * @property {number} ir - describe initial radius
 * @property {number} r - describe radius
 * @property {Victor} v - describe current vector
 * @property {Victor} c - describe life length
 * @property {Victor} iv - describe initial vector
 * @property {Victor} mv - describe movement vector
 * @property {number} step - describe radius decrease step
 * @property {string} color
 */

/**
 * @typedef {Object} MouseCircle
 * @property {number} ir - describe initial radius
 * @property {number} r - describe current radius
 * @property {number} mr - describe max radius
 * @property {number} step - describe radius increase step
 * @property {Victor} v - describe position vector
 */

const DOM_CANVAS = document.querySelector("#canvas");

/**
 * @type {string} BACKGROUND
 */
const BACKGROUND = "#0E1111";
/**
 * @type {string[]} COLORS
 */
const COLORS = [
  "#fff176",
  "#ff8a65",
  "#81c784",
  "#4fc3f7",
  "#9575cd",
  "#f44336",
  "#e77e23",
  "#f1c40f",
  "#16a086",
  "#AFCFEA",
  "#004156",
  "#70E852",
  "#FED876",
  "#F85C50",
  "#F5B2AC",
  "#460000",
  "#FFBEED",
  "#380438",
  "#852EBA"
];

DOM_CANVAS.width = window.innerWidth * window.devicePixelRatio;
DOM_CANVAS.height = window.innerHeight * window.devicePixelRatio;

/**
 * @type {CanvasRenderingContext2D} ctx
 */
const ctx = DOM_CANVAS.getContext("2d");

ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

/**
 * @type {Circle[]} circles
 */
let circles = [];
/**
 * @type {MouseCircle}
 */
let mouseCircles = [];

/**
 * @type {{x: number, y: number}} lastClickPosition
 */
const lastClickPosition = {
  x: undefined,
  y: undefined
};

/**
 *
 * @param {MouseEvent} e
 */
const clickHandler = e => {
  lastClickPosition.x = e.pageX;
  lastClickPosition.y = e.pageY;

  circles = [
    ...circles,
    ...generateCircles(
      getRandomWithMaxMin(30, 40),
      new Victor(e.pageX, e.pageY)
    )
  ];

  mouseCircles.push(generateMouseCircle(new Victor(e.pageX, e.pageY)));
};

DOM_CANVAS.onclick = clickHandler;

const render = () => {
  clear();

  renderMouseCircles();
  renderCircles();
  window.requestAnimationFrame(render);
};

window.requestAnimationFrame(render);

function clear() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function renderCircles() {
  /**
   * @type {Circle[]} circle
   */
  circles = circles.filter(circle => {
    if (circle.r <= 0) {
      return false;
    }

    ctx.beginPath();
    const diff = circle.r - circle.step;

    circle.r = diff <= 0 ? 0 : diff;

    const renderRadius = circle.r - circle.step <= 0 ? 0 : easing(diff / circle.ir) * circle.ir;

    ctx.arc(circle.v.x, circle.v.y, renderRadius, 0, 2 * Math.PI);
    ctx.fillStyle = circle.color;
    ctx.fill();
    ctx.closePath();

    circle.v.add(circle.mv);

    return circle;
  });
}

function renderMouseCircles() {
  mouseCircles.filter(mouseCircle => {
    if (mouseCircle.r >= mouseCircle.mr || mouseCircle.r + mouseCircle.step >= mouseCircle.mr) {
      return false;
    }

    mouseCircle.r = mouseCircle.r + mouseCircle.step;

    const t = ((mouseCircle.mr - mouseCircle.ir) - mouseCircle.r) / mouseCircle.mr;

    const radius = (1 - easing2(t)) * mouseCircle.mr;

    ctx.beginPath();
    
    ctx.arc(mouseCircle.v.x, mouseCircle.v.y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(255, 255, 255, ${t})`;
    ctx.stroke();
    ctx.closePath();

    return mouseCircle;
  });
}
