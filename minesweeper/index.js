const container = document.createElement('div');
container.className = 'container';
document.body.appendChild(container);
const grid = document.createElement('div');
grid.className = 'game-board';
container.appendChild(grid);
const newGame = document.createElement('button');
newGame.className = 'button';
newGame.textContent = 'New Game';
container.appendChild(newGame);
const table = document.createElement('div');
table.className = 'table';
container.insertBefore(table, container.firstChild);
const clicks = document.createElement('div');
clicks.className = 'clicks';
table.insertBefore(clicks, table.firstChild);
const time = document.createElement('div');
time.className = 'time';
table.insertBefore(time, table.firstChild);
const rules = document.createElement('div');
rules.className = 'rules';
rules.innerHTML =
  'Left click to open the cell.<br/> Right click to set a flag (if you suspect a mine).<br/> In order to win you need to discover the placement of all mines';
container.appendChild(rules);
const messageCongrats = document.createElement('div');
messageCongrats.className = 'message-congrats';
container.insertBefore(messageCongrats, container.firstChild);
const audioExplosion = new Audio('./assets/audio/explosion.mp3');
const audioFlag = new Audio('./assets/audio/flag.mp3');
const audioOpen = new Audio('./assets/audio/open.wav');
const audioWin = new Audio('./assets/audio/win.mp3');
const select = document.createElement('select');
container.appendChild(select);
select.id = 'difficulty-select';
select.addEventListener('change', setDifficulty);
const option1 = document.createElement('option');
option1.value = 'easy';
option1.setAttribute('selected', '');
option1.textContent = 'Easy';

const option2 = document.createElement('option');
option2.value = 'medium';
option2.textContent = 'Medium';

const option3 = document.createElement('option');
option3.value = 'hard';
option3.textContent = 'Hard';

select.appendChild(option1);
select.appendChild(option2);
select.appendChild(option3);

const selectType = document.createElement('select');
container.appendChild(selectType);
selectType.id = 'type-select';
let optionOne = document.createElement('option');
optionOne.value = 'none';
optionOne.setAttribute('selected', '');
optionOne.textContent = 'None adjacent cells';
selectType.appendChild(optionOne);

let optionTwo = document.createElement('option');
optionTwo.value = 'open';
optionTwo.textContent = 'Open adjacent cells';
selectType.appendChild(optionTwo);

let optionThree = document.createElement('option');
optionThree.value = 'flag';
optionThree.textContent = 'Add flag';
selectType.appendChild(optionThree);

let selectOption = 'none';

selectType.addEventListener('change', function() {
  selectOption = selectType.value;
});

let boardSize;
let numMines = 10;
let numFlags = 0;
let numClicks = 0;
clicks.innerHTML = `Clicks: ${numClicks}`;
let isFirstClick = true;
let isGameOver = false;
let isGameWon = false;

let startTime = null;
let timerId = null;

const toggleButton = document.createElement('button');
toggleButton.className = 'button';
container.appendChild(toggleButton);
toggleButton.innerHTML = 'Dark Theme';

const body = document.body;
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
  body.classList.add(currentTheme);
  toggleButton.innerHTML =
    currentTheme === 'dark-theme' ? 'Light Theme' : 'Dark Theme';
}

toggleButton.addEventListener('click', function () {
  body.classList.toggle('dark-theme');
  body.classList.toggle('light-theme');

  if (body.classList.contains('light-theme')) {
    toggleButton.innerHTML = 'Dark Theme';
    localStorage.setItem('theme', 'light-theme');
  } else {
    toggleButton.innerHTML = 'Light Theme';
    localStorage.setItem('theme', 'dark-theme');
  }
});

let resultsChart = document.createElement('div');
container.appendChild(resultsChart);
let showScore = document.createElement('button');
showScore.className = 'button';
showScore.innerText = 'Show last 10 scores';
container.appendChild(showScore);
showScore.onclick = function () {
  let highScores = JSON.parse(localStorage.getItem('highScores'));
  let table = '<table>';
  highScores.forEach(function (score, index) {
    table += '<tr><td>' + (index + 1) + '</td><td>' + score + '</td></tr>';
  });
  table += '</table>';
  resultsChart.innerHTML = table;
  if (showScore.innerText === 'Show last 10 scores') {
    showScore.innerText = 'Hide Results';
    resultsChart.style.display = 'block';
  } else {
    showScore.innerText = 'Show last 10 scores';
    resultsChart.style.display = 'none';
  }
};

