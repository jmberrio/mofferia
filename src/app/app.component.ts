import { Component } from '@angular/core';
import { BestScoreManager } from './app.storage.service';
import { CONTROLS, COLORS, PORTADA, MINIMUM_SCORE_TO_LIGHT, MAX_PIECES, MAX_ENEMIES, CASETAS, BOARD_SIZE_COLS, BOARD_SIZE_ROWS} from './app.constants';
import { findLocaleData } from '@angular/common/src/i18n/locale_data_api';

@Component({
  selector: 'ngx-snake',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {
    '(document:keydown)': 'handleKeyboardEvents($event)'
  }
})
export class AppComponent {
  private interval: number;
  private tempDirection: number;
  private default_mode = 'classic';
  private isGameOver = false;
  private isGameWon = false;

  public getKeys = Object.keys;
  public board = [];
  public baseboard = [];
  public obstacles = [];
  public enemies = [];
  public score = 0;
  public numPieces = MAX_PIECES;
  public currentBulbs = 0;
  public showMenuChecker = false;
  public gameStarted = false;
  public newBestScore = false;
  public best_score = this.bestScoreService.retrieve();
  public time = 0;
  timer;

  private snake = {
    direction: CONTROLS.LEFT,
    parts: [
      {
        x: -1,
        y: -1
      }
    ]
  };

  private fruit = {
    x: -1,
    y: -1
  };

  constructor(
    private bestScoreService: BestScoreManager
  ) {
    this.setBoard();
  }

  handleKeyboardEvents(e: KeyboardEvent) {
    let move = true;
    if (e.keyCode === CONTROLS.LEFT && this.snake.direction !== CONTROLS.RIGHT) {
      this.tempDirection = CONTROLS.LEFT;
    } else if (e.keyCode === CONTROLS.UP && this.snake.direction !== CONTROLS.DOWN) {
      this.tempDirection = CONTROLS.UP;
    } else if (e.keyCode === CONTROLS.RIGHT && this.snake.direction !== CONTROLS.LEFT) {
      this.tempDirection = CONTROLS.RIGHT;
    } else if (e.keyCode === CONTROLS.DOWN && this.snake.direction !== CONTROLS.UP) {
      this.tempDirection = CONTROLS.DOWN;
    } else {
      move = false;
    }

    if (move){
      this.updatePositions()
    }
  }

  setColors(row: number, col: number): string {
    if (this.isGameOver) {
      return COLORS.GAME_OVER;
    } else if (this.isGameWon) {
      return COLORS.GAME_WON;
    } else if (this.board[row][col] === "e") {
      return COLORS.ENEMY;
    } else if (this.board[row][col] === "b") {
      return COLORS.BOMBILLA;
    } else if (this.fruit.x === row && this.fruit.y === col) {
      return COLORS.FRUIT;
    } else if (this.snake.parts[0].x === row && this.snake.parts[0].y === col) {
      return COLORS.HEAD;
    } else if (this.board[row][col] === true) {
      return COLORS.BODY;
    } else if (this.checkObstacles(row, col)) {
      return COLORS.OBSTACLE;
    } else if (this.board[row][col]==="p") {
      return COLORS.PORTADA;
    }

    return COLORS.BOARD;
  };

  updateEnemy () : void {
    let me = this;

    // Move the enemies
    for (let en = 0; en < this.enemies.length; en ++ ) {
      this.repositionEnemy(en);
    }

    setTimeout(() => {
      me.updateEnemy();
    }, 250);
  }
  
  updatePositions(): void {

    let newHead = this.repositionHead();
    let me = this;
    let crash = false;

    //this.noWallsTransition(newHead);
    if (this.obstacleCollision(newHead) || this.wallCollision(newHead)) {
      crash = true;
    }
    
    if (this.selfCollision(newHead)) {
      return this.gameOver();
    } else  if (this.enemyCollision(newHead)) {
      return this.gameOver();
    } else if (this.fruitCollision(newHead)) {
      this.eatFruit();

    // If the snake reaches the Portada.
    } else if (this.portadaCollision(newHead)){

      // If the snake has, at least, the minimum number of lights, we increase the final score.
      if (this.score >= MINIMUM_SCORE_TO_LIGHT) {
        this.lightBulbs(this.score);
        this.currentBulbs += this.score;
      }

      // In any case, we lose the number of bulbs collected.
      this.score = 0;
      this.removeTail();

    }

    if (!crash){
      let oldTail = this.snake.parts.pop();
      this.board[oldTail.x][oldTail.y] = this.baseboard[oldTail.x][oldTail.y];
      this.snake.parts.unshift(newHead);
      this.board[newHead.x][newHead.y] = true;
      this.snake.direction = this.tempDirection;
    }
  }

