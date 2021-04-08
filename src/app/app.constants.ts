export const BOARD_SIZE_COLS = 160; // Width --> Controls Y axix
export const BOARD_SIZE_ROWS = 65; // Height --> Controls X axis
export const BOARD_VP_WIDTH = 22; // Width --> Controls Y axix
export const BOARD_VP_HEIGHT = 15; // Height --> Controls X axis
export const BOARD_VP_THRESHOLD = 4; 
export const MAX_ENEMIES = 15;
export const MAX_PIECES = 10;
export const MOVE_MANUAL = true;
export const SNAKE_SPEED = 200;
export const MINIMUM_SCORE_TO_LIGHT = 10;
export const CONST_LIVES = 3;
export const MAX_TIME = 300;
export const TIME_LOST_PER_FAIL = 30;
export const INITIAL_FRUITS = 30;
export const INITIAL_POSITION = {
  gitana: {
    x: 5,
    y: 5
  },
  viewport: {
    x: 1,
    y: 1
  }
}

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

export const CODIGOS_CASETA = ["c00","c01","c10","c11"];

export const PORTADA = [
  [50,23,9,1], [55,27,3,1], [55,31,3,1], [50,35,9,1], // Columnas
  [54,23,1,12], [52,23,1,12], // Barras
  [50,23,1,2], [50,34,1,2] // Banderas
]

/* CASETAS PARA RELLENAR EN BLOQUE */
/*
export const CASETAS = [
  // Seccion izquierda
  [7,7,30,5], [40,5,12,15], [30,20,15,3], [16, 15, 9, 3], [30,15,12,5], [5,15,21,3], 
  // Sección derecha
  [5,30,3,99], [7,30,3,99],
  [15,30,6,9], [15,50,6,15], [15,80,6,15], [15,110,6,15], 
  [25,35,6,9], [25,50,6,15], [25,80,6,15], [25,110,6,15], 
  [35,35,6,6], [35,50,6,15], [35,80,6,15], [35,110,6,15], 
  [45,40,6,30], [45,80,6,16], [45,105,3,15],
  // Calle del infierno
  [10, 140, 39, 9]
]
*/

/* CASETAS PARA RELLENAR CON IMAGENES */
export const CASETAS = [
  // Seccion izquierda
  [7,7,15,3], [40,5,6,8], [30,20,7,2], [16, 15, 5, 2], [30,15,6,3], [5,15,10,2], 
  // Sección derecha
  [5,30,2,50], [7,30,2,50],
  [15,30,3,5], [15,50,3,8], [15,80,3,8], [15,110,3,8], 
  [25,35,3,5], [25,50,3,8], [25,80,3,8], [25,110,3,8], 
  [35,35,3,3], [35,50,3,8], [35,80,3,8], [35,110,3,8], 
  [45,40,3,15], [45,80,3,8], [45,105,1,8],
  // Calle del infierno
  [10, 140, 20, 5]
]

export const CASETAIMG = [
  [10, 20]
];