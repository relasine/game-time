const Game = require('./Game');
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
let game = new Game(ctx);
const gameScore = document.querySelector('.js-game-score');
let highScoreList = document.querySelector('.js-high-score-list');
const gameLevel = document.querySelector('.js-game-level');
let startingGameSpeed = 120;

document.addEventListener('keydown', game.handleKeyPress.bind(game));

pullHighScore();
requestFrame();

// game animation

function requestFrame() {
  window.requestAnimationFrame(timeOut);
}

function timeOut() {
  if (!game.paused) {
    setTimeout(gameLoop, startingGameSpeed);
  } else {
    setTimeout(timeOut, startingGameSpeed);
  }
}

function gameLoop() {
  gameScore.innerText = game.score;
  if (game.gameOver) {
    gameOverSequence();
  } else {
    playGame();
  }
}

// game over functionality

function gameOverSequence() {
  clearCanvas();
  printGameOver();
  canvas.style.cursor = 'pointer';
  checkHighScore(game.score);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function printGameOver() {
  ctx.font = '4rem "Superscript"';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'red';
  ctx.fillText('Game Over', 250, 250);
  printNewGame();
}

function printNewGame() {
  ctx.font = '2rem "VT323"';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'red';
  ctx.fillText('Click here to start new game', 250, 300);
  canvas.addEventListener('click', makeNewGame);
}

function makeNewGame() {
  canvas.style.cursor = 'none';
  game = new Game(ctx);
  resetEventListeners();
  startingGameSpeed = 120;
  gameLoop();
}

function resetEventListeners() {
  canvas.removeEventListener('click', makeNewGame);
  document.removeEventListener('keydown', game.handleKeyPress.bind(game));
  document.addEventListener('keydown', game.handleKeyPress.bind(game));
}

// game play functionality

function playGame() {
  clearCanvas();
  checkLevelSpeed();
  game.handleSnake();
  requestFrame();
}

function checkLevelSpeed() {
  if (parseInt(gameLevel.innerText) !== game.level) {
    gameLevel.innerText = game.level;
    startingGameSpeed -= 5;
  }
}

// high score functionality

function parseStorage() {
  return JSON.parse(localStorage.getItem('highScoreList'));
}

function generateFakeScores() {
  const fakeHighScores = [];
  const fakeInits = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const fakeScores = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  fakeInits.forEach((init, index) => {
    fakeHighScores.push({
      initials: init.repeat(3),
      score: fakeScores[index]
    });
  });

  return fakeHighScores;
}

function pullHighScore() {
  let currentHighScoreList = parseStorage() || generateFakeScores();

  generateHighScoreList(currentHighScoreList);
}

function generateHighScoreList(currentList) {
  clearCurrentList();
  setHighScoreList(currentList);
  renderHighScoreList(currentList);
}

function clearCurrentList() {
  highScoreList.innerHTML = '';
}

function setHighScoreList(currentList) {
  localStorage.setItem('highScoreList', JSON.stringify(currentList));
}

function renderHighScoreList(currentList) {
  currentList.forEach((item) => {
    highScoreList.innerHTML +=  `<li aria-label="high-score-rank">
                  <span class="initials" aria-label="high-score-initials">
                    ${item.initials}
                  </span>
                  <span class="score" aria-label="high-score">
                        ${item.score}
                  </span>
                </li>`;
  });
}

// on game over

function checkHighScore(currentScore) {
  let currentHighScoreList = parseStorage();

  spliceNewScore(currentScore, currentHighScoreList);
}

function spliceNewScore(currentScore, currentList) {
  let spliceBegin = findBeginSpliceIndex(currentScore, currentList);

  if (spliceBegin > -1) {
    let newHighScoreObject = makeNewScoreObj(currentScore);

    currentList.splice(spliceBegin, 0, newHighScoreObject);
    currentList.pop();
    generateHighScoreList(currentList);
  }
}

function findBeginSpliceIndex(currentScore, currentList) {
  return currentList.findIndex((item) => {
    return item.score < currentScore;
  });
}

function makeNewScoreObj(currentScore) {
  let newInitials = getInitials();

  return {
    initials: newInitials.toUpperCase().slice(0, 3),
    score: currentScore
  };
}

function getInitials() {
  let message = 'You earned a high score! Please enter your initials.';
  let defaultInits = 'AAA';

  return prompt(message, defaultInits) || defaultInits;
}