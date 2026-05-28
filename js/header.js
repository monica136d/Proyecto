// header.js
// carga el header compartido (header.html) y le mete tres cosas:
//   1. el modo accesibilidad (boton de fondo oscuro y letras grandes)
//   2. mostrar/ocultar Login, Cerrar sesion y Admin segun el usuario que este logueado
//   3. el menu hamburguesa de movil

// clave para guardar en localStorage si la accesibilidad esta encendida
const ACC_KEY = "accesibilidad_on";

// pone o quita la clase del body para activar el modo accesibilidad
function aplicarModoAccesibilidad(activo) {
    document.body.classList.toggle("accesibilidad-on", !!activo);
}

// al cargar la pagina miramos en localStorage si lo dejo encendido la ultima vez
const activoGuardado = localStorage.getItem(ACC_KEY) === "1";
if (document.body) aplicarModoAccesibilidad(activoGuardado);
else {
    // si el body todavia no existe esperamos a DOMContentLoaded
    document.addEventListener("DOMContentLoaded", function () {
        aplicarModoAccesibilidad(activoGuardado);
    }, { once: true });
}

// miramos si estamos en la pagina del admin (para no mostrarle "Admin" otra vez en el menu)
const enPaginaAdmin = /admin\.html/i.test(location.pathname || "");

// segun si la pagina esta en la raiz (index.html) o dentro de /html/ subimos un nivel o no
// asi el proyecto funciona aunque la carpeta no se llame "Proyecto"
var base = location.pathname.includes("/html/") ? "../" : "./";

// pedimos el html del header
fetch(base + "html/header.html")
    .then(res => res.text())
    .then(data => {
        // dentro del header.html los enlaces ponen "BASE/" delante, lo cambiamos por la ruta de verdad
        data = data.split("BASE/").join(base);
        // lo metemos en el div #header de la pagina
        document.getElementById("header").innerHTML = data;

        // botones de accesibilidad (hay uno en el header y otro flotante)
        const botonesAcc = Array.from(document.querySelectorAll(".js-btn-accesibilidad"));
        if (botonesAcc.length) {
            const activo = document.body.classList.contains("accesibilidad-on");
            // ponemos aria-pressed segun el estado actual (para que sea accesible de verdad)
            botonesAcc.forEach(btn => btn.setAttribute("aria-pressed", activo ? "true" : "false"));

            // al pulsar cualquiera de los botones cambiamos el modo y lo guardamos
            botonesAcc.forEach(btn => {
                btn.addEventListener("click", function () {
                    const nuevoEstado = !document.body.classList.contains("accesibilidad-on");
                    aplicarModoAccesibilidad(nuevoEstado);
                    botonesAcc.forEach(b => b.setAttribute("aria-pressed", nuevoEstado ? "true" : "false"));
                    // guardamos el estado para que al recargar siga igual
                    localStorage.setItem(ACC_KEY, nuevoEstado ? "1" : "0");
                });
            });
        }

        // segun si esta logueado el usuario y su rol mostramos unos enlaces u otros
        const navLogin = document.getElementById("nav-login");
        const navLogout = document.getElementById("nav-logout");
        const navAdmin = document.getElementById("nav-admin");
        // preguntamos al php si hay sesion activa
        fetch(base + "php/comprobar_sesion.php")
            .then(res => res.json())
            .then(sess => {
                const loggedIn = !!sess.loggedIn;
                const isAdmin = String(sess.rol || "").toLowerCase() === "admin";

                // si esta logueado escondemos Login y mostramos Cerrar sesion (y al reves)
                if (navLogin) navLogin.style.display = loggedIn ? "none" : "";
                if (navLogout) navLogout.style.display = loggedIn ? "" : "none";
                // el enlace "Admin" solo se ve si es admin Y no estamos ya en admin.html
                if (navAdmin) {
                    navAdmin.style.display = (loggedIn && isAdmin && !enPaginaAdmin) ? "" : "none";
                }
            })
            .catch(() => {
                // si falla la peticion lo ponemos como si no hubiera sesion
                if (navLogin) navLogin.style.display = "";
                if (navLogout) navLogout.style.display = "none";
                if (navAdmin) navAdmin.style.display = "none";
            });

        // menu hamburguesa para movil y tablet
        const btnMenu = document.querySelector(".menu-toggle");
        const menu = document.querySelector(".menu");
        if (!btnMenu || !menu) return;

        // al pulsar las 3 rayas abrimos/cerramos el menu
        btnMenu.addEventListener("click", function () {
            const abierto = menu.classList.toggle("menu-abierto");
            btnMenu.setAttribute("aria-expanded", abierto ? "true" : "false");
        });

        // si pulsamos un enlace dentro del menu, lo cerramos para que no se quede abierto
        menu.querySelectorAll("a").forEach(function (enlace) {
            enlace.addEventListener("click", function () {
                menu.classList.remove("menu-abierto");
                btnMenu.setAttribute("aria-expanded", "false");
            });
        });
    });
