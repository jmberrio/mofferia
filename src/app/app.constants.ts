export const BOARD_SIZE_COLS = 100; // Width --> Controls Y axix
export const BOARD_SIZE_ROWS = 50; // Height --> Controls X axis
export const BOARD_VP_WIDTH = 50; // Width --> Controls Y axix
export const BOARD_VP_HEIGHT = 25; // Height --> Controls X axis
export const MAX_ENEMIES = 5;
export const MAX_PIECES = 5;
export const MOVE_MANUAL = true;
export const SNAKE_SPEED = 100;
export const MINIMUM_SCORE_TO_LIGHT = 5;
export const CONST_LIVES = 3;
export const MAX_TIME = 300;
export const TIME_LOST_PER_FAIL = 30;

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
  [20,5,5,2]
]

export const CASETAS = [
  [10,10,5,10], [10,40,5,10], [10,70,5,10], [10,100,5,10], [10,130,5,10], [10,160,5,10],
  [30,10,5,10], [30,40,5,10], [30,70,5,10], [30,100,5,10], [30,130,5,10], [30,160,5,10],
  [50,10,5,10], [50,40,5,10], [50,70,5,10], [50,100,5,10], [50,130,5,10], [50,160,5,10],
  [70,10,5,10], [70,40,5,10], [70,70,5,10], [70,100,5,10], [70,130,5,10], [70,160,5,10]
]