let lastScore;
function saveHighScores(isGameOver, isGameWon, lastScore) {
  let highScores = JSON.parse(localStorage.getItem('highScores'));
  if (!highScores) {
    highScores = [];
  }
  if (isGameOver) {
    if (highScores.length >= 10) {
      highScores.shift();
    }
    highScores.push(lastScore);
    localStorage.setItem('highScores', JSON.stringify(highScores));
  } else {
    localStorage.setItem('highScores', JSON.stringify([lastScore]));
  }
}

function setDifficulty(event) {
  const selectedDifficulty = event.target.value;
  if (selectedDifficulty === 'easy' && option1.hasAttribute('selected')) {
    boardSize = 10;
    numMines = 10;
  } else if (selectedDifficulty === 'medium') {
    boardSize = 15;
    numMines = 25;
  } else if (selectedDifficulty === 'hard') {
    boardSize = 20;
    numMines = 40;
  }
  localStorage.setItem('boardSize', boardSize);
  localStorage.setItem('numMines', numMines);
  deleteBoard();
  const gameBoard = new Array(boardSize)
    .fill('')
    .map(() =>
      new Array(boardSize).fill({ isOpen: false, isMine: false, value: '', color: ''  })
    );

  for (let i = 0; i < gameBoard.length; i++) {
    for (let j = 0; j < gameBoard[i].length; j++) {
      gameBoard[i][j].isOpen = false;
      gameBoard[i][j].isMine = false;
    }
  }
  renderBoard();
  handleFirstClick(event);
}

window.onload = function () { 
  if (option1.hasAttribute('selected')) {
    boardSize = 10;
    numMines = 10;
    renderBoard();
  }
  isFirstClick = true;
};

/*window.addEventListener("load", function() {
 
  let boardSize = localStorage.getItem("boardSize");
  let numMines = localStorage.getItem("numMines");
  let gameBoard = JSON.parse(localStorage.getItem("gameBoard")); 
  console.log(gameBoard);

  if (boardSize && numMines) {
    const options = document.querySelectorAll("option");
    let selectedOption = null;

    if (boardSize === "10" && numMines === "10") {
      selectedOption = options[0];
    } else if (boardSize === "15" && numMines === "25") {
      selectedOption = options[1];
    } else if (boardSize === "20" && numMines === "40") {
      selectedOption = options[2];
    }

    if (selectedOption !== null) {
      selectedOption.selected = true;
      setDifficulty({ target: selectedOption });
    }
  }
  
  gameBoard.forEach((row, rowIndex) => {
    console.log(rowIndex)
    const rowElem = document.createElement("div");
    rowElem.className = "row";
    row.forEach((cell, colIndex) => {
      const cellElem = document.createElement("div");
      cellElem.className = "cell";
      cellElem.setAttribute("data-row", rowIndex);
      cellElem.setAttribute("data-col", colIndex);
      console.log(gameBoard[rowIndex][colIndex])
      if (gameBoard[rowIndex][colIndex].isOpen) { 
        cellElem.style.backgroundColor = gameBoard[rowIndex][colIndex].color; 
      }
  
      rowElem.appendChild(cellElem);
    });
    grid.appendChild(rowElem);
  });
});*/

let gameBoard = new Array(boardSize)
  .fill('')
  .map(() =>
    new Array(boardSize).fill({ isOpen: false, isMine: false, value: '', color: ''  })
  );

for (let i = 0; i < gameBoard.length; i++) {
  for (let j = 0; j < gameBoard[i].length; j++) {
    gameBoard[i][j].isOpen = false;
    gameBoard[i][j].isMine = false;
  }
}



function deleteBoard() {
  const oldBoard = document.querySelectorAll('.row');
  if (oldBoard.length > 0) {
    oldBoard.forEach((row) => {
      row.remove();
    });
  }
}

const renderBoard = () => {
  let gameBoard = new Array(boardSize)
    .fill('')
    .map(() =>
      new Array(boardSize).fill({ isOpen: false, isMine: false, value: '', color: '' })
    );
  console.log(gameBoard);
  gameBoard.forEach((row, rowIndex) => {
    const rowElem = document.createElement('div');
    rowElem.className = 'row';
    row.forEach((cell, colIndex) => {
      const cellElem = document.createElement('div');
      cellElem.className = 'cell';
      cellElem.setAttribute('data-row', rowIndex);
      cellElem.setAttribute('data-col', colIndex);

      rowElem.appendChild(cellElem);
    });
    grid.appendChild(rowElem);
  });
};

