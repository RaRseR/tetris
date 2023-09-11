class TetrisGame {
    gameOver = false;
    count = 0;
    grid = 32;

    tetrominos = {
        'I': {
            color: 'cyan',
            matrix: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ]
        },
        'J': {
            color: 'blue',
            matrix: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0],
            ]
        },
        'L': {
            color: 'orange',
            matrix: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0],
            ]
        },
        'O': {
            color: 'yellow',
            matrix: [
                [1, 1],
                [1, 1],
            ]
        },
        'S': {
            color: 'green',
            matrix: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0],
            ]
        },
        'Z': {
            color: 'red',
            matrix: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0],
            ]
        },
        'T': {
            color: 'purple',
            matrix: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0],
            ]
        }
    };
    tetromino = null;
    sequence = [];

    rowCount = 0;
    speed = 1;

    score = 0;
    scoreSpan = null;

    gameCanvas = null;
    gameContext = null;

    nextCanvas = null;
    nextContext = null;

    rAF = null;
    playfield = [];

    constructor() {
        this.gameCanvas = document.getElementById('game');
        this.gameContext = this.gameCanvas.getContext('2d');

        this.nextCanvas = document.getElementById('next');
        this.nextContext = this.nextCanvas.getContext('2d');

        this.scoreSpan = document.getElementById('score');

        for (let row = -2; row < 20; row++) {
            this.playfield[row] = [];

            for (let col = 0; col < 10; col++) {
                this.playfield[row][col] = 0;
            }
        }

        this.gameContext.strokeStyle = 'grey';
        this.gameContext.stroke();

        this.tetromino = this.getNextTetromino();

        this.move = this.move.bind(this);
        document.addEventListener('keydown', this.move);

        this.loop = this.loop.bind(this);

        this.rAF = requestAnimationFrame(this.loop);
    };

    getNextTetromino() {
        if (this.sequence.length === 0) {
            this.generateSequence();
        }

        const name = this.sequence.pop();
        const matrix = this.tetrominos[name].matrix;

        const col = this.playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);

        const row = name === 'I' ? -1 : -2;

        return {
            name: name,
            matrix: matrix,
            row: row,
            col: col
        }
    };

    move(event) {
        if (this.gameOver) return;

        if (event.which === 37 || event.which === 39) {
            const col = event.which === 37
                ? this.tetromino.col - 1
                : this.tetromino.col + 1;

            if (this.isValidMove(this.tetromino.matrix, this.tetromino.row, col)) {
                this.tetromino.col = col;
            }
        }

        if (event.which === 38) {
            const matrix = this.rotate(this.tetromino.matrix);

            if (this.isValidMove(matrix, this.tetromino.row, this.tetromino.col)) {
                this.tetromino.matrix = matrix;
            }
        }

        if (event.which === 40) {
            const row = this.tetromino.row + 1;

            if (!this.isValidMove(this.tetromino.matrix, row, this.tetromino.col)) {
                this.tetromino.row = row - 1;

                this.placeTetromino();
                return;
            }

            this.tetromino.row = row;
        }
    }

    generateSequence() {
        const names = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

        this.sequence.push(names[this.getRandomInt(0, 6)], names[this.getRandomInt(0, 6)]);
    };

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    rotate(matrix) {
        return matrix.map((row, i) =>
            row.map((_, j) => matrix[matrix.length - 1 - j][i])
        );
    }

    isValidMove(matrix, cellRow, cellCol) {
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col] && (
                    cellCol + col < 0 ||
                    cellCol + col >= this.playfield[0].length ||
                    cellRow + row >= this.playfield.length ||
                    this.playfield[cellRow + row][cellCol + col])
                ) {
                    return false;
                }
            }
        }

        return true;
    }

    placeTetromino() {
        for (let row = 0; row < this.tetromino.matrix.length; row++) {
            for (let col = 0; col < this.tetromino.matrix[row].length; col++) {
                if (this.tetromino.matrix[row][col]) {

                    if (this.tetromino.row + row < 0) {
                        return this.showGameOver();
                    }

                    this.playfield[this.tetromino.row + row][this.tetromino.col + col] = this.tetromino.name;
                }
            }
        }

        for (let row = this.playfield.length - 1; row >= 0;) {
            if (this.playfield[row].every(cell => !!cell)) {
                for (let r = row; r >= 0; r--) {
                    for (let c = 0; c < this.playfield[r].length; c++) {
                        this.playfield[r][c] = this.playfield[r - 1][c];
                    }
                }

                this.updateScore(10)
            }
            else {
                row--;
            }
        }

        this.tetromino = this.getNextTetromino();
    }

    updateScore(newScore) {
        this.score += newScore;

        this.speed = Math.floor(++this.rowCount / 20) + 1;

        console.log(this.speed);

        this.scoreSpan.textContent = `${this.score} - ${this.rowCount}`;
    }

    showGameOver() {
        cancelAnimationFrame(this.rAF);

        this.gameOver = true;

        this.gameContext.fillStyle = 'black';
        this.gameContext.globalAlpha = 0.75;
        this.gameContext.fillRect(0, this.gameCanvas.height / 2 - 30, this.gameCanvas.width, 60);

        this.gameContext.globalAlpha = 1;
        this.gameContext.fillStyle = 'white';
        this.gameContext.font = '36px monospace';
        this.gameContext.textAlign = 'center';
        this.gameContext.textBaseline = 'middle';
        this.gameContext.fillText('GAME OVER!', this.gameCanvas.width / 2, this.gameCanvas.height / 2);
    }

    loop() {
        this.rAF = requestAnimationFrame(this.loop);

        this.gameContext.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 10; col++) {
                if (this.playfield[row][col]) {
                    const name = this.playfield[row][col];
                    this.gameContext.fillStyle = this.tetrominos[name].color;

                    this.gameContext.fillRect(col * this.grid, row * this.grid, this.grid - 1, this.grid - 1);
                }
            }
        }

        if (this.tetromino) {
            if (++this.count * this.speed > 35) {
                this.tetromino.row++;
                this.count = 0;

                if (!this.isValidMove(this.tetromino.matrix, this.tetromino.row, this.tetromino.col)) {
                    this.tetromino.row--;
                    this.placeTetromino();
                }
            }

            this.gameContext.fillStyle = this.tetrominos[this.tetromino.name].color;

            for (let row = 0; row < this.tetromino.matrix.length; row++) {
                for (let col = 0; col < this.tetromino.matrix[row].length; col++) {
                    if (this.tetromino.matrix[row][col]) {

                        this.gameContext.fillRect((this.tetromino.col + col) * this.grid, (this.tetromino.row + row) * this.grid, this.grid - 1, this.grid - 1);
                    }
                }
            }
        }
    }
}

const tetrisGame = new TetrisGame();