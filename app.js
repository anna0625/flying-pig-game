const score = document.getElementById("score");
const startScreen = document.getElementById("startScreen");
const gameArea = document.getElementById("gameArea");
const gameMessage = document.getElementById("gameMessage");
const againButton = document.getElementById("againButton");
const speed = document.getElementById("speed");

startScreen.addEventListener("click", start);
againButton.addEventListener("click", start);
document.addEventListener("keydown", pressOn);
document.addEventListener("keyup", pressOff);

let keys = {};
let player = {};

let defaultSpeed = 2;
selectCheck();

function selectCheck() {
  switch (speed.selectedIndex) {
    case 1:
      defaultSpeed = 2;
      break;
    case 2:
      defaultSpeed = 3;
      break;
    case 3:
      defaultSpeed = 4;
      break;
    case 4:
      defaultSpeed = 6;
      break;
    default:
      defaultSpeed = 2;
      break;
  }
}

speed.onclick = (e) => {
  e.preventDefault();
  selectCheck();
};

function start() {
  // console.log("start");

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
  pipeTop.innerHTML = "<br/>" + player.pipe;
  pipeTop.height = Math.floor(Math.random() * 350);
  pipeTop.style.height = pipeTop.height + "px";
  pipeTop.style.left = pipeTop.start + "px";
  pipeTop.style.top = "0px";
  pipeTop.x = pipeTop.start;
  pipeTop.id = player.pipe;
  pipeTop.classList.add("bg-purple-200");
  gameArea.appendChild(pipeTop);
  let pipeSpace = Math.floor(Math.random() * 250) + 150;
  let pipeBottom = document.createElement("div");
  pipeBottom.start = pipeTop.start;
  pipeBottom.classList.add("pipe");
  pipeBottom.innerHTML = "<br/>" + player.pipe;
  pipeBottom.style.height =
    totalScreenHeight - pipeTop.height - pipeSpace + "px";
  pipeBottom.style.left = pipeTop.start + "px";
  pipeBottom.style.bottom = "0px";
  pipeBottom.x = pipeTop.start;
  pipeBottom.id = player.pipe;
  pipeBottom.classList.add("bg-green-200");
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
    }

    // Gravity
    player.y += player.speed * 2;
    if (pig.offsetTop > gameArea.offsetHeight) {
      // console.log("game over");
      playGameOver(pig);
    }

    // Adjust the pig position
    pig.style.top = player.y + "px";
    pig.style.left = player.x + "px";

    window.requestAnimationFrame(playGame);

    player.score++;
    score.innerText = "Score: " + player.score;
  }
}

function playGameOver(pig) {
  player.inplay = false;
  gameMessage.classList.remove("hidden");
  againButton.classList.remove("hidden");
  pig.setAttribute("style", "transform: rotate(180deg)");
  gameMessage.innerHTML = "Game Over <br/> You scored " + player.score;
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