const placeMines = (clickRow, clickCol) => {
  gameBoard = new Array(boardSize)
    .fill('')
    .map(() =>
      new Array(boardSize).fill({ isOpen: false, isMine: false, value: '', color: ''  })
    );

  let minesPlaced = 0;
  let isFirstClick = true;
  while (minesPlaced < numMines) {
    const row = Math.floor(Math.random() * boardSize);
    const col = Math.floor(Math.random() * boardSize);
    if (!gameBoard[row][col] || gameBoard[row][col] !== 'X') {
      if (
        isFirstClick &&
        document
          .querySelector(`[data-row="${row}"][data-col="${col}"]`)
          .classList.contains('mine')
      ) {
        
        continue;
      }
      gameBoard[row][col] = 'X';
      const cell = document.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
      );
      cell.classList.add('mine');
      minesPlaced++;
    }
    isFirstClick = false;
  }

  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell) => {
    cell.addEventListener('contextmenu', addFlag);
  });
  handleBoardClick(cells);
};

function addFlag(event) {
  event.preventDefault();
  if (!startTime) {
    startTime = Date.now();
    timerId = setInterval(updateElapsedSeconds, 1000);
  }
  if (this.classList.contains('flag')) {
    event.preventDefault();
    this.classList.remove('flag');
    this.isMine = false;
    numFlags--;
  } else {
    audioFlag.play();
    this.classList.add('flag');
    this.isMine = true;
    numFlags++;
  }
}

document.querySelector('.game-board').addEventListener('click', (event) => {
  if (isFirstClick) {
    isFirstClick = false;
    handleFirstClick(event);
    document.querySelector('.game-board').removeEventListener('click', handleClick); 
  }
});

function increaseClicks() {
  numClicks++;
  console.log(numClicks);
  return numClicks;
  
}

const clearBoard = () => {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell) => {
    cell.classList.remove('mine');
    for (let i = 0; i < gameBoard.length; i++) {
      for (let j = 0; j < gameBoard[i].length; j++) {
        gameBoard[i][j] = { isOpen: false, isMine: false, value: '', color: '' };
      }
    }
  });
};

function handleFirstClick(event) {
  
  if (!startTime) {
    startTime = Date.now();
    timerId = setInterval(updateElapsedSeconds, 1000);
  }

  placeMines();
  handleClick(event);

}

function updateElapsedSeconds() {
  const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
  time.textContent = `Time: ${timeElapsed} seconds`;
}

function handleBoardClick(cells) {
  cells.forEach((cell) => {
    cell.addEventListener('click', handleClick);
  });
}

const announce = document.createElement('div');

function handleClick(event) {
  const row = event.target.getAttribute('data-row');
  const col = event.target.getAttribute('data-col');

  if (gameBoard[row][col] === 'X') {
    event.target.classList.add('mine-displayed');
    audioExplosion.play();
    announce.classList.add('game-over');
    announce.textContent = 'Game over! Try again!';
    container.appendChild(announce);
    isGameOver = true;
    isGameWon = false;
    lastScore = 'Loose';
    saveHighScores(isGameOver, isGameWon, lastScore);

    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell) => {
      cell.removeEventListener('click', handleClick);
      cell.removeEventListener('contextmenu', addFlag);
    });
    clearInterval(timerId);
  } else {
    audioOpen.play();
    for (let i = 0; i < gameBoard.length; i++) {
      if (row == i) {
        for (let j = 0; j < gameBoard[i].length; j++) {
          if (col == j) {
            gameBoard[i][col] = { isOpen: true, isMine: false, value: '', color: ''  };
          }
        }
      }
    }
    const surroundingMines = countSurroundingMines(row, col);
    event.target.textContent = surroundingMines;
    if (surroundingMines === 0) {
      event.target.classList.add('white');
      if (selectOption === 'open') {
        openAdjacentCells(row, col);
      }
    }
    switch (surroundingMines) {
    case 1:
      event.target.classList.add('blue');
      break;
    case 2:
      event.target.classList.add('green');
      break;
    case 3:
      event.target.classList.add('yellow');
      break;
    case 4:
      event.target.classList.add('orange');
      break;
    case 5:
    case 6:
    case 7:
    case 8:
      event.target.classList.add('red');
      break;
    }
    event.target.removeEventListener('click', handleClick);
    checkGameComplete(row, col);
  }
}

