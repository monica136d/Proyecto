// footer.js
// carga el footer compartido (footer.html) y lo mete en el div #footer de cada pagina
// asi no tenemos que copiar el footer en todos los html

// pedimos el html del footer
fetch("/Proyecto/html/footer.html")
    .then(res => res.text())
    .then(data => {
        // lo metemos dentro del div #footer
        document.getElementById("footer").innerHTML = data;

        // ponemos el año actual para no tener que cambiarlo cada año a mano
        const yearSpan = document.querySelector('.footer-bottom p');
        if (yearSpan) {
            const currentYear = new Date().getFullYear();
            yearSpan.innerHTML = `© ${currentYear} Ceniza & Oro. Todos los derechos reservados.`;
        }

        // si un enlace empieza por # hacemos scroll suave a esa parte de la pagina
        document.querySelectorAll('a[href^="#"]').forEach(enlace => {
            enlace.addEventListener('click', function (e) {
                e.preventDefault();
                const href = this.getAttribute('href');
                if (!href || href === '#') return;
                const destino = document.querySelector(href);
                if (destino) {
                    destino.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // esto lo puse para probar mientras hacia los iconos de redes, lo dejo por si acaso
        // TODO: cuando tengamos los enlaces reales de instagram/facebook quitarlo
        document.querySelectorAll('.footer-social a').forEach(icono => {
            icono.addEventListener('click', () => {
                console.log("Has hecho clic en:", icono.getAttribute('aria-label'));
            });
        });
    });
