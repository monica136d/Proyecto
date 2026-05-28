// reserva-exito.js
// muestra el mensaje de "reserva ok" en reservar.html cuando el php redirige con ?reserva=ok
// si vienen comensales y mesas en la URL los enseña tambien

var TOAST_MS_EXITO = 5000; // 5 segundos visible el mensaje

document.addEventListener("DOMContentLoaded", function () {
  // cogemos los parametros de la URL
  var params = new URLSearchParams(window.location.search);
  // si no venimos de una reserva correcta no hacemos nada
  if (params.get("reserva") !== "ok") return;
  var comensales = params.get("comensales");
  var mesas = params.get("mesas");

  // mensaje por defecto, si tenemos los datos lo hacemos mas completo
  var mensaje = "¡Reserva realizada con éxito!";
  if (comensales && mesas) {
    mensaje = "Reserva confirmada para " + comensales + " personas. Mesas asignadas: " + mesas + ".";
  }

  // creamos el div del mensaje y lo metemos en la pagina
  var el = document.createElement("div");
  el.className = "toast-reserva";
  el.textContent = mensaje;
  el.style.setProperty("--toast-duration", TOAST_MS_EXITO + "ms");
  el.classList.add("toast-reserva--countdown");
  document.body.appendChild(el);

  // pequeña pausa para que entre con animacion (lo probamos sin pausa y aparecia de golpe)
  setTimeout(function () {
    el.classList.add("toast-reserva--visible");
  }, 100);

  // a los 5 segundos lo escondemos
  setTimeout(function () {
    el.classList.remove("toast-reserva--visible");
  }, TOAST_MS_EXITO + 100);

  // limpiamos la URL para que si recarga no se vea otra vez el mensaje
  window.history.replaceState({}, document.title, "reservar.html");
});