function openAdjacentCells(row, col) {
  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = col - 1; j <= col + 1; j++) {
      if (i >= 0 && i < boardSize && j >= 0 && j < boardSize && !(i == row && j == col)) {
        const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
        if (!gameBoard[i][j].isOpen && !cell.classList.contains('mine')) {
          gameBoard[i][j] = { isOpen: true, isMine: false, value: '', color: '' };
          if (cell.classList.contains('white')) {
            gameBoard[i][j].color = 'white';
          } else if (cell.classList.contains('blue')) {
            gameBoard[i][j].color = 'blue';
          } else if (cell.classList.contains('green')) {
            gameBoard[i][j].color = 'green';
          } else if (cell.classList.contains('yellow')) {
            gameBoard[i][j].color = 'yellow';
          } else if (cell.classList.contains('orange')) {
            gameBoard[i][j].color = 'orange';
          } else if (cell.classList.contains('red')) {
            gameBoard[i][j].color = 'red';
          }
          localStorage.setItem('gameBoard', JSON.stringify(gameBoard));
          const surroundingMines = countSurroundingMines(i, j);
          cell.textContent = surroundingMines;
          switch (surroundingMines) {
          case 1:
            cell.classList.add('blue');
            break;
          case 2:
            cell.classList.add('green');
            break;
          case 3:
            cell.classList.add('yellow');
            break;
          case 4:
            cell.classList.add('orange');
            break;
          case 5:
          case 6:
          case 7:
          case 8:
            cell.classList.add('red');
            break;
          }
          if (surroundingMines === 0 && gameBoard[i][j] !== 'X' && 
          !gameBoard[i][j].isMine) {
            cell.classList.add('white');
            openAdjacentCells(i, j);
          }
          cell.removeEventListener('click', handleClick);
        }
      }
    }
  }
}
  


newGame.addEventListener('click', () => {
  grid.innerHTML = '';
  messageCongrats.innerHTML = '';
  renderBoard();
  announce.innerHTML='';
  let boardSize = JSON.parse(localStorage.getItem('boardSize'));
  let numMines = JSON.parse(localStorage.getItem('numMines'));
  numFlags = 0;
  numClicks = 0;
  clicks.innerHTML = `Clicks: ${numClicks}`;
  startTime = null;
  clearInterval(timerId);
  time.textContent = 'Time: 0 seconds';
  clearBoard();
  isFirstClick = true;
  document.querySelector('.game-board').addEventListener('click', (event) => {
    if (isFirstClick) {
      isFirstClick = false;
      handleFirstClick(event);
    }
  });
  
}
);

function countSurroundingMines(row, col) {
  let count = 0;

  let surroundingFields = [
    [+row - 1, +col - 1],
    [+row - 1, +col],
    [+row - 1, +col + 1],
    [+row, +col - 1],
    [+row, +col + 1],
    [+row + 1, +col - 1],
    [+row + 1, +col],
    [+row + 1, +col + 1],
  ];
  surroundingFields = surroundingFields.filter(
    (field) => field[0] >= 0 && field[1] >= 0
  );
  surroundingFields.forEach((field) => {
    const [row, col] = field;
    if (gameBoard[row] && gameBoard[row][col] === 'X') {
      count++;
    }
  });
  return count;
}

function congratulateMessage(numClicks) {
  
  clearInterval(timerId);
  audioWin.play();
  let string = time.textContent;
  let new_string = string.replace('Time: ', '');
  messageCongrats.innerHTML =
      'Hooray! You found all mines in ' +
      new_string +
      ' seconds and ' +
      numClicks +
      ' moves!';
  isGameWon = true;
  isGameOver = true;
  lastScore =
      'Won in ' + new_string + ' seconds and ' + numClicks + ' moves!';
  saveHighScores(isGameOver, isGameWon, lastScore);
  return true;
 
}


function checkGameComplete(row, col) {
  if (gameBoard) {let gameBoard = JSON.parse(localStorage.getItem('gameBoard')); }
  let maxNum= boardSize*boardSize;
  console.log(maxNum, numClicks, numMines);
  if (gameBoard[row][col].isOpen && gameBoard[row][col] !== 'X') {
    increaseClicks();
    console.log(numClicks);
    clicks.innerHTML = `Clicks: ${numClicks}`;
    if (numClicks === maxNum - numMines) {
      congratulateMessage(numClicks);
    }
  }

  let closedObjects=gameBoard.flat().filter((obj) => !obj.isOpen && obj !== 'X');
  let numUnopened = closedObjects.length;

  let openObjects =gameBoard.flat().filter((obj) => obj.isOpen && obj !== 'X');
  let numOpened=openObjects.length;
  console.log(numUnopened, numOpened);
  if (numUnopened === 0  || numOpened === maxNum - numUnopened) {
    congratulateMessage(numClicks);
  }
}

