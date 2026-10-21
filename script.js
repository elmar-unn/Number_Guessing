"use strict";

let randomNumber = Math.floor(Math.random() * 100) + 1;
let previousGuesses = [];
let guessCount = 0;
let failCount = 0;
let countdownTimer = null;
let gameOver = false;
let videoStarted = false;

const guessForm = document.querySelector("#guessForm");
const guessField = document.querySelector("#guessField");
const guessSubmit = document.querySelector(".guessSubmit");

const guesses = document.querySelector(".guesses");
const lastResult = document.querySelector(".lastResult");
const lowOrHi = document.querySelector(".lowOrHi");
const failStats = document.querySelector("#failStats");

const failOverlay = document.querySelector("#failOverlay");
const failedText = document.querySelector("#failedText");
const failNumber = document.querySelector("#failNumber");
const countdownElement = document.querySelector("#countdown");

const videoContainer = document.querySelector("#videoContainer");
const failVideo = document.querySelector("#failVideo");
const videoFinished = document.querySelector("#videoFinished");
const videoError = document.querySelector("#videoError");
const finalFailCount = document.querySelector("#finalFailCount");

const restartButton = document.querySelector("#restartButton");
const retryVideoButton = document.querySelector("#retryVideoButton");

// Mängija pakkumine
guessForm.addEventListener("submit", (event) => {
  event.preventDefault();
  checkGuess();
});

function checkGuess() {
  if (gameOver) return;

  const value = guessField.value.trim();
  const number = Number(value);

  if (value === "" || !Number.isInteger(number) || number < 1 || number > 100) {
    lowOrHi.textContent = "Sisesta täisarv vahemikus 1–100.";
    return;
  }

  guessCount++;
  previousGuesses.push(number);

  guesses.textContent = "Sinu pakkumised: " + previousGuesses.join(", ");

  if (number === randomNumber) {
    lastResult.textContent = "Õige vastus! Tubli!";
    lastResult.style.backgroundColor = "green";
    lowOrHi.textContent = "Arvasid numbri " + guessCount + " katsega!";

    finishGame(true);
    return;
  }

  lastResult.textContent = "Vale!";
  lastResult.style.backgroundColor = "red";

  lowOrHi.textContent =
    number < randomNumber
      ? "Sinu pakkumine oli liiga väike!"
      : "Sinu pakkumine oli liiga suur!";

  if (guessCount >= 10) {
    lastResult.textContent = "MÄNG LÄBI!";
    lowOrHi.textContent = "Õige number oli " + randomNumber + ".";

    finishGame(false);
    startFailureSequence();
    return;
  }

  guessField.value = "";
  guessField.focus();
}

function finishGame(won) {
  gameOver = true;
  guessField.disabled = true;
  guessSubmit.disabled = true;

  if (won) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Mängi uuesti";
    button.addEventListener("click", resetGame);
    document.querySelector(".game-card").appendChild(button);
  }
}

// Iga kaotus suurendab loendurit
function startFailureSequence() {
  clearInterval(countdownTimer);

  failCount++;

  failStats.textContent = "Kaotamisi: " + failCount;
  failNumber.textContent = "FAIL #" + failCount;
  finalFailCount.textContent = failCount;

  failOverlay.hidden = false;
  failedText.hidden = false;
  failNumber.hidden = false;
  countdownElement.hidden = false;

  videoContainer.hidden = true;
  videoFinished.hidden = true;
  videoError.hidden = true;

  let seconds = 5;
  countdownElement.textContent = seconds;

  countdownTimer = setInterval(() => {
    seconds--;

    if (seconds > 0) {
      countdownElement.textContent = seconds;
    } else {
      clearInterval(countdownTimer);
      countdownTimer = null;
      showFailureVideo();
    }
  }, 1000);
}

// Käivitame video
async function showFailureVideo() {
  failedText.hidden = true;
  failNumber.hidden = true;
  countdownElement.hidden = true;
  videoContainer.hidden = false;
  videoFinished.hidden = true;
  videoError.hidden = true;

  failVideo.pause();
  failVideo.currentTime = 0;
  failVideo.controls = false;
  failVideo.loop = false;
  failVideo.muted = false;

  try {
    if (failVideo.readyState === 0) {
      failVideo.load();
    }

    await failVideo.play();
    videoStarted = true;
  } catch (error) {
    videoError.hidden = false;
    videoStarted = false;
  }
}

// Video lõppedes saab mängija jätkata
failVideo.addEventListener("ended", () => {
  videoStarted = false;
  videoFinished.hidden = false;
});

// Kui video ei lae, saab uuesti proovida
failVideo.addEventListener("error", () => {
  if (!videoContainer.hidden) {
    videoError.hidden = false;
  }
});

retryVideoButton.addEventListener("click", () => {
  showFailureVideo();
});

// Blokeerime tavalised pausimise klahvid
failVideo.addEventListener("keydown", (event) => {
  if (
    event.code === "Space" ||
    event.code === "MediaPlayPause" ||
    event.key.toLowerCase() === "k"
  ) {
    event.preventDefault();
    event.stopPropagation();
  }
});

failVideo.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

// Ei luba mängusiseselt overlay'd sulgeda
failOverlay.addEventListener("click", (event) => {
  if (videoStarted && event.target === failOverlay) {
    event.preventDefault();
  }
});

// Uus mäng alles siis, kui video on lõppenud
restartButton.addEventListener("click", () => {
  if (videoStarted || !failVideo.ended) return;
  resetGame();
});

function resetGame() {
  if (videoStarted || (!failOverlay.hidden && !failVideo.ended)) {
    return;
  }

  clearInterval(countdownTimer);
  countdownTimer = null;

  failVideo.pause();
  failVideo.currentTime = 0;

  failOverlay.hidden = true;
  videoContainer.hidden = true;

  guessCount = 0;
  previousGuesses = [];
  randomNumber = Math.floor(Math.random() * 100) + 1;
  gameOver = false;
  videoStarted = false;

  guesses.textContent = "";
  lastResult.textContent = "";
  lastResult.style.backgroundColor = "";
  lowOrHi.textContent = "";

  guessField.disabled = false;
  guessSubmit.disabled = false;
  guessField.value = "";

  const buttons = document.querySelectorAll(".game-card button");
  buttons.forEach((button) => button.remove());

  guessField.focus();
}
