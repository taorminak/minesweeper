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

const boardSize = 10;
const gameBoard = new Array(boardSize)
  .fill(null)
  .map(() => new Array(boardSize).fill(null));

const renderBoard = () => {
  gameBoard.forEach((row, rowIndex) => {
    const rowElem = document.createElement('div');
    rowElem.className = 'row';
    row.forEach((cell, colIndex) => {
      const cellElem = document.createElement('div');
      cellElem.className = 'cell';
      cellElem.setAttribute('data-row', rowIndex);
      cellElem.setAttribute('data-col', colIndex);
      if (cell === 'X') {
        cellElem.classList.add('mine');
      }
      rowElem.appendChild(cellElem);
    });
    grid.appendChild(rowElem);
  });
  const cells = document.querySelectorAll('.cell');
  handleBoardClick(cells);
};

renderBoard();

const placeMines = (numMines = 10) => {
  let minesPlaced = 0;
  while (minesPlaced < numMines) {
    const row = Math.floor(Math.random() * boardSize);
    const col = Math.floor(Math.random() * boardSize);
    if (!gameBoard[row][col] || gameBoard[row][col] !== 'X') {
      gameBoard[row][col] = 'X';
      minesPlaced++;
    }
  }
};

placeMines();

function handleBoardClick(cells) {
  cells.forEach((cell) => {
    cell.addEventListener('click', handleClick);
  });
}

const announce = document.createElement('div');
function handleClick() {
  const row = this.getAttribute('data-row');
  const col = this.getAttribute('data-col');

  if (gameBoard[row][col] === 'X') {
    announce.classList.add('game-over');
    announce.textContent = 'Game over!';
    container.appendChild(announce);
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell) => {
      cell.removeEventListener('click', handleClick);
    });
  } else {
    const surroundingMines = countSurroundingMines(row, col);
    this.textContent = surroundingMines;
    this.style.whiteSpace = 'nowrap';

    switch (surroundingMines) {
    case 0:
      this.classList.add('white');
      break;
    case 1:
      this.classList.add('blue');
      break;
    case 2:
      this.classList.add('green');
      break;
    case 3:
      this.classList.add('yellow');
      break;
    case 4:
      this.classList.add('orange');
      break;
    default:
      this.classList.add('red');
      break;
    }
    this.removeEventListener('click', handleClick);
  }
}

newGame.addEventListener('click', () => {
  grid.innerHTML = '';
  renderBoard();
  announce.remove();
});

function countSurroundingMines(row, col) {
  let count = 0;

  for (
    let i = Math.max(row - 1, 0);
    i <= Math.min(row + 1, gameBoard.length - 1);
    i++
  ) {
    for (
      let j = Math.max(col - 1, 0);
      j <= Math.min(col + 1, gameBoard[0].length - 1);
      j++
    ) {
      if (gameBoard[i][j] === 'X') {
        count++;
      }
    }
  }
  count -= gameBoard[row][col] === 'X' ? 1 : 0;
  return count;
}
