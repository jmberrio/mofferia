export const BOARD_SIZE_COLS = 350; // Width --> Controls Y axix
export const BOARD_SIZE_ROWS = 125; // Height --> Controls X axis
export const BOARD_VP_WIDTH = 25; // Width --> Controls Y axix
export const BOARD_VP_HEIGHT = 20; // Height --> Controls X axis
export const BOARD_VP_THRESHOLD = 5; 
export const MAX_ENEMIES = 15;
export const MAX_PIECES = 10;
export const MOVE_MANUAL = true;
export const SNAKE_SPEED = 100;
export const MINIMUM_SCORE_TO_LIGHT = 10;
export const CONST_LIVES = 3;
export const MAX_TIME = 300;
export const TIME_LOST_PER_FAIL = 30;
export const INITIAL_FRUITS = 30;

export const CONTROLS = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40
};

export const MOVEMENTS = {
  STOP: 0,
  MOVE: 1
};

export const COLORS = {

  GAME_OVER: '#D24D57',
  ENEMY: '#D24D57',
  GAME_WON: '#B2AD57',
  FRUIT: '#DDF124',
  HEAD: '#336E7B',
  BODY: '#DDF124',
  BOARD: '#86B5BD',
  OBSTACLE: '#383522',
  PORTADA: '#385522',
  BOMBILLA: '#DDF124'
};

export const PORTADA = [
  [105,51,10,3], [105,57,10,1], [105,61,10,1], [105,65,10,1], [105,69,10,1], [105,73,10,3], // Columnas
  [107,52,1,22], // Barra
  [105,57,3,13] // Cupula
]

export const CASETAS = [
  // Seccion izquierda
  [10,10,60,10], [85,10,25,30], [75,40,35,5], [35, 30, 15, 5], [60,30,25,10], [10,30,10,5], 
  // Sección derecha
  [10,65,5,225], [15,60,5,230],
  [30,65,10,20], [30,110,10,30], [30,160,10,30], [30,210,10,30], [30,260,10,30],
  [50,70,10,15], [50,110,10,30], [50,160,10,30], [50,210,10,30], [50,260,10,30],
  [70,75,10,10], [70,110,10,30], [70,160,10,30], [70,210,10,30], [70,260,10,30],
  [90,80,15,60], [90,160,10,30], [90,210,5,30],
  // Calle del infierno
  [10, 320, 80, 15]
]

export const CASETAIMG = [
  [10, 20]
];