// login-toast-registro.js
// muestra un mensaje (toast) en login.html cuando el usuario acaba de registrarse
// register.php redirige aqui con ?registro=ok y este script lo detecta

document.addEventListener('DOMContentLoaded', function () {
  var TOAST_MS = 5000; // 5 segundos visible

  // miramos los parametros de la URL
  var params = new URLSearchParams(window.location.search);
  // si no venimos del registro no hacemos nada
  if (params.get('registro') !== 'ok') return;

  // creamos el div del mensaje
  var t = document.createElement('div');
  t.className = 'toast-reserva';
  t.textContent = '¡Registro completado! Inicia sesión para hacer tu reserva.';
  t.style.setProperty('--toast-duration', TOAST_MS + 'ms');
  t.classList.add('toast-reserva--countdown');
  document.body.appendChild(t);

  // pequeña espera para que se note la animacion de entrada (sino aparece de golpe)
  setTimeout(function () {
    t.classList.add('toast-reserva--visible');
  }, 100);

  // lo escondemos despues de los 5 segundos
  setTimeout(function () {
    t.classList.remove('toast-reserva--visible');
  }, TOAST_MS + 100);

  // limpiamos el ?registro=ok de la URL para que si recarga no salga otra vez
  window.history.replaceState({}, document.title, 'login.html');
});
