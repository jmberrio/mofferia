import { Component, ViewChild, ElementRef } from '@angular/core';
import { BestScoreManager } from './app.storage.service';
import { CASETAIMG, INITIAL_FRUITS, MOVEMENTS, SNAKE_SPEED, CONST_LIVES, MOVE_MANUAL, MAX_TIME, TIME_LOST_PER_FAIL, CONTROLS, COLORS, PORTADA, MINIMUM_SCORE_TO_LIGHT, MAX_PIECES, MAX_ENEMIES, CASETAS, BOARD_SIZE_COLS, BOARD_SIZE_ROWS, BOARD_VP_WIDTH, BOARD_VP_HEIGHT, BOARD_VP_THRESHOLD} from './app.constants';
import { NewGameComponent } from './newgame/newgame.component';
import { GameOverComponent } from './gameover/gameover.component';
import { isGeneratedFile } from '@angular/compiler/src/aot/util';
import { splitClasses } from '@angular/compiler';
import { MatDialog, MatDialogConfig, MatSnackBar } from '@angular/material';
import { Partida } from './app.interfaces';

@Component({
  selector: 'ngx-snake',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {
    '(document:keydown)': 'handleKeyboardEvents($event)'
  }
})
export class AppComponent {

  // Information about the players
  private player = {
    team: "undefined",
    name: "undefined",
    score: 0
  }
  
  partida: Partida = {
    clave: '',
    equipo: '',
    fechaHora: new Date(),
    puntuacion: 0,
    usuario: ''
  }

  @ViewChild('canvasMap') 
  canvasMap: ElementRef<HTMLCanvasElement>;

  @ViewChild('canvasViewport') 
  canvasViewport: ElementRef<HTMLCanvasElement>;

  @ViewChild('canvasHead') 
  canvasHead: ElementRef<HTMLCanvasElement>;

  public ctxMap: CanvasRenderingContext2D;
  public ctxHead: CanvasRenderingContext2D;
  public ctxViewport: CanvasRenderingContext2D;



  public volumeOn = true;
  public volume = 0.2;
  
  public teamSet = false;
  private interval: number;
  private tempDirection: number;
  private default_mode = 'classic';
  private isGameOver = false;
  private audio = new Audio();
  private audioError = new Audio();
  private audioPortada = new Audio();
  private audioFin = new Audio();

  public getKeys = Object.keys;
  public board = [];
  public baseboard = [];
  public obstacles = [];
  public enemies = [];
  public score = 0;
  public numPieces = MAX_PIECES;
  public currentBulbs = 0;
  public remainingAttempts = CONST_LIVES;
  public showMenuChecker = false;
  public gameStarted = false;
  public newBestScore = false;
  public best_score = this.bestScoreService.retrieve();
  public time = MAX_TIME;
  timer;

  private snake = {
    direction: CONTROLS.LEFT,
    parts: [
      {
        x: -1,
        y: -1
      }
    ],
    movement: MOVEMENTS.MOVE
  };

  private viewport = {
    x: BOARD_SIZE_ROWS - BOARD_VP_HEIGHT,
    y: 30,
    height: BOARD_VP_HEIGHT,
    width: BOARD_VP_WIDTH
  };

  private fruit = {
    x: -1,
    y: -1
  };

  constructor (
    private bestScoreService: BestScoreManager, public dialog: MatDialog, public snackBar: MatSnackBar) {
      this.setBoard();
      this.player.team = localStorage.getItem('team');
      this.player.name =  localStorage.getItem('player')
      this.partida.usuario = this.player.name;
      this.partida.equipo = this.player.team;
      if (this.player.name) {
        this.teamSet = true;
      }
  }


  onToggleVolume(value) {
    if (value.checked) this.playAudio(this.audio);
    else this.stopAudio();
  }

  onChangeVolume(e) {
    this.audio.volume = e.value;
  }


  arrayHeight() :  number [] {
    return Array(BOARD_VP_HEIGHT);
  }

  arrayWidth() :  number [] {
    return Array(BOARD_VP_WIDTH);
  }