  lightBulbs (score: any) : void {
    let remaining = score;
    let c = 0;
    while (c < CASETAS.length && remaining > 0) {
      remaining -= this.fillChunk(CASETAS[c][0], CASETAS[c][1], CASETAS[c][2], CASETAS[c][3], "b", remaining);
      c++;
    }
  }


  traceSnakePosition () : void {
    console.log("Snake head: " + this.snake.parts[0].x + "," + this.snake.parts[0].y);
    for (let i = 1; i<this.snake.parts.length; i++) {
      console.log("Snake part #" + i + ": " + this.snake.parts[i].x + "," + this.snake.parts[i].y);
    }
  }

  removeTail() : void {
    // this.traceSnakePosition();
    for (let i = 1; i < this.snake.parts.length; i++) {
      this.board[this.snake.parts[i].x][this.snake.parts[i].y] = this.baseboard[this.snake.parts[i].x][this.snake.parts[i].y];
    }
    this.snake.parts.splice(1,this.snake.parts.length-1);
  }

  repositionHead(): any {
    let newHead = Object.assign({}, this.snake.parts[0]);

    if (this.tempDirection === CONTROLS.LEFT) {
      newHead.y -= 1;
    } else if (this.tempDirection === CONTROLS.RIGHT) {
      newHead.y += 1;
    } else if (this.tempDirection === CONTROLS.UP) {
      newHead.x -= 1;
    } else if (this.tempDirection === CONTROLS.DOWN) {
      newHead.x += 1;
    }

    return newHead;
  }

  repositionEnemy(index:number): void {

    //console.log("Repositioning enemy " + index + "...")
    
    let posX = this.enemies[index][0];
    let posY = this.enemies[index][1];
    let direction = this.enemies[index][2];

    //console.log("Enemy " + index + ": (" + posX + "," + posY + ")");
    //console.log("Enemy " + index + ": direction: " + direction);

    let newX = posX;
    let newY = posY; 
    let newDirection = direction;
    if (direction === CONTROLS.LEFT) {
      newX -= 1;
      if ((newX === 0) || (this.collisionEnemy(newX-1, newY))) newDirection = CONTROLS.RIGHT;
    } else if (direction === CONTROLS.RIGHT) { 
      newX += 1;
      if ((newX === BOARD_SIZE_ROWS-1) || (this.collisionEnemy(newX+1, newY))) newDirection = CONTROLS.LEFT;
    } else if (direction === CONTROLS.UP) {
      newY -= 1;
      if ((newY === 0) || (this.collisionEnemy(newX, newY-1))) newDirection = CONTROLS.DOWN;
    } else if (direction === CONTROLS.DOWN) {
      newY += 1;
      if ((newY === BOARD_SIZE_COLS-1) || (this.collisionEnemy(newX, newY+1))) newDirection = CONTROLS.UP;
    }

    //console.log("Enemy " + index + ": newPosX: " + newX);
    //console.log("Enemy " + index + ": newPosY: " + newY);

    this.enemies[index][0] = newX;
    this.enemies[index][1] = newY;
    this.enemies[index][2] = newDirection;
    this.board[posX][posY] = this.baseboard[posX][posY];
    this.board[newX][newY] = "e";

    // Check collision with player
    if (this.collisionPlayer(newX,newY)) {
      this.gameOver();
    }
  }

  collisionEnemy (x: any, y: any) : boolean {
    if (this.board[x][y] === "o" || this.board[x][y] === "b") return true;
    else return false;
  }

