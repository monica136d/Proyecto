// reserva-validacion.js
// antes de mandar el formulario de reservar comprobamos:
//   1. que el usuario tenga sesion abierta (sino le mandamos al registro)
//   2. que la fecha sea de jueves a domingo (el restaurante no abre el resto)
// la validacion fuerte la hace tambien el php por seguridad, esto es para mejor UX

var URL_SESION   = "../php/comprobar_sesion.php";
var URL_REGISTRO = "../html/register.html";
var MSG_NO_LOGIN = "Para confirmar tu mesa, por favor inicia sesión o regístrate. Redirigiendo...";
var TOAST_MS_VALIDACION = 5000;

// crea el div del toast si no existe (asi no metemos uno por cada submit)
function asegurarToastValidacion() {
  var el = document.getElementById("toast-reserva");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast-reserva";
    el.className = "toast-reserva";
    document.body.appendChild(el);
  }
  return el;
}

// muestra un mensaje en pantalla durante unos segundos
function mostrarToastValidacion(texto) {
  var el = asegurarToastValidacion();
  el.textContent = texto;
  el.style.setProperty("--toast-duration", TOAST_MS_VALIDACION + "ms");
  el.classList.remove("toast-reserva--countdown");
  // este truco (void offsetWidth) reinicia la animacion CSS, lo vimos en stackoverflow
  void el.offsetWidth;
  el.classList.add("toast-reserva--countdown");
  el.classList.add("toast-reserva--visible");
  // si pulsa otra vez antes de que se vaya el anterior, cancelamos el timeout viejo
  window.clearTimeout(el._ocultar);
  el._ocultar = window.setTimeout(function () {
    el.classList.remove("toast-reserva--visible");
  }, TOAST_MS_VALIDACION);
}

// devuelve true si el dia de la fecha es jueves, viernes, sabado o domingo
function esDiaReservaPermitido(fechaISO) {
  if (!fechaISO) return false;
  var d = new Date(fechaISO + "T00:00:00");
  if (Number.isNaN(d.getTime())) return false;
  var dia = d.getDay(); // 0 = domingo, 1 = lunes, ... 6 = sabado
  // dejamos jueves(4), viernes(5), sabado(6) y domingo(0)
  return dia === 4 || dia === 5 || dia === 6 || dia === 0;
}

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("reservaForm");
  if (!form) return;

  form.addEventListener("submit", function (ev) {
    // paramos el submit normal para validar antes
    ev.preventDefault();

    // preguntamos al php si hay sesion
    fetch(URL_SESION)
      .then(function (res) {
        if (!res.ok) throw new Error("error red");
        return res.json();
      })
      .then(function (data) {
        if (data && data.loggedIn) {
          // si esta logueado, miramos que la fecha sea de jue a dom
          var fecha = (form.elements.fecha && form.elements.fecha.value) ? form.elements.fecha.value : "";
          if (!esDiaReservaPermitido(fecha)) {
            mostrarToastValidacion("Solo se aceptan reservas de jueves a domingo.");
            return;
          }
          // todo bien, mandamos el formulario al php "a mano"
          // (usamos prototype.submit para que no vuelva a pasar por este listener)
          HTMLFormElement.prototype.submit.call(form);
        } else {
          // si no esta logueado, avisamos y le mandamos al registro
          mostrarToastValidacion(MSG_NO_LOGIN);
          // esperamos 5 segundos para que le de tiempo a leer el mensaje
          window.setTimeout(function () {
            window.location.href = URL_REGISTRO;
          }, 5000);
        }
      })
      .catch(function () {
        // si falla la peticion al php (sin internet o lo que sea)
        mostrarToastValidacion(
          "No se pudo comprobar tu sesión. Recarga la página e inténtalo de nuevo."
        );
      });
  });
});
