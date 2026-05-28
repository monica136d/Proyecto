// reserva-menus.js
// crea un select de menu por cada comensal en reservar.html
// si pone 4 comensales, crea 4 selects (uno para cada uno)
// la lista de menus se pide al php listar_menu.php

var contenedorMenusComensal;
var listaMenus = []; // lista de menus que llega del php (id y nombre)

// crea n selects de menu, uno por cada comensal
function crearSelectsMenu(n) {
  // borramos los que hubiera para no duplicar
  contenedorMenusComensal.innerHTML = "";
  for (var i = 0; i < n; i++) {
    // contenedor de cada fila (label + select)
    var wrap = document.createElement("div");
    wrap.className = "form-grupo";

    var lab = document.createElement("label");
    lab.textContent = "Comensal " + (i + 1);

    // select de menu para este comensal
    var sel = document.createElement("select");
    sel.name = "menus[]"; // los corchetes son para que el php lo coja como array
    sel.required = true;

    // primera opcion vacia con "Elige menu" para que tenga que elegir
    var opt0 = document.createElement("option");
    opt0.value = "";
    opt0.disabled = true;
    opt0.selected = true;
    opt0.textContent = "Elige menú";
    sel.appendChild(opt0);

    // metemos cada menu como una option del select
    for (var m = 0; m < listaMenus.length; m++) {
      var op = document.createElement("option");
      op.value = String(listaMenus[m].Id_Menu);
      op.textContent = listaMenus[m].Nombre;
      sel.appendChild(op);
    }

    wrap.appendChild(lab);
    wrap.appendChild(sel);
    contenedorMenusComensal.appendChild(wrap);
  }
}

// cuando el usuario cambia el numero de comensales redibujamos los selects
function actualizarSelectsMenu() {
  var com = document.getElementById("comensales");
  if (!com || !contenedorMenusComensal) return;
  var n = parseInt(com.value, 10);
  // si no es un numero valido borramos todo
  if (isNaN(n) || n < 1) {
    contenedorMenusComensal.innerHTML = "";
    return;
  }
  crearSelectsMenu(n);
}

document.addEventListener("DOMContentLoaded", function () {
  contenedorMenusComensal = document.getElementById("menus-por-comensal");
  if (!contenedorMenusComensal) return;

  // pedimos al php todos los menus disponibles
  fetch("../php/listar_menu.php")
    .then(function (r) {
      if (!r.ok) throw new Error("red");
      return r.json();
    })
    .then(function (data) {
      listaMenus = data;
      // dibujamos los selects con los comensales que hay puestos
      actualizarSelectsMenu();
      // y nos enganchamos al cambio del select de comensales
      var com = document.getElementById("comensales");
      if (com) com.addEventListener("change", actualizarSelectsMenu);
    })
    .catch(function () {
      contenedorMenusComensal.textContent = "No se pudieron cargar los menús.";
    });
});