  openDialog() : void {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.hasBackdrop = true;
    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(
      NewGameComponent, 
      dialogConfig);

    dialogRef.afterClosed().subscribe(data => {
      if(data.team && data.name && data.codigo) {
        this.partida.equipo = data.team;
        this.player.team = data.team;
        this.partida.usuario = data.name;
        this.player.name = data.name;
        this.partida.clave = data.codigo;
        this.teamSet = true;
        this.currentBulbs = 0;
        this.newGame(this.default_mode);
      }
    });
  }


  handleKeyboardEvents(e: KeyboardEvent) {
    let move = true;

    // Logging
    // console.log ( "snakeDirection: " + this.snake.direction);
    // console.log ( "keyCode: " + e.keyCode);

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

    // Logging
    // console.log ( "snakeStopped: " + this.isSnakeStopped());
    // console.log ( "move: " + move);
    // console.log ( "isGameOver: " + this.isGameOver);
    // console.log ( "MOVE_MANUAL: " + MOVE_MANUAL);

    // Manual vs automatic move
    if (this.isSnakeStopped() && move && !this.isGameOver && !MOVE_MANUAL){
      this.snake.movement = MOVEMENTS.MOVE
      this.updatePositions()
    } else if (MOVE_MANUAL && move) { 
      this.updatePositions()
    }
  }

  setClass(row: number, col: number) : string[] {
    let actualRow = row + this.viewport.x;
    let actualCol = col + this.viewport.y;
    let commonClass = 'objeto';
    let particularClass = '';
    if (this.board[actualRow][actualCol] === "b") {
      particularClass = 'bombilla';
    } else if (this.board[actualRow][actualCol] === "e") {
      particularClass = 'enemigo';
    } else if (this.board[actualRow][actualCol] === "f") {
      particularClass = 'bombilla';
    } else if (this.snake.parts[0].x === actualRow && this.snake.parts[0].y === actualCol) {
      particularClass = 'cabeza';
    } else if (this.board[actualRow][actualCol] === true) {
      particularClass = 'cuerpo';
    } else if (this.checkObstacles(actualRow, actualCol)) {
      particularClass = 'obstaculo';
    } else if (this.board[actualRow][actualCol]==="p") {
      particularClass = 'portada';
    } else particularClass = 'fondo';

    return [commonClass,particularClass];
  }

  displayCaseta(row:number, col:number) { 
    let actualRow = row + this.viewport.x;
    let actualCol = col + this.viewport.y;
    return this.board[actualRow][actualCol] === "i";
  }


  setColors(row: number, col: number): string {
    if (this.board[row][col] === "b") {
      return COLORS.BOMBILLA;
    } else if (this.board[row][col] === "e") {
      return "url('/assets/images/bombilla.svg')" + ", " + COLORS.ENEMY;
    } else if (this.board[row][col] === "f") {
      return COLORS.FRUIT;
    } else if (this.snake.parts[0].x === row && this.snake.parts[0].y === col) {
      return COLORS.HEAD;
    } else if (this.board[row][col] === true) {
      return "url('/assets/images/bombilla.svg')" + ", " + COLORS.BODY;
    } else if (this.checkObstacles(row, col)) {
      return COLORS.OBSTACLE;
    } else if (this.board[row][col]==="p") {
      return "url('/assets/images/bombilla.svg')" + ", " + COLORS.PORTADA;
    }

    return COLORS.BOARD;
  };

  setImage(row: number, col: number): string {
    return "url('/assets/images/bombilla.svg')";
  };

  updateEnemy () : void {

    let me = this;

    // Move the enemies
    if (!this.isGameOver){
      for (let en = 0; en < this.enemies.length; en ++ ) {
        this.repositionEnemy(en);
      }
      setTimeout(() => {
        me.updateEnemy();
      }, 250);
    }

  }
  