  collisionPlayer (x: any, y: any) : boolean {
    for (let i = 0; i < this.snake.parts.length; i++) {
      let newHead = Object.assign({}, this.snake.parts[i]);
      if (this.board[x][y] === true || (newHead.x === x && newHead.y === y)) {
        return true;
      }
    }
    return false;
  }

  noWallsTransition(part: any): void {
    if (part.x === BOARD_SIZE_ROWS) {
      part.x = 0;
    } else if (part.x === -1) {
      part.x = BOARD_SIZE_ROWS - 1;
    }

    if (part.y === BOARD_SIZE_COLS) {
      part.y = 0;
    } else if (part.y === -1) {
      part.y = BOARD_SIZE_COLS - 1;
    }
  }

  addEnemies(): void {
    let x = 0;
    let y = 0;
    let n = 0;

    for (n = 0; n < MAX_ENEMIES; n++) {
      do {
      x = this.randomNumber(BOARD_SIZE_ROWS);
      y = this.randomNumber(BOARD_SIZE_COLS);
      } while (this.board[x][y] != "") 

      this.board[x][y] = "e";
      this.enemies[n] = [];
      this.enemies[n][0] = x;
      this.enemies[n][1] = y;
      this.enemies[n][2] = this.randomDirection();

      // Fix the direction if the enemy has been added in an edge
      if (this.enemies[n][2] === CONTROLS.DOWN && this.enemies[n][1] === (BOARD_SIZE_ROWS-1)) this.enemies[n][2] = CONTROLS.UP;
      else if (this.enemies[n][2] === CONTROLS.UP && this.enemies[n][1] === 0) this.enemies[n][2] = CONTROLS.DOWN;
      else if (this.enemies[n][2] === CONTROLS.RIGHT && this.enemies[n][0] === (BOARD_SIZE_ROWS-1)) this.enemies[n][2] = CONTROLS.LEFT;
      else if (this.enemies[n][2] === CONTROLS.LEFT && this.enemies[n][0] === 0) this.enemies[n][2] = CONTROLS.RIGHT;

        // console.log("Added enemy " + n + " (" + x + "," + y + "," + this.enemies[n][2] + ")");

    }
  }

  addObstacles(): void {
    let x = this.randomNumber(BOARD_SIZE_ROWS);
    let y = this.randomNumber(BOARD_SIZE_COLS);

    if (this.board[y][x] === true || y === 8) {
      return this.addObstacles();
    }

    this.board[y][x] = "o";
    /*this.obstacles.push({
      x: x,
      y: y
    });*/
  }

  checkObstacles(x, y): boolean {
    if (this.board[x][y] === "o" || this.board[x][y] === "b") {
      return true;
    } else return false;

  }

  obstacleCollision(part: any): boolean {
    return this.checkObstacles(part.x, part.y);
  }

  wallCollision(part: any): boolean {
    return (part.x === -1 || part.y === -1 || part.x === BOARD_SIZE_ROWS || part.y === BOARD_SIZE_COLS);
  }

  portadaCollision(part: any): boolean {
    return (this.board[part.x][part.y] === "p");
  }

  enemyCollision(part: any): boolean {
    return (this.board[part.x][part.y] === "e");
  }

  boardCollision(part: any): boolean {
    return part.x === BOARD_SIZE_ROWS || part.x === -1 || part.y === BOARD_SIZE_COLS || part.y === -1;
  }

  selfCollision(part: any): boolean {
    return this.board[part.x][part.y] === true;
  }

  fruitCollision(part: any): boolean {
    return part.x === this.fruit.x && part.y === this.fruit.y;
  }

  resetFruit(): void {

    let x = this.randomNumber(BOARD_SIZE_ROWS);
    let y = this.randomNumber(BOARD_SIZE_COLS);
    do {
      x = this.randomNumber(BOARD_SIZE_ROWS);
      y = this.randomNumber(BOARD_SIZE_COLS);
    } while (this.board[x][y] != "")

    //console.log ("Bulb in: " + x + "," + y);
    this.fruit = {
      x: x,
      y: y
    };
  }

