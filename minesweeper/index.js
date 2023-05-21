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
rules.innerHTML = 'Left click to open the cell.<br/> Right click to set a flag (if you suspect a mine).<br/> In order to win you need to discover the placement of all mines';
container.appendChild(rules);
const messageCongrats = document.createElement('div');
messageCongrats.className='message-congrats';
container.insertBefore(messageCongrats, container.firstChild);

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
let isFirstClick = true;


let startTime = null;
let timerId = null;

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
  let isFirstClick = true;
  while (minesPlaced < numMines) {
    const row = Math.floor(Math.random() * boardSize);
    const col = Math.floor(Math.random() * boardSize);
    if (!gameBoard[row][col] || gameBoard[row][col] !== 'X') {
      if (isFirstClick && document.querySelector(`[data-row="${row}"][data-col="${col}"]`).classList.contains('mine')) {
        continue;
      }
      gameBoard[row][col] = 'X';
      const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      cell.classList.add('mine');
      minesPlaced++;
    }
    isFirstClick = false;
  }

  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.addEventListener('contextmenu', addFlag);
  });
  handleBoardClick(cells);
};



function addFlag(event) {
  event.preventDefault();
  if (!startTime) {
    startTime = Date.now();
    timerId = setInterval(updateElapsedSeconds, 1000);}
  if (this.classList.contains('flag')) {
    event.preventDefault();
    this.classList.remove('flag');
    this.isMine = false;
    numFlags--;
  }
  else {this.classList.add('flag');
    this.isMine = true;
    numFlags++;
  }
}

document.querySelector('.game-board').addEventListener('click', (event) => {
  if (isFirstClick) {
    isFirstClick = false;
    handleFirstClick(event);
  }
});

function increaseClicks() {
  numOpened++;
  return numOpened;
}

const clearBoard = () => {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.classList.remove('mine');
    for (let i = 0; i < gameBoard.length; i++) {
      for (let j = 0; j < gameBoard[i].length; j++) {
        gameBoard[i][j]= { isOpen: false, isMine: false,  value: '' };
      }}
  });
};

function handleFirstClick(event) {
  if (!startTime) {
    startTime = Date.now();
    timerId = setInterval(updateElapsedSeconds, 1000);}

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
    event.target.classList.add('mine-displayed');

    announce.classList.add('game-over');
    announce.textContent = 'Game over! Try again!';
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
    if (surroundingMines === 0) {
      event.target.classList.add('white');
      openAdjacentCells(row, col);
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
    checkGameComplete(row,col);
  }
}

function openAdjacentCells(row, col) {
  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = col - 1; j <= col + 1; j++) {
      if (i >= 0 && i < boardSize && j >= 0 && j < boardSize && !(i == row && j == col)) {
        const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
        if (!cell.classList.contains('white') && gameBoard[i][j].value !== 'X' && 
        !cell.classList.contains('mine')) {
          const surroundingMines = countSurroundingMines(i, j);
          cell.textContent = surroundingMines;
          gameBoard[i][j].isOpen = true;
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
          cell.removeEventListener('click', handleClick);
          checkGameComplete(i, j);
          if (surroundingMines === 0 && gameBoard[i][j].value !== 'X' && 
          !gameBoard[i][j].isMine) {
            cell.classList.add('white');
            openAdjacentCells(i, j);
          }
        }
      }
    }
  }
}

newGame.addEventListener('click', () => {
  grid.innerHTML = '';
  renderBoard();
  announce.remove();
  numUnopened = 100;
  numMines = 10;
  numFlags = 0;
  numOpened = 0;
  clicks.innerHTML = `Clicks: ${numOpened}`;
  startTime = null;
  clearInterval(timerId);
  time.textContent = 'Time: 0 seconds';
  clearBoard();
  isFirstClick = true;
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

function congratulateMessage() {
  if (numUnopened == numMines && numOpened == (boardSize * boardSize) - numMines) {
    clearInterval(timerId);
    
    let string = time.textContent;
    let new_string = string.replace('Time: ', '');

    messageCongrats.innerHTML = 'Hooray! You found all mines in ' + new_string + ' seconds and ' + numOpened + ' moves!';
    return true;
  } else {
    return false;
  }
}

function checkGameComplete(row,col) {
 
  if (gameBoard[row][col] && !(gameBoard[row][col]==='X')) {
    let newValue = increaseClicks();
    clicks.innerHTML = `Clicks: ${newValue}`;
    
  }
  if (!(gameBoard[row][col]==='X')) {
    numUnopened=numUnopened-1;
  }
  congratulateMessage();
}


