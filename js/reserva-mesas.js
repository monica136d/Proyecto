// reserva-mesas.js
// rellena el select de mesas libres en reservar.html
// segun la fecha, la hora y el numero de comensales le pide al php las mesas que valen
// si la mesa elegida sola no llega para todos avisa de que se va a juntar con otra

// guardamos los elementos del html para no buscarlos cada vez (mas rapido)
var fechaElMesas = null;
var horaElMesas  = null;
var mesaElMesas  = null;
var comensalesElMesas = null;
var resumenElMesas = null;

// pone un texto en el bloque de resumen (debajo del select)
function limpiarResumenMesas(texto) {
  if (!resumenElMesas) return;
  resumenElMesas.textContent = texto || "Selecciona comensales, fecha y hora para ver la asignación estimada.";
}

// cuando el usuario elige una mesa miramos si necesita una segunda
function actualizarResumenDesdeSeleccion() {
  if (!resumenElMesas || !mesaElMesas) return;
  var op = mesaElMesas.options[mesaElMesas.selectedIndex];
  if (!op || !op.value) {
    limpiarResumenMesas();
    return;
  }
  // este dataset.segundaMesa lo guardamos cuando creamos la option
  if (op.dataset.segundaMesa === "1") {
    resumenElMesas.textContent = "Asignación estimada: 2 mesas completas (mesa principal + segunda mesa automática).";
  } else {
    resumenElMesas.textContent = "Asignación estimada: 1 mesa completa.";
  }
}

// pide al php las mesas libres y rellena el select
function cargarMesasReserva() {
  var fecha = fechaElMesas.value;
  var hora  = horaElMesas.value;
  var comensales = comensalesElMesas && comensalesElMesas.value ? parseInt(comensalesElMesas.value, 10) : 0;

  // si todavia no han elegido fecha y hora no podemos buscar mesas
  if (!fecha || !hora) {
    mesaElMesas.innerHTML = '<option value="" disabled selected>Primero elige fecha y hora</option>';
    limpiarResumenMesas();
    return;
  }

  // mientras carga ponemos un mensaje para que se vea que esta haciendo algo
  mesaElMesas.innerHTML = '<option value="" disabled selected>Cargando mesas…</option>';

  // pedimos las mesas libres al php
  fetch(
    "../php/mesas_disponibles.php?fecha=" + encodeURIComponent(fecha) +
    "&hora=" + encodeURIComponent(hora) +
    "&comensales=" + encodeURIComponent(comensales || 0)
  )
    .then(function (r) {
      if (!r.ok) throw new Error("error");
      return r.json();
    })
    .then(function (data) {
      mesaElMesas.innerHTML = "";

      // si no hay mesas avisamos al usuario
      if (!data.ok || !data.mesas || data.mesas.length === 0) {
        mesaElMesas.innerHTML =
          '<option value="" disabled selected>No hay mesas libres para esa fecha y hora</option>';
        limpiarResumenMesas("No hay combinación de mesas disponible para esa fecha y hora.");
        return;
      }

      // creamos una option por cada mesa libre
      mesaElMesas.innerHTML = '<option value="" disabled selected>Selecciona mesa</option>';
      data.mesas.forEach(function (m) {
        var op = document.createElement("option");
        op.value = m.Id_Mesa;
        var txt = "Mesa " + m.Numero_Mesa + " — capacidad " + m.Capacidad + " personas";
        if (m.Requiere_Segunda_Mesa) {
          txt += " (con segunda mesa automática)";
        }
        // guardamos en data-* si necesita segunda mesa para usarlo despues
        op.dataset.segundaMesa = m.Requiere_Segunda_Mesa ? "1" : "0";
        op.textContent = txt;
        mesaElMesas.appendChild(op);
      });
      limpiarResumenMesas("Selecciona una mesa principal para ver el tipo de asignación.");
    })
    .catch(function () {
      // si peta la peticion mostramos un mensaje en el select
      mesaElMesas.innerHTML =
        '<option value="" disabled selected>Error al cargar mesas</option>';
      limpiarResumenMesas("No se pudo calcular la asignación de mesas.");
    });
}

document.addEventListener("DOMContentLoaded", function () {
  // cogemos los elementos del html
  fechaElMesas = document.getElementById("fecha");
  horaElMesas  = document.getElementById("hora");
  mesaElMesas  = document.getElementById("id_mesa");
  comensalesElMesas = document.getElementById("comensales");
  resumenElMesas = document.getElementById("resumen-mesas");

  // si falta alguno no estamos en la pagina de reservar, salimos
  if (!fechaElMesas || !horaElMesas || !mesaElMesas || !comensalesElMesas) return;

  // cuando el usuario cambia fecha, hora o comensales volvemos a pedir las mesas
  fechaElMesas.addEventListener("change", cargarMesasReserva);
  horaElMesas.addEventListener("change",  cargarMesasReserva);
  comensalesElMesas.addEventListener("change", cargarMesasReserva);
  // cuando elige una mesa actualizamos el resumen
  mesaElMesas.addEventListener("change", actualizarResumenDesdeSeleccion);
});
