// menu-detalle-dinamico.js
// rellena la pagina menu-detalle.html con los datos del menu que llega por la URL
// pide los datos al php get_menu_detalle.php?id=N y pinta el hero, precio y los pases


document.addEventListener("DOMContentLoaded", function () {
  // sacamos el id del menu de la URL (?id=N)
  var params = new URLSearchParams(window.location.search);
  var idMenu = params.get("id");

  // cogemos los elementos del html donde vamos a meter cosas
  var elNombre = document.getElementById("menuNombre");
  var elTemporada = document.getElementById("menuTemporada");
  var elIntro = document.getElementById("menuIntro");
  var elImagen = document.getElementById("menuImagen");
  var elLista = document.getElementById("listaPases");
  var elPrecio = document.getElementById("menuPrecio");
  var elPrecioWrap = document.getElementById("menuPrecioWrap");
  var hero = document.getElementById("menuHero");
  var heroNombre = document.getElementById("heroNombre");
  var heroTemporada = document.getElementById("heroTemporada");
  var heroSub = document.getElementById("heroSub");

  // pinta unos cuadrados grises mientras carga (skeleton) para que no quede vacio
  function pintarSkeletonPases() {
    elLista.innerHTML = "";
    for (var i = 0; i < 4; i++) {
      var sk = document.createElement("article");
      sk.className = "pase-skeleton";
      sk.innerHTML =
        "<div class='sk-line sk-line-badge'></div>" +
        "<div class='sk-line sk-line-title'></div>" +
        "<div class='sk-line sk-line-maridaje'></div>";
      elLista.appendChild(sk);
    }
  }

  // si la peticion falla mostramos un mensaje y un boton de Reintentar
  function pintarErrorConReintento(mensaje) {
    elLista.innerHTML =
      "<div class='menu-error-box'>" +
        "<p>" + mensaje + "</p>" +
        "<button type='button' class='btn-reintentar-menu'>Reintentar</button>" +
      "</div>";
  }

  // funcion que pide los datos al php y los pinta en la pagina
  function cargarDetalleMenu() {
    // primero pintamos el skeleton para que no parezca que esta congelado
    pintarSkeletonPases();

    fetch("../php/get_menu_detalle.php?id=" + encodeURIComponent(idMenu))
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        // si el php nos dice que no esta ok lanzamos error para ir al catch
        if (!data.ok) throw new Error(data.msg || "Error");

        var menu = data.menu || {};
        var pases = data.pases || [];

        // rellenamos el nombre, la temporada y la intro
        elNombre.textContent = menu.Nombre || "Menú";
        elTemporada.textContent = menu.Temporada || "Temporada";
        elIntro.textContent = "Experiencia de " + (menu.Temporada || "temporada") + " con maridaje.";
        // tambien cambiamos el titulo de la pestaña del navegador
        document.title = (menu.Nombre || "Menú") + " — Ceniza & Oro";
        // y el hero de arriba (la imagen grande con el texto)
        if (heroNombre) heroNombre.textContent = menu.Nombre || "Menú";
        if (heroTemporada) heroTemporada.textContent = menu.Temporada || "Temporada";
        if (heroSub) heroSub.textContent = "Experiencia de " + (menu.Temporada || "temporada") + " con maridaje.";

        // si el menu tiene precio guardado lo enseñamos, si no escondemos el bloque
        if (elPrecio && elPrecioWrap) {
          var precioNum = Number(menu.Precio);
          if (Number.isFinite(precioNum) && precioNum > 0) {
            elPrecio.innerHTML = precioNum.toFixed(0) + " EUR <span>por persona</span>";
            elPrecioWrap.style.display = "flex";
          } else {
            elPrecio.textContent = "";
            elPrecioWrap.style.display = "none";
          }
        }

        // ponemos la imagen de fondo del hero y la imagen del menu
        // si no hay ruta usamos la de verano por defecto para que no salga rota
        if (menu.Imagen_Ruta) {
          elImagen.src = "../" + menu.Imagen_Ruta;
          if (hero) hero.style.backgroundImage = "url('../" + menu.Imagen_Ruta + "')";
        } else {
          elImagen.src = "../assets/verano.png";
          if (hero) hero.style.backgroundImage = "url('../assets/verano.png')";
        }
        elImagen.alt = "Imagen de " + (menu.Nombre || "menú");

        // si el menu no tiene pases avisamos
        if (!pases.length) {
          elLista.innerHTML = "<p>Este menú aún no tiene platos asociados.</p>";
          return;
        }

        // limpiamos los skeletons y pintamos los pases reales
        elLista.innerHTML = "";
        pases.forEach(function (pase, index) {
          var art = document.createElement("article");
          art.className = "pase";

          var tituloPlato = pase.Plato_Descripcion || "Plato sin descripción";
          var vino = pase.Vino_Nombre || "Sin maridaje";
          var tipoVino = pase.Tipo_Vino ? (" (" + pase.Tipo_Vino + ")") : "";

          // numeramos cada pase y enseñamos el maridaje del vino
          art.innerHTML =
            "<div class='info'>" +
              "<span class='pase-numero'>Pase " + (index + 1) + "</span>" +
              "<h3>" + tituloPlato + "</h3>" +
              "<div class='maridaje'>" +
                "<span class='maridaje-icono' aria-hidden='true'>🍷</span>" +
                "<span class='maridaje-label'>Maridaje</span>" +
                "<span class='maridaje-valor'>" + vino + tipoVino + "</span>" +
              "</div>" +
            "</div>";

          elLista.appendChild(art);
          // los hacemos aparecer con un retraso entre cada uno (queda mejor que de golpe)
          setTimeout(function () {
            art.classList.add("pase-visible");
          }, index * 80);
        });
      })
      .catch(function () {
        // si peta algo enseñamos mensajes de error en cada hueco
        elNombre.textContent = "No se pudo cargar el menú";
        elTemporada.textContent = "Error";
        elIntro.textContent = "Ocurrió un problema al obtener la información.";
        if (elPrecio && elPrecioWrap) {
          elPrecio.textContent = "";
          elPrecioWrap.style.display = "none";
        }
        pintarErrorConReintento("Error al cargar los datos del menú.");
        if (heroNombre) heroNombre.textContent = "No se pudo cargar el menú";
        if (heroTemporada) heroTemporada.textContent = "Error";
        if (heroSub) heroSub.textContent = "Ocurrió un problema al obtener la información.";
      });
  }

  // si la URL no tiene ?id=N no podemos hacer nada, mostramos error y salimos
  if (!idMenu) {
    elNombre.textContent = "Menú no especificado";
    elTemporada.textContent = "Sin ID";
    elIntro.textContent = "Falta el parámetro id en la URL.";
    if (elPrecio && elPrecioWrap) {
      elPrecio.textContent = "";
      elPrecioWrap.style.display = "none";
    }
    pintarErrorConReintento("No se pudo identificar el menú.");
    if (heroNombre) heroNombre.textContent = "Menú no especificado";
    if (heroTemporada) heroTemporada.textContent = "Sin ID";
    if (heroSub) heroSub.textContent = "Falta el parámetro id en la URL.";
    return;
  }

  // si pulsan el boton de Reintentar volvemos a llamar a la funcion
  elLista.addEventListener("click", function (ev) {
    var btn = ev.target.closest(".btn-reintentar-menu");
    if (!btn) return;
    cargarDetalleMenu();
  });

  // y al cargar la pagina por primera vez pedimos los datos
  cargarDetalleMenu();
});
