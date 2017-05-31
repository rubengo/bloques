/* Variables globales */ 

// Variables para definir el Canvas.
var canvas;
var ctx;

// Tama�o del canvas
var WIDTH = 600; 
var HEIGHT = 520; 

// Variables para controlar la posici�n de la pelota.
var x;
var y;

// Variables para controlar la direcci�n de la pelota.
var dx;
var dy;
  
// Variables para controlar la posici�n de la paleta
var paddleX;
var paddleY;

// Variables para controlar el nivel de juego en que se encuentra el jugador.
localStorage.setItem('level', 1);
var level = localStorage.getItem('level');

// variable para resetear inicio del movimiento de l apaleta
var intervalId;

var bloquesCount = 0;

var points = 0;

var pausa = false;
var pausaBtn = $('#pausa');

// Variables per a reproducir el audio. No estan definidas porqu� en funci�n de la soluci�n aportada pueden hacer falta m�s o menos variables.
// ...

loadData();

$('#start').on('click', function(e) {
  $('.perdiste').removeClass('show');
  clearInterval(intervalId);
  init_game();
  pausa = false;
  pausaBtn.html('Pausa');
})

pausaBtn.on('click', function(e) {
  pausa = !pausa;
  if (pausa) {
    clearInterval(intervalId);
    pausaBtn.html('Continua');
  }
  else {
    pausaBtn.html('Pausa');
    intervalId = setInterval(draw, interval);
  }
})

$(document).on('keydown', function(e){
  if (e.keyCode == 37 && paddleX !== 0){	// Flecha izquierda del teclado.
    paddleX -= 15;
  }

  if (e.keyCode == 39 && paddleX !== 510){	// Flecha derecha del teclado.
    paddleX += 15;
  }

});

/* 
Dibujamos un recuadro.
Cada recuadro tiene las variables de color, la posici�n x, y inicial en el canvas y la anchura y altura del recuadro.
Esta es una funci�n auxiliar utilizada para dibujar la paleta y que puede ser utilizada tambi�n para dibujar los recuadros de un nivel.
*/
function square(color, x, y, width, height) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

// Funci�n para dibujar la redonda.
function circle(x,y,r) {
  ctx.beginPath();
  ctx.fillStyle="#F80";
  ctx.arc(x, y, r, 0, Math.PI*2, true);
  ctx.fill();
}


/*
Esta funci�n verifica que el juego ha llegado al final de una partida.
En esta funci�n pueden pasar diferentes ccosas:
  1. Que el usuario pierda la partida porqu� la pelota toque el fondo del canvas.
  2. que el usuario haya tocado todas las pelotas:
    2a. Si nos encontramos el primer nivel de la partida se ha de tener presente que tenemos que pasar al segundo nivel.
    2b. Se ha acabo el juego. Se ha de mostrar al usuario el mensaje de finalizaci�n del juego.
*/
function end_of_game(){
  if (y > 500) {
    clearInterval(intervalId);
    $('.mensaje').html('Perdiste!');
    $('.mensaje').addClass('show');
  }
}
/*	
En esta funcion se tienen que dibujar los recuadros que forman parte de un nivel.
El nivel a mostrar se pasa com par�metro de la funci�n.
Para dibujar cada uno de los recuadros se puede utilizar la funci� auxiliar "square" utilizada tambi�n para dibujar la paleta.
*/
function draw_level(level) {
  if (level == 1) active_level = squares_level1;
  if (level == 2) active_level = squares_level2;

  var N = active_level.length;
  for (i=0; i<N ; i++){
    if (active_level[i].active){
      //Dibujamos solo los cuadros que están activos.
      square(active_level[i].color, active_level[i].x, active_level[i].y, active_level[i].w, active_level[i].h);
      bloquesCount++;
    }
  }
}

function ball_touch_wall () {
  // cuando la bola toca la pared derecha
  if (x === 600) {
    dx = -5;
  }
  // cuando la bola toca la pared izquierda
  if (x === 0) {
    dx = 5;
  }
  // cuando la bola toca el fondo
  if (y === 520) {
    //perdio
  }
  // cuando la bola toca el techo
  if (y === 0) {
    dy = 5;
  }
}

