// sobreNosotros.js
// hace que los bloques con clase .reveal aparezcan con animacion al hacer scroll
// solo se usa en la pagina sobreNosotros.html

document.addEventListener("DOMContentLoaded", function () {
  // cogemos todos los elementos que tienen que aparecer animados
  var elementos = document.querySelectorAll(".reveal");
  if (!elementos.length) return;

  // si el navegador es muy viejo y no tiene IntersectionObserver los mostramos todos directamente
  if (!("IntersectionObserver" in window)) {
    elementos.forEach(function (el) {
      el.classList.add("reveal-visible");
    });
    return;
  }

  // este "observer" mira cuando un elemento entra en pantalla y le pone la clase para animarlo
  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("reveal-visible");
      // una vez animado dejamos de mirarlo para no gastar recursos
      obs.unobserve(entry.target);
    });
  }, {
    threshold: 0.16 // se activa cuando se ve un 16% del bloque, lo probamos y queda bien
  });

  // le decimos al observer que vigile cada elemento
  elementos.forEach(function (el) {
    observer.observe(el);
  });
});