  updatePositions(): void {

    if (this.isGameOver || this.isSnakeStopped() ) {
      return;
    }

    let newHead = this.repositionHead();
    let me = this;
    let crash = false;

    //this.noWallsTransition(newHead);
    if (this.obstacleCollision(newHead) || this.wallCollision(newHead)) {
      crash = true;
    }
    
    if (this.selfCollision(newHead)) {
      // this.gameOver();
      this.openSnackBar();
    } else  if (this.enemyCollision(newHead)) {
      this.removeEnemyAt(newHead.x, newHead.y)
      // this.gameOver();
      this.openSnackBar();
      // In any case, we lose the number of bulbs collected.
      this.score = 0;
      this.removeTail();
    } else if (this.fruitCollision(newHead)) {
      this.eatFruit();

    // If the snake reaches the Portada.
    } else if (this.portadaCollision(newHead)){

      // If the snake has, at least, the minimum number of lights, we increase the final score.
      if (this.score >= MINIMUM_SCORE_TO_LIGHT) {
        this.lightBulbs(this.score);
        this.currentBulbs += this.score;
        this.playAudio(this.audioPortada);
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
      this.drawHead(newHead);
    } else if (!MOVE_MANUAL){
      this.stopSnake();
    }

    // Change viewport if needed
    // console.log("viewport: " + this.viewport.x + "," + this.viewport.y);
    if (newHead.x >= this.viewport.x + this.viewport.height - BOARD_VP_THRESHOLD && newHead.x < BOARD_SIZE_ROWS - BOARD_VP_THRESHOLD) this.viewport.x = this.viewport.x + 1;
    else if (newHead.x < this.viewport.x + BOARD_VP_THRESHOLD && this.viewport.x > 0) this.viewport.x = this.viewport.x - 1;
    else if (newHead.y >= this.viewport.y + this.viewport.width - BOARD_VP_THRESHOLD && newHead.y < BOARD_SIZE_COLS - BOARD_VP_THRESHOLD) this.viewport.y = this.viewport.y + 1;
    else if (newHead.y < this.viewport.y + BOARD_VP_THRESHOLD && this.viewport.y > 0) this.viewport.y = this.viewport.y - 1;

    this.drawViewport();

    // Manual vs automatic movement of the snake.
    if (!this.isGameOver && !MOVE_MANUAL){
      setTimeout(() => {
        me.updatePositions();
      }, SNAKE_SPEED);
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

  stopSnake () : void {
    this.snake.movement = MOVEMENTS.STOP;
  }

  moveSnake () : void {
    this.snake.movement = MOVEMENTS.MOVE;
    if (!MOVE_MANUAL) this.updatePositions();
  }

  stopGame () : void {
    this.isGameOver = true;
  }

  startGame () : void {
    this.isGameOver = false;
  }

  resumeGame () : void {
    this.isGameOver = false;
  }

  isSnakeStopped () : boolean {
    return (this.snake.movement == MOVEMENTS.STOP);
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

    //this.traceSnakePosition();
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
    if (direction === CONTROLS.UP) {
      newX -= 1;
      if ((newX === 0) || (this.collisionEnemy(newX-1, newY))) newDirection = CONTROLS.DOWN;
    } else if (direction === CONTROLS.DOWN) { 
      newX += 1;
      if ((newX === BOARD_SIZE_ROWS-1) || (this.collisionEnemy(newX+1, newY))) newDirection = CONTROLS.UP;
    } else if (direction === CONTROLS.LEFT) {
      newY -= 1;
      if ((newY === 0) || (this.collisionEnemy(newX, newY-1))) newDirection = CONTROLS.RIGHT;
    } else if (direction === CONTROLS.RIGHT) {
      newY += 1;
      if ((newY === BOARD_SIZE_COLS-1) || (this.collisionEnemy(newX, newY+1))) newDirection = CONTROLS.LEFT;
    }

    //console.log("Enemy " + index + ": newPosX: " + newX);
    //console.log("Enemy " + index + ": newPosY: " + newY);

    this.enemies[index][0] = newX;
    this.enemies[index][1] = newY;
    this.enemies[index][2] = newDirection;

    this.resetBackground(posX, posY)
    this.board[newX][newY] = "e";

    // Check collision with player
    if (this.collisionPlayer(newX,newY)) {
      // this.gameOver();
      this.openSnackBar();
      this.removeEnemy(index);
      this.score = 0;
      this.removeTail();

    }
  }

  // Remove enemy at a specific position
  removeEnemyAt (x: any, y:any) : void {
    for (let i = 0; i < this.enemies.length; i++) {
      if (this.enemies[i][0] === x && this.enemies[i][1] === y){
        this.removeEnemy(i);
        return;
      }
    }
  }

  // Remove enemy
  removeEnemy (index: any) : void {

    // Gets the enemy position.
    let x = this.enemies[index][0];
    let y = this.enemies[index][1];

    // Remove the enemy from the list of enemies.
    this.enemies.splice(index,1);
    this.board[x][y] = true;

  }

  // Draw background: If had crossed the tail, let's draw the tail, otherwise draw floor
  resetBackground(x: any, y: any) : void {

    this.board[x][y] = this.baseboard[x][y];
    if (this.isTail(x, y)) { this.board[x][y] = true}
  }

  isTail(x: any, y:any) {
    for (let n = 1; n<this.snake.parts.length; n++) {
      if (this.snake.parts[n].x == x && this.snake.parts[n].y == y) return true;
    }
    return false;
  }

  collisionEnemy (x: any, y: any) : boolean {
    if (this.board[x][y] === "o" || this.board[x][y] === "b" || this.board[x][y] === "i") return true;
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
      if (this.enemies[n][2] === CONTROLS.DOWN && this.enemies[n][0] === (BOARD_SIZE_ROWS-1)) this.enemies[n][2] = CONTROLS.UP;
      else if (this.enemies[n][2] === CONTROLS.UP && this.enemies[n][0] === 0) this.enemies[n][2] = CONTROLS.DOWN;
      else if (this.enemies[n][2] === CONTROLS.RIGHT && this.enemies[n][1] === (BOARD_SIZE_COLS-1)) this.enemies[n][2] = CONTROLS.LEFT;
      else if (this.enemies[n][2] === CONTROLS.LEFT && this.enemies[n][1] === 0) this.enemies[n][2] = CONTROLS.RIGHT;

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
  }

  checkObstacles(x, y): boolean {
    if (this.overTheEdge(x, y)) return false;
    else if (this.board[x][y] === "o" || this.board[x][y] === "b" || this.board[x][y] === "i") return true;
    else return false;

  }

  obstacleCollision(part: any): boolean {
    return this.checkObstacles(part.x, part.y);
  }

  overTheEdge(x: any, y: any) : boolean { 
    if (x === -1 || y === -1 || x === BOARD_SIZE_ROWS || y === BOARD_SIZE_COLS) return true;
    else return false;
  }

  wallCollision(part: any): boolean {
    // console.log("new head " + part.x + "," + part.y);
    if (this.overTheEdge(part.x, part.y)) return true;
    else return false;
  }

  portadaCollision(part: any): boolean {
    if (this.overTheEdge(part.x, part.y)) return false;
    else if (this.board[part.x][part.y] === "p") return true;
    else return false;
  }

  enemyCollision(part: any): boolean {
    if (this.overTheEdge(part.x, part.y)) return false;
    else if (this.board[part.x][part.y] === "e") return true;
    else return false;
  }

  selfCollision(part: any): boolean {
    if (this.overTheEdge(part.x, part.y)) return false;
    else if (this.board[part.x][part.y] === true) return true;
    else return false;
  }

  fruitCollision(part: any): boolean {
    if (this.overTheEdge(part.x, part.y)) return false;
    else if (this.board[part.x][part.y] === "f") return true;
    else return false;
  }

  resetFruit(numFruits: number): void {

    for (let i = 0; i< numFruits; i++) {
      let x = this.randomNumber(BOARD_SIZE_ROWS);
      let y = this.randomNumber(BOARD_SIZE_COLS);
      do {
        x = this.randomNumber(BOARD_SIZE_ROWS);
        y = this.randomNumber(BOARD_SIZE_COLS);
      } while (this.board[x][y] != "")

      //console.log ("Bulb in: " + x + "," + y);
      /*this.fruit = {
        x: x,
        y: y
      };*/
      this.board[x][y] = "f";
    }
  }

  eatFruit(): void {
    this.score++;
    let tail = Object.assign({}, this.snake.parts[this.snake.parts.length - 1]);
    this.snake.parts.push(tail);
    if (this.score % 10 === 0) {
      this.resetFruit(10);
    }
  }

  timeOver() : void {
    clearInterval(this.timer);
    this.isGameOver = true;
    this.gameStarted = false;
    this.partida.puntuacion = this.currentBulbs;    
    this.partida.fechaHora = new Date();
    this.bestScoreService.guardarPartida(this.partida);
    this.playAudio(this.audioFin);
  }

  openSnackBar(): void {
    this.stopGame();
    this.gameStarted = false;
    this.stopSnake();

    let timetolose = TIME_LOST_PER_FAIL;
    if (timetolose > this.time) timetolose = this.time;

    let me = this;
    if (this.time - TIME_LOST_PER_FAIL >= 0) this.time -= TIME_LOST_PER_FAIL;
    else this.time = 0;
    
    clearInterval(this.timer);

    const mensajesGameOver: string[] = ['Pa tu casa ya, ome', 'El caballo no es transparente'];
    const randomNumber = Math.floor((Math.random() * mensajesGameOver.length - 1) + 1);

    const snackBarRef = this.snackBar.open(mensajesGameOver[randomNumber], 'Pal real de nuevo', {
      duration: 6000
    });

    snackBarRef.afterDismissed().subscribe(data => {
      me.isGameOver = false;
      if (this.time > 0) {
        this.startTimer();
        this.moveSnake();
        this.resumeGame();
        this.updateEnemy();
      } else this.timeOver();
    });

    this.playAudio(this.audioError);
  }


  gameOver(): void {

    this.stopGame();
    this.gameStarted = false;
    this.stopSnake();

    let timetolose = TIME_LOST_PER_FAIL;
    if (timetolose > this.time) timetolose = this.time;

    let me = this;
    if (this.time - TIME_LOST_PER_FAIL >= 0) this.time -= TIME_LOST_PER_FAIL;
    else this.time = 0;
    

    clearInterval(this.timer);

    const dialogConfig = new MatDialogConfig();
    dialogConfig.hasBackdrop = true;
    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.data = {bulbs:this.currentBulbs, time: this.time, timelost: timetolose}

    const dialogRef = this.dialog.open(
      GameOverComponent, 
      dialogConfig);

    dialogRef.afterClosed().subscribe(data => {
      me.isGameOver = false;
      if (this.time > 0) {
        this.startTimer();
        this.moveSnake();
        this.resumeGame();
        this.updateEnemy();
      } else this.timeOver();
    });

    this.playAudio(this.audioError);

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

    this.setBordes();
    this.setSection(CASETAS,"o");
    this.setSection(PORTADA, "p");
    this.setCasetasImg();
    this.setEnemy();
    this.updateEnemy();
  }

  setBordes () : void {
    let i = 0;
    let j = 0;
    for (i = 0; i< BOARD_SIZE_ROWS; i++) { 
      this.board[i][0] = "o";
      this.board[i][BOARD_SIZE_COLS-1] = "o";
      this.baseboard[i][0] = "o";
      this.baseboard[i][BOARD_SIZE_COLS-1] = "o";
    }
    for (j = 0; j< BOARD_SIZE_COLS; j++) { 
      this.board[0][j] = "o";
      this.board[BOARD_SIZE_ROWS-1][j] = "o";
      this.baseboard[0][j] = "o";
      this.baseboard[BOARD_SIZE_ROWS-1][j] = "o";
    }
  }

  setCasetasImg () : void { 
    for (let c = 0; c < CASETAIMG.length; c++) {
      let caseta = CASETAIMG[c];
      this.board[caseta[0]][caseta[1]] = "i";
      this.baseboard[caseta[0]][caseta[1]] = "i";
    }
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
      if (x >= BOARD_SIZE_ROWS) break;
      for (y = upleftY; y< upleftY + height; y++) {
        if (y >= BOARD_SIZE_COLS) break;
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

    //Can externalize the variables
    this.audio.src = "/assets/audio/tocala.mp3";
    this.audioError.src = "/assets/audio/error.mp3";
    this.audioPortada.src = "/assets/audio/portada.mp3";
    this.audioFin.src = "/assets/audio/fin.mp3";
    this.audio.volume = 0.3;
    this.audio.load();
    this.audioError.load();
    this.audioPortada.load();
    this.audioFin.volume = 0.3;
    this.audioFin.load();
    
    this.default_mode = mode || 'classic';
    this.showMenuChecker = false;
    this.newBestScore = false;
    this.gameStarted = true;
    this.score = 0;
    this.time = MAX_TIME;
    this.tempDirection = CONTROLS.RIGHT;
    this.isGameOver = false;
    this.interval = 500;
    this.snake = {
      direction: CONTROLS.RIGHT,
      parts: [],
      movement: MOVEMENTS.MOVE
    };

    this.setInitialSnake ();

    this.resetFruit(INITIAL_FRUITS);
    this.updatePositions();
    this.startTimer()
    this.playAudio(this.audio);
  }

  setInitialSnake () : void {
    let snakeX = 55;
    let snakeY = 20;
    this.snake.parts.push({x : snakeX, y: snakeY });
    this.viewport.x = BOARD_SIZE_ROWS - BOARD_VP_HEIGHT;
    this.viewport.y = snakeY - BOARD_VP_THRESHOLD;
    this.viewport.height = BOARD_VP_HEIGHT;
    this.viewport.width = BOARD_VP_WIDTH;
  }
  

  startTimer() : void {
    this.timer = setInterval(() => {
        this.time--;
        if (this.time === 0) this.timeOver();
      },1000)
  }
  
  stopAudio(){
    this.audio.pause();
  }


  playAudio(audio:HTMLAudioElement){

    const promise = audio.play();
    if (promise !== undefined) { // On older browsers play() does not return anything, so the value would be undefined.
      promise
        .then(() => {
          // Audio is playing.
        })
        .catch(error => {
          console.log(error);
        });
    } 
  }

  ngOnInit(): void {
    var cvMap = <HTMLCanvasElement>document.getElementsByName('canvasMap')[0];
    var cvHead = <HTMLCanvasElement>document.getElementsByName('canvasHead')[0];
    var cvViewport = <HTMLCanvasElement>document.getElementsByName('canvasViewport')[0];
    cvMap.width  = BOARD_SIZE_COLS;
    cvMap.height = BOARD_SIZE_ROWS;
    cvViewport.width  = BOARD_SIZE_COLS;
    cvViewport.height = BOARD_SIZE_ROWS;
    cvHead.width  = BOARD_SIZE_COLS;
    cvHead.height = BOARD_SIZE_ROWS;
    this.drawMiniMap();
    this.drawViewport();
    this.setInitialSnake();
  }

  drawMiniMap() : void {
    this.ctxMap = this.canvasMap.nativeElement.getContext('2d');
    this.ctxHead = this.canvasHead.nativeElement.getContext('2d');
    this.ctxViewport = this.canvasViewport.nativeElement.getContext('2d');
    this.drawSection(CASETAS,"black");
    this.drawSection(PORTADA, "green");
    this.drawBorder();
  }

  drawBorder () : void {
    this.ctxMap.fillStyle = "black";
    this.ctxMap.strokeRect(0, 0, BOARD_SIZE_COLS, BOARD_SIZE_ROWS);
  }

  drawViewport () : void {
    this.clearViewport();
    this.ctxViewport.fillStyle = "grey";
    this.ctxViewport.strokeRect(this.viewport.y, this.viewport.x, this.viewport.width, this.viewport.height);
  }

  drawHead (newHead:any) : void {
    this.clearHead();
    this.ctxHead.fillStyle = "red";
    this.ctxHead.fillRect(newHead.y, newHead.x, 3, 3);
  }

  clearViewport () : void {
    this.ctxViewport.clearRect(0,0,BOARD_SIZE_COLS,BOARD_SIZE_ROWS);
  }

  clearHead () : void {
    this.ctxHead.clearRect(0,0,BOARD_SIZE_COLS,BOARD_SIZE_ROWS);
  }

  drawSection (section: any, mode: any) : void {

    let c = 0;
    let upleftX = 0;
    let upleftY = 0;
    let width = 0;
    let height = 0;

    // Iteration through casetas - declared map
    for (c = 0; c < section.length; c++) {
      let part = section[c];
      upleftX = section[c][0];
      upleftY = section[c][1];
      width = section[c][2];
      height = section[c][3];
      this.ctxMap.fillStyle = mode;
      this.ctxMap.fillRect(upleftY, upleftX, height, width);
      }

  }

  animate(): void {}

}