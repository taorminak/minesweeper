const container = document.createElement('div');
container.className = 'container';
document.body.appendChild(container);
const grid = document.createElement('div');
grid.className = 'game-board';
container.appendChild(grid);
const newGame = document.createElement('button');
newGame.className = 'new-game';
newGame.textContent = 'New Game';
container.appendChild(newGame);
const clicks = document.createElement('div');
clicks.className = 'clicks';
container.insertBefore(clicks, container.firstChild);
const time = document.createElement('div');
time.className = 'time';
container.insertBefore(time, container.firstChild);
const rules = document.createElement('div');
rules.className = 'rules';
rules.innerHTML = `Left click to open the cell.<br/> Right click to set a flag (if you suspect a mine).<br/> In order to win you need to discover the placement of all mines`;
container.appendChild(rules);

const boardSize = 10;
const gameBoard = new Array(boardSize)
  .fill('')
  .map(() => new Array(boardSize).fill({ isOpen: false, isMine: false, value: '' }));

for (let i = 0; i < gameBoard.length; i++) {
  for (let j = 0; j < gameBoard[i].length; j++) {
    gameBoard[i][j].isOpen=false;
    gameBoard[i][j].isMine=false;
  }}

let numUnopened = 100;
let numMines = 10;
let numFlags=0;
let numOpened =0;
clicks.innerHTML = `Clicks: ${numOpened}`;




const renderBoard = () => {
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

renderBoard();

const placeMines = () => {
  let minesPlaced = 0;
  while (minesPlaced < numMines) {
    const row = Math.floor(Math.random() * boardSize);
    const col = Math.floor(Math.random() * boardSize);
    if (!gameBoard[row][col] || gameBoard[row][col] !== 'X') {
      gameBoard[row][col] = 'X';
      const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      cell.classList.add('mine');
      minesPlaced++;
    }
  }
  console.log(minesPlaced);
  const cells = document.querySelectorAll('.cell');
  handleBoardClick(cells);
};

let startTime = null;
let timerId = null;

document.querySelector('.game-board').addEventListener('click', handleFirstClick);

function increaseClicks() {
  numOpened++;
  clicks.innerHTML = `Clicks: ${numOpened}`;
}

function handleFirstClick(event) {
  if (!startTime) {
    startTime = Date.now();
    timerId = setInterval(updateElapsedSeconds, 1000);}
   
    console.log(numOpened)
  
  placeMines();
  handleClick(event);
  document.querySelector('.game-board').removeEventListener('click', handleFirstClick);
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
    announce.classList.add('game-over');
    announce.textContent = 'Game over!';
    container.appendChild(announce);
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell) => {
      cell.removeEventListener('click', handleClick);
    });
    clearInterval(timerId);
  } else {
    const surroundingMines = countSurroundingMines(row, col);
    event.target.textContent = surroundingMines;
    gameBoard[row][col].isOpen = true;
    switch (surroundingMines) {
    case 0:
      event.target.classList.add('white');
      break;
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
    default:
      event.target.classList.add('red');
      break;
    }
    event.target.removeEventListener('click', handleClick);
    checkGameComplete(row,col);
  }
}

newGame.addEventListener('click', () => {
  grid.innerHTML = '';
  renderBoard();
  announce.remove();
});

function countSurroundingMines(row, col) {
  let count = 0;

  let surroundingFields = [
    [+row-1, +col-1], [+row-1, +col], [+row-1, +col+1],
    [+row, +col-1], [+row, +col+1],
    [+row+1, +col-1], [+row+1, +col], [+row+1, +col+1]
  ];
  surroundingFields = surroundingFields.filter(field => field[0] >= 0 && field[1] >= 0);
  surroundingFields.forEach(field => {
    const [row, col] = field;
    if (gameBoard[row] && gameBoard[row][col] === 'X') {
      count++;
    }
  });
  return count;
}

function checkGameComplete(row,col) {
  if (gameBoard[row][col] && !(gameBoard[row][col]==='X')) {
    increaseClicks();
    console.log(numOpened);
    
  }
  if (!(gameBoard[row][col]==='X')) {
    numUnopened=numUnopened-1;
    console.log(numUnopened);
  }
  /*if (gameBoard[row][col].isMine) {
        numMines++;
        console.log(isMine)
      }*/
  

  if (numUnopened === numMines && numFlags === numMines) {
    const message = document.createElement('div');
    message.textContent= 'Hooray! You found all mines in ' + timeElapsed + ' seconds and ' + numOpened + ' moves!';
    document.body.appendChild(message);
    return true;
  }
  else {
    return false;}
  
}


