import { Component, ViewChild, ElementRef } from '@angular/core';
import { BestScoreManager } from './app.storage.service';
import { CODIGOS_CASETA, CASETAIMG, INITIAL_POSITION, INITIAL_FRUITS, MOVEMENTS, SNAKE_SPEED, ENEMY_SPEED, CONST_LIVES, MOVE_MANUAL, MAX_TIME, TIME_LOST_PER_FAIL, CONTROLS, COLORS, PORTADA, MINIMUM_SCORE_TO_LIGHT, MAX_PIECES, MAX_ENEMIES, CASETAS, BOARD_SIZE_COLS, BOARD_SIZE_ROWS, BOARD_VP_WIDTH, BOARD_VP_HEIGHT, BOARD_VP_THRESHOLD, RATIO_MAP, SNACKBAR_DURATION, LOSE_IF_LESS} from './app.constants';
import { PORTADA_X, PORTADA_Y} from './app.constants';
import { NewGameComponent } from './newgame/newgame.component';
import { GameOverComponent } from './gameover/gameover.component';
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
    name: "undefined",
    score: 0
  }
  
  partida: Partida = {
    clave: '',
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
    direction: CONTROLS.UP,
    parts: [
      {
        x: INITIAL_POSITION.gitana.x,
        y: INITIAL_POSITION.gitana.y
      }
    ],
    movement: MOVEMENTS.MOVE
  };

  private viewport = {
    x: INITIAL_POSITION.viewport.x,
    y: INITIAL_POSITION.viewport.y,
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
      this.player.name =  localStorage.getItem('player')
      this.partida.usuario = this.player.name;
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
    dialogConfig.data =  {
      numMinimo: MINIMUM_SCORE_TO_LIGHT,
      tiempo: MAX_TIME,
      penalizacion: TIME_LOST_PER_FAIL
    }

    const dialogRef = this.dialog.open(
      NewGameComponent,
      dialogConfig);

    dialogRef.afterClosed().subscribe(data => {
      if(data.name && data.codigo) {
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

  contents (row: number, col:number) : string {
    let actualRow = row + this.viewport.x;
    let actualCol = col + this.viewport.y;
    return this.board[actualRow][actualCol];
  }

  setClass(row: number, col: number) : string[] {
    let actualRow = row + this.viewport.x;
    let actualCol = col + this.viewport.y;
    let commonClass = 'objeto';
    let particularClass = '';
    if (this.board[actualRow][actualCol] === "b") {
      particularClass = 'bombilla-entregada';
    } else if (this.board[actualRow][actualCol] === "e") {
      particularClass = 'enemigo';
    } else if (this.board[actualRow][actualCol] === "ec") {
      particularClass = 'enemigo-compadres';
    } else if (this.board[actualRow][actualCol] === "f") {
      particularClass = 'bombilla';
    } else if (this.isGitana(actualRow, actualCol)) {
      particularClass = 'cabeza';
    } else if (this.board[actualRow][actualCol] === "h") {
      if (this.score >= MINIMUM_SCORE_TO_LIGHT) particularClass = 'cuerpo-entregar';
      else particularClass = 'cuerpo';
    } else if (this.isCaseta(actualRow, actualCol)) {
      commonClass = 'obstaculo';
      particularClass = this.board[actualRow][actualCol];
    } else if (this.isPared(actualRow, actualCol)) {
      commonClass = 'wall';
    } else if (this.checkObstacles(actualRow, actualCol)) {
      commonClass = '';
      particularClass = 'obstaculo';
    } else if (this.isPortada(actualRow,actualCol)) {
      commonClass = 'obstaculo';
      particularClass = this.board[actualRow][actualCol];
    } else particularClass = 'fondo';

    return [commonClass,particularClass];
  }

  isGitana (row: number, col: number) : boolean {
    return (this.snake.parts[0].x === row && this.snake.parts[0].y === col)
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
    } else if (this.isGitana[row][col]) {
      return COLORS.HEAD;
    } else if (this.board[row][col] === "h") {
      return "url('/assets/images/bombilla.svg')" + ", " + COLORS.BODY;
    } else if (this.checkObstacles(row, col)) {
      return COLORS.OBSTACLE;
    } else if (this.isPortada(row,col)) {
      return "url('/assets/images/bombilla.svg')" + ", " + COLORS.PORTADA;
    } else if (this.board[row][col] === "ec") {
      return "url('/assets/images/compadres.png')" + ", " + COLORS.ENEMY;
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
      }, ENEMY_SPEED);
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
      if (!MOVE_MANUAL) this.stopSnake();
      crash = true;
    }
    
    if (this.selfCollision(newHead)) {
      // this.gameOver();
      // We lose the number of bulbs collected.
      this.score = 0;
      this.removeTail();
      this.openSnackBar();
    } else  if (this.enemyCollision(newHead)) {
      this.removeEnemyAt(newHead.x, newHead.y)
      // this.gameOver();
      this.openSnackBar();
      // In any case, we lose the number of bulbs collected.
      this.score = 0;
      this.removeTail();
    } else if (this.fruitCollision(newHead)) {
      this.eatFruit(newHead.x, newHead.y);

    // If the snake reaches the Portada.
    } else if (this.portadaCollision(newHead)){

      // If the snake has, at least, the minimum number of lights, we increase the final score.
      if (this.score >= MINIMUM_SCORE_TO_LIGHT) {
        this.lightBulbs(this.score);
        this.currentBulbs += this.score;
        this.playAudio(this.audioPortada);

        // In any case, we lose the number of bulbs collected.
        this.score = 0;
        this.removeTail();
      
      } else if (LOSE_IF_LESS) {

        // We lose the number of bulbs collected.
        this.score = 0;
        this.removeTail();

      }



    }

    if (!crash){
      let oldTail = this.snake.parts.pop();
      this.board[oldTail.x][oldTail.y] = this.baseboard[oldTail.x][oldTail.y];
      this.snake.parts.unshift(newHead);
      this.board[newHead.x][newHead.y] = "h";
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
    if (!this.isSnakeStopped() && !this.isGameOver && !MOVE_MANUAL){
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
    let enemyType = this.enemies[index][3];

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

    this.resetBackground(posX, posY);
    this.board[newX][newY] = enemyType;
    /*if(index%2==0){
      this.board[newX][newY] = "ec";
    } else {
      this.board[newX][newY] = "e";
    }*/
    

    // Check collision with player
    if (this.gameStarted && this.collisionPlayer(newX,newY)) {
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
    this.board[x][y] = "-";

  }

  // Draw background: If had crossed the tail, let's draw the tail, otherwise draw floor
  resetBackground(x: any, y: any) : void {

    this.board[x][y] = this.baseboard[x][y];
    if (this.isTail(x, y)) { this.board[x][y] = "h"}
  }

  isTail(x: any, y:any) {
    for (let n = 1; n<this.snake.parts.length; n++) {
      if (this.snake.parts[n].x == x && this.snake.parts[n].y == y) return true;
    }
    return false;
  }

  collisionEnemy (x: any, y: any) : boolean {
    if (this.isCaseta(x,y) || this.isPared(x,y) || this.board[x][y] === "b" || this.board[x][y] === "i") return true;
    else return false;
  }

  collisionPlayer (x: any, y: any) : boolean {
    for (let i = 0; i < this.snake.parts.length; i++) {
      let newHead = Object.assign({}, this.snake.parts[i]);
      if (this.board[x][y] === "h" || (newHead.x === x && newHead.y === y)) {
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

  setTestScenario () : void {
    this.enemies[0] = [];
    this.enemies[0][0] = 4;
    this.enemies[0][1] = 2;
    this.enemies[0][2] = CONTROLS.UP;
    this.enemies[0][3] = "ec";

    this.enemies[1] = [];
    this.enemies[1][0] = 2;
    this.enemies[1][1] = 4;
    this.enemies[1][2] = CONTROLS.LEFT;
    this.enemies[1][3] = "e";

    this.board[2][2] = "f";
    this.baseboard[2][2] = "f";
  }


  addEnemies(): void {
    let x = 0;
    let y = 0;
    let n = 0;
    let enemyType = "";

    for (n = 0; n < MAX_ENEMIES; n++) {
      do {
      x = this.randomNumber(BOARD_SIZE_ROWS);
      y = this.randomNumber(BOARD_SIZE_COLS);
      } while (this.board[x][y] != "-") 
      if(n%2 == 0) {
        enemyType = "ec";
      } else {
        enemyType = "e";
      }
      this.board[x][y] = enemyType;

      this.enemies[n] = [];
      this.enemies[n][0] = x;
      this.enemies[n][1] = y;
      this.enemies[n][2] = this.randomDirection();
      this.enemies[n][3] = enemyType;

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

    if (this.board[y][x] === "h" || y === 8) {
      return this.addObstacles();
    }

    this.board[y][x] = "o";
  }

  checkObstacles(x, y): boolean {
    if (this.overTheEdge(x, y)) return false;
    else if (this.isCaseta(x,y) || this.isObstacle(x,y) || this.board[x][y] === "b" || this.board[x][y] === "i") return true;
    else return false;
 
  }

  isCaseta(x:number, y:number) : boolean {
    return CODIGOS_CASETA.includes(this.board[x][y]);
  }

  isPortada(x:number, y:number) : boolean {
    return (this.board[x][y]).startsWith("p");
  }

  isObstacle(x:number, y:number) : boolean {
    return (this.board[x][y]==="o");
  }

  isPared(x:number, y:number) : boolean {
    return (this.board[x][y]==="w");
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
    else if (this.isPared(part.x, part.y)) return true;
    else return false;
  }

  portadaCollision(part: any): boolean {
    if (this.overTheEdge(part.x, part.y)) return false;
    else if (this.isPortada(part.x,part.y)) return true;
    else return false;
  }

  enemyCollision(part: any): boolean {
    if (this.overTheEdge(part.x, part.y)) return false;
    else if (this.board[part.x][part.y] === "e" || this.board[part.x][part.y] === "ec") return true;
    else return false;
  }

  selfCollision(part: any): boolean {
    if (this.overTheEdge(part.x, part.y)) return false;
    else if (this.board[part.x][part.y] === "h") return true;
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
      } while (this.board[x][y] != "-")

      //console.log ("Bulb in: " + x + "," + y);
      /*this.fruit = {
        x: x,
        y: y
      };*/
      this.board[x][y] = "f";
      this.baseboard[x][y] = "f";
    }
  }

  eatFruit(row: number, col:number): void {
    this.score++;
    let tail = Object.assign({}, this.snake.parts[this.snake.parts.length - 1]);
    this.snake.parts.push(tail);
    if (this.score % MINIMUM_SCORE_TO_LIGHT === 0) {
      this.resetFruit(MINIMUM_SCORE_TO_LIGHT);
    }
    this.baseboard[row][col] = "-";
  }

  timeOver() : void {
    clearInterval(this.timer);
    this.isGameOver = true;
    this.gameStarted = false;
    this.partida.puntuacion = this.currentBulbs;    
    this.partida.fechaHora = new Date();
    this.bestScoreService.guardarPartida(this.partida).subscribe(resp => {
      console.log(JSON.stringify(resp));
    });

    // Resumen final
    const dialogConfig = new MatDialogConfig();
    dialogConfig.hasBackdrop = true;
    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.data = {bulbs:this.currentBulbs, time: this.time, timelost: 0}

    const dialogRef = this.dialog.open(
      GameOverComponent, 
      dialogConfig);

    /*dialogRef.afterClosed().subscribe(data => {
      me.isGameOver = false;
      if (this.time > 0) {
        this.startTimer();
        this.moveSnake();
        this.resumeGame();
        this.updateEnemy();
      } else this.timeOver();
    });*/
    this.playAudio(this.audioFin);
  }

  disableStart(): boolean {
    return (this.gameStarted);
  }

  openSnackBar(): void {
    this.stopGame();
    this.stopSnake();

    let timetolose = TIME_LOST_PER_FAIL;
    if (timetolose > this.time) timetolose = this.time;

    let me = this;
    if (this.time - TIME_LOST_PER_FAIL >= 0) this.time -= TIME_LOST_PER_FAIL;
    else this.time = 0;
    
    clearInterval(this.timer);

    const mensajesGameOver: string[] = [
      'Tira pa casa ya, que hueles a pirriaque', 
      'Verás cuando te vea tu suegra',
      'Voy pidiendo taxi??',
      'Entonces vamos ya a por los churros no?',
      'Deja de beber rebujito',
      'Te dije que mezclar es malo'
    ];
    const randomNumber = Math.floor((Math.random() * mensajesGameOver.length - 1) + 1);

    const snackBarRef = this.snackBar.open(mensajesGameOver[randomNumber], 'Pal real de nuevo', {
      duration: SNACKBAR_DURATION
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
        this.board[x][y] = "-";
        this.baseboard[x][y] = "-";
      }
    }

    // console.log("board[0][0]= " + this.board[0][0]);
    // console.log("board[" + (BOARD_SIZE_COLS-1) + "][0]= " + this.board[BOARD_SIZE_COLS-1][0]);

    this.setBordes();
    this.setCasetas();
    this.setPortada();
    //this.setSection(PORTADA, "p");
    this.setEnemy();
    //this.setTestScenario();
    this.updateEnemy();
  }

  setBordes () : void {
    let i = 0;
    let j = 0;
    for (i = 0; i< BOARD_SIZE_ROWS; i++) { 
      this.board[i][0] = "w";
      this.board[i][BOARD_SIZE_COLS-1] = "w";
      this.baseboard[i][0] = "w";
      this.baseboard[i][BOARD_SIZE_COLS-1] = "w";
    }
    for (j = 0; j< BOARD_SIZE_COLS; j++) { 
      this.board[0][j] = "w";
      this.board[BOARD_SIZE_ROWS-1][j] = "w";
      this.baseboard[0][j] = "w";
      this.baseboard[BOARD_SIZE_ROWS-1][j] = "w";
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
          if (this.board[x][y] != mode && !this.isCaseta(x,y)) {
            this.board[x][y] = mode;
            this.baseboard[x][y] = mode;
            filled += 1;
          }
        } else return filled;
      }
    }
    return filled;

  }

  // Sets the portada
  setPortada() : void {

    let baseX = PORTADA_X;
    let baseY = PORTADA_Y;
    
    for (let x = 0; x<4; x++) {
      for (let y = 0; y<6; y++) {
        this.board[baseX-x][baseY+y] = "p" + x.toString() + y.toString();
        this.baseboard[baseX-x][baseY+y] = "p" + x.toString() + y.toString();
      }
    }

    this.board[baseX-4][baseY+2] = "p42";
    this.baseboard[baseX-4][baseY+2] = "p42";
    this.board[baseX-4][baseY+3] = "p43";
    this.baseboard[baseX-4][baseY+3] = "p43";
}

  // Sets the casetas by blocks, drawing only the borders.
  setCasetas() : void {

    // For each caseta block in the array
    for (let c=0; c<CASETAS.length; c++ ) {

      // We fill, by default, the caseta section with plain obstacles.
      let part = CASETAS[c];
      let upleftX = part[0];
      let upleftY = part[1];
      let width = part[2]*2;
      let height = part[3]*2;
      this.fillChunk(upleftX, upleftY, width, height, "o", -1);
      
      let casetaxsize = 2;
      let casetaysize = 2;

      let caseta = CASETAS[c];
      let inix = caseta[0];
      let iniy = caseta[1];
      let rows = caseta[2];
      let cols = caseta[3];

      // Bordes verticales, determinados por las filas
      for (let x=0; x<rows; x++) {

        for (let xs=0; xs<casetaxsize; xs++){
          for (let ys=0; ys<casetaysize; ys++){
            
            // Borde izquierdo
            let borde_izquierdo_x = inix + x*casetaxsize + xs;
            let borde_izquierdo_y = iniy + ys;
            this.board[borde_izquierdo_x][borde_izquierdo_y] = "c" + xs.toString() + ys.toString();
            this.baseboard[borde_izquierdo_x][borde_izquierdo_y] = "c" + xs.toString() + ys.toString();
            
            // Borde derecho
            let borde_derecho_x = inix + x*casetaxsize + xs;
            let borde_derecho_y = iniy + (cols-1)*casetaysize + ys;
            this.board[borde_derecho_x][borde_derecho_y] = "c" + xs.toString() + ys.toString();
            this.baseboard[borde_derecho_x][borde_derecho_y] = "c" + xs.toString() + ys.toString();
          }
        }
      }

      // Bordes horizontales
      for (let y=0; y<cols; y++) {
        for (let xs=0; xs<casetaxsize; xs++){
          for (let ys=0; ys<casetaysize; ys++){

            // Borde superior
            let borde_superior_x = inix + xs;
            let borde_superior_y = iniy + y*casetaysize + ys;
            this.board[borde_superior_x][borde_superior_y] = "c" + xs.toString() + ys.toString();
            this.baseboard[borde_superior_x][borde_superior_y] = "c" + xs.toString() + ys.toString();

            // Borde inferior
            let borde_inferior_x = inix + (rows-1)*casetaxsize + xs;
            let borde_inferior_y = iniy + y*casetaysize + ys;
            this.board[borde_inferior_x][borde_inferior_y] = "c" + xs.toString() + ys.toString();
            this.baseboard[borde_inferior_x][borde_inferior_y] = "c" + xs.toString() + ys.toString();
      }
    }
  }

    }

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
    this.tempDirection = CONTROLS.UP;
    this.isGameOver = false;
    this.interval = 500;
    this.snake = {
      direction: CONTROLS.UP,
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
    let snakeX = INITIAL_POSITION.gitana.x;
    let snakeY = INITIAL_POSITION.gitana.y;
    this.snake.parts.push({x : snakeX, y: snakeY });
    this.board[snakeX][snakeY] = "h";
    this.viewport.x = INITIAL_POSITION.viewport.x;
    this.viewport.y = INITIAL_POSITION.viewport.y;
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
    var cvContainer = <HTMLDivElement>document.getElementsByName('canvasContainer')[0];
    var cvMap = <HTMLCanvasElement>document.getElementsByName('canvasMap')[0];
    var cvHead = <HTMLCanvasElement>document.getElementsByName('canvasHead')[0];
    var cvViewport = <HTMLCanvasElement>document.getElementsByName('canvasViewport')[0];
    cvMap.width  = BOARD_SIZE_COLS*RATIO_MAP;
    cvMap.height = BOARD_SIZE_ROWS*RATIO_MAP;
    cvViewport.width  = BOARD_SIZE_COLS*RATIO_MAP;
    cvViewport.height = BOARD_SIZE_ROWS*RATIO_MAP;
    cvHead.width  = BOARD_SIZE_COLS*RATIO_MAP;
    cvHead.height = BOARD_SIZE_ROWS*RATIO_MAP;
    this.drawMiniMap();
    this.drawViewport();
    this.setInitialSnake();
  }

  drawMiniMap() : void {
    this.ctxMap = this.canvasMap.nativeElement.getContext('2d');
    this.ctxHead = this.canvasHead.nativeElement.getContext('2d');
    this.ctxViewport = this.canvasViewport.nativeElement.getContext('2d');
    //this.drawSection(CASETAS,"black");
    this.drawCasetas();
    this.drawPortada();
    this.drawBorder();
  }

  drawBorder () : void {
    this.ctxMap.fillStyle = "black";
    this.ctxMap.strokeRect(0, 0, BOARD_SIZE_COLS*RATIO_MAP, BOARD_SIZE_ROWS*RATIO_MAP);
  }

  drawViewport () : void {
    this.clearViewport();
    this.ctxViewport.fillStyle = "grey";
    this.ctxViewport.strokeRect(this.viewport.y*RATIO_MAP, this.viewport.x*RATIO_MAP, this.viewport.width*RATIO_MAP, this.viewport.height*RATIO_MAP);
  }

  drawHead (newHead:any) : void {
    this.clearHead();
    this.ctxHead.fillStyle = "red";
    this.ctxHead.fillRect(newHead.y*RATIO_MAP, newHead.x*RATIO_MAP, 3, 3);
  }

  clearViewport () : void {
    this.ctxViewport.clearRect(0,0,BOARD_SIZE_COLS*RATIO_MAP,BOARD_SIZE_ROWS*RATIO_MAP);
  }

  clearHead () : void {
    this.ctxHead.clearRect(0,0,BOARD_SIZE_COLS*RATIO_MAP,BOARD_SIZE_ROWS*RATIO_MAP);
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
      this.ctxMap.fillRect(upleftY*RATIO_MAP, upleftX*RATIO_MAP, height*RATIO_MAP, width*RATIO_MAP);
      }

  }

  drawCasetas () : void {

    let ratioMap = 2;
    let casetaxsize = 2;
    let casetaysize = 2;

    let c = 0;
    let upleftX = 0;
    let upleftY = 0;
    let width = 0;
    let height = 0;

    // For each caseta
    for (let c=0; c<CASETAS.length; c++) {
      let caseta = CASETAS[c];
      upleftX = caseta[0];
      upleftY = caseta[1];
      width = caseta[2]*casetaxsize;
      height = caseta[3]*casetaysize;
      this.ctxMap.fillStyle = "black";
      this.ctxMap.fillRect(upleftY*RATIO_MAP, upleftX*RATIO_MAP, height*RATIO_MAP, width*RATIO_MAP);
    }
    

  }



  drawPortada () : void {

    let ratioMap = 2;

    let c = 0;
    let upleftX = PORTADA_X-4;
    let upleftY = PORTADA_Y;
    let width = 4;
    let height = 6;

    this.ctxMap.fillStyle = "green";
    this.ctxMap.fillRect(upleftY*RATIO_MAP, upleftX*RATIO_MAP, height*RATIO_MAP, width*RATIO_MAP);

  }

  animate(): void {}

}