const speed = document.getElementById("speed");
const score = document.getElementById("score");
const game = document.getElementById("game");
const startScreen = document.getElementById("startScreen");
const gameArea = document.getElementById("gameArea");
const gameMessage = document.getElementById("gameMessage");
const againButton = document.getElementById("againButton");

startScreen.addEventListener("click", start);
againButton.addEventListener("click", start);
document.addEventListener("keydown", pressOn);
document.addEventListener("keyup", pressOff);

const speedList = {
  1: "super slow",
  2: "slow",
  3: "medium",
  4: "fast",
  5: "super",
};
let defaultSpeed = speed.selectedIndex + 3;
// Only can be selected before the game starts.
speed.onclick = (e) => {
  e.preventDefault();
  defaultSpeed = speed.selectedIndex + 1;
};

let keys = {};
let player = {};
let highestScore = 0;

// Mobile
game.ontouchstart = (e) => {
  e.stopPropagation();
  keys.ArrowUp = true;
};
game.ontouchend = (e) => {
  e.stopPropagation();
  keys.ArrowUp = false;
};
// document.ontouchmove = (e) => {
//   e.stopPropagation();
//   keys.ArrowUp = false;
// };

function start() {
  player.speed = defaultSpeed;
  player.score = 0;
  player.inplay = true;

  // Clean for playing again
  gameArea.innerHTML = "";

  gameMessage.classList.add("hidden");
  startScreen.classList.add("hidden");
  againButton.classList.add("hidden");
  speed.setAttribute("disabled", "");

  // Create pig and its moving tail
  let pig = document.createElement("div");
  pig.setAttribute("class", "pig");
  let tail = document.createElement("span");
  tail.setAttribute("class", "tail");
  tail.pos = 16;
  tail.style.top = tail.pos + "px";
  pig.appendChild(tail);
  gameArea.appendChild(pig);

  // Position of the pig
  player.x = pig.offsetLeft;
  player.y = pig.offsetTop;

  // Obstacles
  player.pipe = 0;
  let spacing = 200;
  // How many pipes can fit on the screen
  let howManyObstacles = Math.floor(gameArea.offsetWidth / spacing);

  for (let x = 0; x < howManyObstacles; x++) {
    buildObstacles(player.pipe * spacing);
  }

  window.requestAnimationFrame(playGame);
}

function buildObstacles(startPosition) {
  let totalScreenHeight = gameArea.offsetHeight;
  let totalScreenWidth = gameArea.offsetWidth;
  player.pipe++;
  let pipeTop = document.createElement("div");
  pipeTop.start = startPosition + totalScreenWidth;
  pipeTop.classList.add("pipe");
  // pipeTop.innerHTML = "<br/>" + player.pipe;
  pipeTop.height = Math.floor(Math.random() * 350);
  pipeTop.style.height = pipeTop.height + "px";
  pipeTop.style.left = pipeTop.start + "px";
  pipeTop.style.top = "0px";
  pipeTop.x = pipeTop.start;
  pipeTop.id = player.pipe;
  pipeTop.classList.add("bg-yellow-200");
  gameArea.appendChild(pipeTop);
  let pipeSpace = Math.floor(Math.random() * 250) + 190;
  let pipeBottom = document.createElement("div");
  pipeBottom.start = pipeTop.start;
  pipeBottom.classList.add("pipe");
  // pipeBottom.innerHTML = "<br/>" + player.pipe;
  pipeBottom.style.height =
    totalScreenHeight - pipeTop.height - pipeSpace + "px";
  pipeBottom.style.left = pipeTop.start + "px";
  pipeBottom.style.bottom = "0px";
  pipeBottom.x = pipeTop.start;
  pipeBottom.id = player.pipe;
  pipeBottom.classList.add("bg-lime-100");
  gameArea.appendChild(pipeBottom);
}

function moveObstacles(pig) {
  let pipes = document.querySelectorAll(".pipe");
  let removeCounter = 0; // how many pipes have been removed
  pipes.forEach((pipe) => {
    // console.log(pipe);
    // Remove the pipe in our visable area
    pipe.x -= player.speed;
    pipe.style.left = pipe.x + "px";
    if (pipe.x < 0) {
      // includes top one and bottom one
      pipe.parentElement.removeChild(pipe);
      removeCounter++;
    }

    if (isCollide(pipe, pig)) {
      playGameOver(pig);
    }
  });
  // Create a new pipe (obstacle)
  // Actual number of pipes we need to create
  // In buildObstacles(), we build up top and bottom pipes simultaneously
  removeCounter = removeCounter / 2;
  for (let x = 0; x < removeCounter; x++) {
    buildObstacles(0);
  }
}

function isCollide(pipe, pig) {
  let pipeRect = pipe.getBoundingClientRect();
  let pigRect = pig.getBoundingClientRect();
  //console.log(pipeRect);
  //console.log(pigRect);

  return !(
    pipeRect.bottom < pigRect.top ||
    pipeRect.top > pigRect.bottom ||
    pipeRect.right < pigRect.left ||
    pipeRect.left > pigRect.right
  );
}

function playGame() {
  if (player.inplay) {
    let pig = document.querySelector(".pig");
    let tail = document.querySelector(".tail");

    // Gain scores
    player.score++;
    score.innerText = "Score: " + player.score;

    // Remove obstacles and Check isCollide
    moveObstacles(pig);

    let isPigMove = false;

    // Tracking key press within the boundary of screen area
    if (keys.ArrowLeft && player.x > 0) {
      player.x -= player.speed;
      isPigMove = true;
    }
    if (keys.ArrowRight && player.x < gameArea.offsetWidth - 50) {
      player.x += player.speed;
      isPigMove = true;
    }
    if ((keys.ArrowUp || keys.Space) && player.y > 0) {
      player.y -= player.speed * 5;
      isPigMove = true;
    }
    if (keys.ArrowDown && player.y < gameArea.offsetHeight - 50) {
      player.y += player.speed;
      isPigMove = true;
    }
    if (isPigMove) {
      // adjust the tail positoion
      tail.pos = tail.pos == 16 ? 10 : 16;
      tail.style.top = tail.pos + "px";
      pig.classList.add("scale-150");
    } else {
      pig.classList.remove("scale-150");
    }

    // Gravity
    player.y += player.speed * 2;
    if (pig.offsetTop > gameArea.offsetHeight) {
      // console.log("game over");
      playGameOver(pig);
    }

    // Update the pig's position (moving forward)
    pig.style.top = player.y + "px";
    pig.style.left = player.x + "px";

    window.requestAnimationFrame(playGame);
  }
}

function playGameOver(pig) {
  player.inplay = false;
  gameMessage.classList.remove("hidden");
  againButton.classList.remove("hidden");
  pig.setAttribute("style", "transform: rotate(180deg)");
  if (highestScore < player.score) highestScore = player.score;
  gameMessage.innerHTML = `<p>Game Over</p> <p>Score: <strong>${
    player.score
  }</strong> with <strong>${
    speedList[player.speed]
  }</strong> speed</p> <p>Highest Score: <strong>${highestScore}</strong></p>`;
  speed.removeAttribute("disabled");
}

function pressOn(e) {
  e.preventDefault();
  keys[e.code] = true;
  // console.log(keys);
}

function pressOff(e) {
  e.preventDefault();
  keys[e.code] = false;
  // console.log(keys);
}