/*  	
En esta funci�n se tiene que verificar si la pelota est� tocando alguno de los recuadros.
En caso de que la pelota toque alguno de los recuadros, se debe tener presente que le recuadro no se tiene que volver a pintar
por pantalla hasta que no se vuellva a iniciar una aprtida.
Se debe tener en cuenta el nivel ( 1 o 2 ) en que esta jugando el jugador.
*/
function ball_touch_square (level) {
  if (level == 1) active_level = squares_level1;
  if (level == 2) active_level = squares_level2;

  var N = active_level.length;
  for (i=0; i<N ; i++) {
    var s = active_level[i];
    if (s.active) {
      var topX = parseInt(s.x);
      var bottomX = parseInt(s.x) + parseInt(s.w);
      var topY = parseInt(s.y);
      var bottomY = parseInt(s.y) + parseInt(s.h);
      // Aquí toca un cuadro 
      if (x >= topX && x <= bottomX && y >= topY && y <= bottomY) {
        s.active = false;
        dy = 5;
        bloquesCount--;
        points += (level * 100);
      }
    }
  }
  if (bloquesCount === 0 && level === 1) {
    clearInterval(intervalId);
    localStorage.setItem('level', 2);
    // resetBloques();
    intervalId = setInterval(draw, interval);
  }
  else if (bloquesCount === 0 && level === 2) {
    setTimeout(function () {
      clearInterval(intervalId);
    }, 200);
    $('.mensaje').html('Ganaste!');
    $('.mensaje').addClass('show');
  }
  $('.points').html(points);
}

/*	
En esta funci�n se dee detectar si la pelota colisiona con la paleta y que se tiene que hacer en este caso.
  � Qu� direcci�n tomar� la pelota?
  � Se debe emitir algun sonido?
*/
function ball_touch_paddle () {
  // posición de la paleta -> paddleX
  // posición de la bola -> x , y
  if (x >= paddleX && x <= (paddleX + 90) && y === 490) {
    dy = -5;
  }
}

// Limpiamos el Canvas antes de dibujarlo de nuevo.
function clear() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function draw () {
  var lvl = parseInt(localStorage.getItem('level'));
  soundEfx = document.getElementById("soundEfx");
    
  // Limpiamos el Canvas antes de dibujarlo de nuevo.
  clear();
  
  bloquesCount = 0;

  // Dibujamos los recuadros de un nivel.
  draw_level(lvl);

  // Dibujamos la pelota con un tama�o de 10 px.
  circle(x, y, 10);

  ball_touch_wall();

  // En esta oarte controlamos si la pelota ha tocado la paleta, y por tanto si ha de cambiar de posici�n o no.
  ball_touch_paddle();

  /*
    Ahora controlamos si la pelota ha tocado cualquiera de los cuadros.
    En caso de que la pelota toque uno de los cuadros, el cuadro dejar� de mostrarse y se deber� actualizar su estado.
  */
  ball_touch_square(lvl);
      
  // Verificamos si la pelota ha tocado la pala.
  // ball_touch_padddle();
    
  // Verificamos la condici�n de finalizaci�n de la partida, es decir, que la pelota llegue al fondo del rect�ngulo del canvas o que se hayan tocados todos ls cuadros.
  end_game = end_of_game();

  //Se avanza la posici�n
  x += dx;
  y += dy;

  // Dinujamos la paleta. Utilizamos la funci�n auxiliar square.
  square("#333", paddleX, paddleY, 90, 30 );	

}	
/*
Funci�n para inicializar el juego.
Esta funci�n puede ser modificada cuando se a�adan los controles para inicializar y pausar el juego.
*/
function init_game () {
  var lvl = parseInt(localStorage.getItem('level'));
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d"); //Siempre requerida
  interval = 15;

  // Posici�n inicial de la pelota.
  x = 300;
  y = 500;

  // Velocidad de desplazamiento de la pelota
  dx = 5;
  dy = -5;

  // Posici�n inicial de la paleta.
  paddleX = 300;
  paddleY = 500;

  resetBloques();

  // Pintamos el Canvas.
  draw(lvl);

  // Cremoas un invertablo para dibujar el canvas cada 15 milisegundos ( que es periodo defenido para el intervalo ).
  intervalId = setInterval(draw, interval);

}

function resetBloques () {
  var lvl = parseInt(localStorage.getItem('level'));
  if (lvl == 1) active_level = squares_level1;
  if (lvl == 2) active_level = squares_level2;

  var N = active_level.length;
  for (i=0; i<N ; i++) {
    active_level[i].active = true;
  }
}

function loadData () {
  $.ajax({
    type: 'GET',
    url: "http://camisetas24h.com/PRA2/levels_cross.php",
    dataType: "jsonp",
    success: function (data){
      squares_level1 = data[0]; // First Level
      squares_level2 = data[1]; // Second Level
    },
    error:function (xhr, ajaxOptions, thrownError){
      console.alert(xhr.status);
      console.alert(thrownError);
    }
  });
}