  eatFruit(): void {
    this.score++;

    let tail = Object.assign({}, this.snake.parts[this.snake.parts.length - 1]);

    this.snake.parts.push(tail);
    this.resetFruit();

    if (this.score % 5 === 0) {
      this.interval -= 15;
    }
  }

  gameOver(): void {
    this.isGameOver = true;
    this.gameStarted = false;
    let me = this;

    if (this.score > this.best_score) {
      this.bestScoreService.store(this.score);
      this.best_score = this.score;
      this.newBestScore = true;
    }

    clearInterval(this.timer);

    setTimeout(() => {
      me.isGameOver = false;
    }, 500);

    this.setBoard();
  }

  gameWon(): void {
    this.isGameWon = true;
    this.gameStarted = false;
    let me = this;

    if (this.score > this.best_score) {
      this.bestScoreService.store(this.score);
      this.best_score = this.score;
      this.newBestScore = true;
    }

    setTimeout(() => {
      me.isGameWon = false;
    }, 500);

    clearInterval(this.timer);
    this.setBoard();
  }

  randomNumber(maxSize): any {
    return Math.floor(Math.random() * maxSize);
  }

  randomDirection(): any {
    let result = this.randomNumber(4);
    if (result === 0) {
      return CONTROLS.LEFT;
    } else if (result === 1) {
      return CONTROLS.RIGHT;
    } else if (result === 2) {
      return CONTROLS.UP;
    } else if (result === 3) {
      return CONTROLS.DOWN;
    }
  }

  setBoard(): void {
    this.board = [];
    this.baseboard = [];

    for (let x = 0; x < BOARD_SIZE_ROWS; x++) {
      this.board[x] = [];
      this.baseboard[x] = [];
      for (let y = 0; y < BOARD_SIZE_COLS; y++) {
        this.board[x][y] = "";
        this.baseboard[x][y] = "";
      }
    }

    // console.log("board[0][0]= " + this.board[0][0]);
    // console.log("board[" + (BOARD_SIZE_COLS-1) + "][0]= " + this.board[BOARD_SIZE_COLS-1][0]);

    this.setSection(CASETAS,"o");
    this.setSection(PORTADA, "p");
    this.setEnemy();
    this.updateEnemy();
  }

  setSection (section: any, mode: any) : void {

    let c = 0;
    let j = 0;
    let upleftX = 0;
    let upleftY = 0;
    let width = 0;
    let height = 0;

    // Iteration through casetas - declared map
    for (c = 0; c < section.length; c++) {
      let part = section[c];
      upleftX = part[0];
      upleftY = part[1];
      width = part[2];
      height = part[3];
      this.fillChunk(upleftX, upleftY, width, height, mode, -1);
    }

  }

  setRandomObstacles () : void {
    // Random obstacles
    let j = 1;
    do {
      this.addObstacles();
    } while (j++ < 9);
  }

  setEnemy () : void {
    // Random enemy
    this.addEnemies();

  }

  fillChunk(upleftX: any, upleftY: any, width: any, height:any, mode:any, maximum:any) : any {
    let x = 0;
    let y = 0;
    let filled = 0;
    for (x = upleftX; x< upleftX + width; x++) {
      for (y = upleftY; y< upleftY + height; y++) {
        if (maximum === -1 || filled < maximum) {
          if (this.board[x][y] != mode) {
            this.board[x][y] = mode;
            this.baseboard[x][y] = mode;
            filled += 1;
          }
        } else return filled;
      }
    }
    return filled;

  }
  showMenu(): void {
    this.showMenuChecker = !this.showMenuChecker;
  }

  newGame(mode: string): void {
    this.default_mode = mode || 'classic';
    this.showMenuChecker = false;
    this.newBestScore = false;
    this.gameStarted = true;
    this.score = 0;
    this.time = 0;
    this.tempDirection = CONTROLS.RIGHT;
    this.isGameOver = false;
    this.interval = 500;
    this.snake = {
      direction: CONTROLS.RIGHT,
      parts: []
    };

    this.snake.parts.push({ x: 1, y: 4 });

    this.resetFruit();
    this.updatePositions();

    this.timer = setInterval(() => {
        this.time++;
    },1000)

  }
}
