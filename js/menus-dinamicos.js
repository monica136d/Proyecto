// menus-dinamicos.js
// dibuja las cards de los menus en menus.html
// pide los datos al php listar_menu_cards.php y por cada menu crea una card
// si pulsas la card te lleva a menu-detalle.html?id=N

document.addEventListener("DOMContentLoaded", function () {
  // el contenedor donde van todas las cards
  var cont = document.getElementById("menu-estaciones-dinamico");
  if (!cont) return;

  // pedimos todos los menus al php
  fetch("../php/listar_menu_cards.php")
    .then(function (r) { if (!r.ok) throw new Error("red"); return r.json(); })
    .then(function (menus) {
      // borramos lo que hubiera para no duplicar
      cont.innerHTML = "";

      // recorremos los menus que llegan y vamos creando cards
      menus.forEach(function (m) {
        var a = document.createElement("a");
        a.href = "menu-detalle.html?id=" + encodeURIComponent(m.Id_Menu);
        a.className = "estacion-link";
        a.style.cursor = "pointer";
        // este addEventListener lo añadimos porque a veces el click no llevaba a la pagina
        // no estoy seguro al 100% del por que pero asi funciona siempre
        a.addEventListener("click", function (ev) {
          ev.preventDefault();
          window.location.href = a.href;
        });

        // el html de la card (imagen, nombre y temporada)
        a.innerHTML =
          "<article class='estacion'>" +
            "<img src='../" + (m.Imagen_Ruta || "") + "' alt='" + m.Nombre + "' class='foto-fondo'>" +
            "<div class='overlay'></div>" +
            "<div class='info-estacion'>" +
              "<h2>" + m.Nombre + "</h2>" +
              "<p>" + (m.Temporada || "") + "</p>" +
            "</div>" +
          "</article>";

        cont.appendChild(a);
      });
    })
    .catch(function () {
      // si falla la peticion mostramos un mensaje en lugar de las cards
      cont.innerHTML = "<p>No se pudieron cargar los menús.</p>";
    });
});
