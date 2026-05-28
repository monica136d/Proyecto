// admin.js
// controla todo el panel de admin (admin.html)
// se encarga de: cambiar de seccion (Panel, Menus, Reservas, Usuarios),
// pintar las tablas con los datos de los php, abrir modales para editar,
// y mostrar avisos (toasts) cuando se hace una accion
//
// se comunica con los php de la carpeta ../php/ usando fetch

document.addEventListener("DOMContentLoaded", function () {
  // los toasts (mensajes de aviso) duran 4 segundos
  var TOAST_ADMIN_MS = 4000;

  /* ===== MENU LATERAL: cambiar de seccion ===== */
  var botones   = document.querySelectorAll(".menu-admin button");
  var secciones = document.querySelectorAll(".seccion");

  botones.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var objetivo = this.getAttribute("data-seccion");
      // quitamos la clase activo/activa a todos antes de poner el nuevo
      botones.forEach(function (b)   { b.classList.remove("activo"); });
      secciones.forEach(function (s) { s.classList.remove("activa"); });
      this.classList.add("activo");
      var sec = document.getElementById(objetivo);
      if (sec) sec.classList.add("activa");
      // si volvemos al panel actualizamos los contadores
      if (objetivo === "panel") cargarEstadisticasPanel();
    });
  });

  /* ===== PANEL: contadores de arriba ===== */
  cargarEstadisticasPanel();

  // pide los totales (menus, reservas, usuarios) y los pinta en las tarjetas
  function cargarEstadisticasPanel() {
    fetch("../php/obtener_estadisticas_panel.php")
      .then(function (r) { if (!r.ok) throw new Error("red"); return r.json(); })
      .then(function (data) {
        var elM = document.getElementById("contador-menus");
        var elR = document.getElementById("contador-reservas");
        var elU = document.getElementById("contador-usuarios");
        if (elM) elM.textContent = data.menus != null ? String(data.menus) : "0";
        if (elR) elR.textContent = data.reservas != null ? String(data.reservas) : "0";
        if (elU) elU.textContent = data.usuarios != null ? String(data.usuarios) : "0";
      })
      .catch(function () {
        // si falla no hacemos nada, los contadores se quedan a 0
        // TODO: avisar al admin que no hay conexion
      });
  }

  /* ===== ACTIVIDAD RECIENTE (Panel) ===== */
  cargarActividadReciente();

  // boton para vaciar todo el historial
  var btnVaciarActividad = document.getElementById("btnVaciarActividad");
  if (btnVaciarActividad) {
    btnVaciarActividad.addEventListener("click", function () {
      // pedimos confirmacion para que no se borre por accidente
      if (!confirm("¿Seguro que quieres vaciar la actividad reciente?")) return;

      fetch("../php/vaciarActividadReciente.php", { method: "POST" })
        .then(function (r) { if (!r.ok) throw new Error("red"); return r.json(); })
        .then(function (data) {
          if (!data.ok) throw new Error("bd");
          // recargamos para ver la lista vacia
          cargarActividadReciente();
        })
        .catch(function () {
          var c = document.getElementById("actividadRecienteLista");
          if (c) c.innerHTML = "<p class='subtitulo'>Error al vaciar actividad.</p>";
        });
    });
  }

  // pide al php los ultimos eventos y los pinta en el panel
  function cargarActividadReciente() {
    var contenedor = document.getElementById("actividadRecienteLista");
    if (!contenedor) return;

    fetch("../php/getActividadReciente.php")
      .then(function (r) { if (!r.ok) throw new Error("red"); return r.json(); })
      .then(function (data) {
        contenedor.innerHTML = "";
        var eventos = data.eventos || [];

        // si no hay nada en el historial avisamos
        if (!eventos.length) {
          contenedor.innerHTML = "<p class='subtitulo'>Sin actividad reciente.</p>";
          return;
        }

        // por cada evento creamos una fila con su icono, titulo y fecha
        eventos.forEach(function (ev) {
          var icono = iconoActividad(ev.Tipo);
          var titulo = tituloActividad(ev.Tipo);
          var fechaFormateada = formatearFecha(ev.FechaHora);

          var item = document.createElement("div");
          item.className = "actividad-item";
          item.innerHTML =
            "<span class='actividad-icono'>" + icono + "</span>" +
            "<div class='actividad-cuerpo'>" +
              "<span class='actividad-titulo'>" + titulo + "</span>" +
              "<span class='actividad-mensaje'>" + ev.Mensaje + "</span>" +
              "<span class='actividad-fecha'>" + fechaFormateada + "</span>" +
            "</div>";
          contenedor.appendChild(item);
        });
      })
      .catch(function () {
        var c = document.getElementById("actividadRecienteLista");
        if (c) c.innerHTML = "<p class='subtitulo'>Error al cargar actividad.</p>";
      });
  }

  // segun el tipo de evento devuelve un emoji para que se vea mas visual
  // los emojis los copiamos de internet, no se si es la mejor forma pero queda bien

  function iconoActividad(tipo) {
    if (tipo === "reserva_creada")    return "🟢";
    if (tipo === "reserva_confirmada") return "✅";
    if (tipo === "reserva_cancelada") return "🔴";
    if (tipo === "reserva_editada")   return "✏️";
    if (tipo === "usuario_nuevo")     return "👤";
    if (tipo === "usuario_editado")   return "🔧";
    if (tipo === "menu_creado")       return "🍽️";
    if (tipo === "menu_editado")      return "📝";
    if (tipo === "menu_eliminado")    return "🗑️";
    return "📋"; // por defecto
  }

  // segun el tipo de evento devuelve un titulo bonito para el usuario
  function tituloActividad(tipo) {
    var mapa = {
      "reserva_creada":    "Nueva reserva",
      "reserva_confirmada":"Reserva confirmada",
      "reserva_cancelada": "Reserva cancelada",
      "reserva_editada":   "Reserva editada",
      "usuario_nuevo":     "Nuevo usuario",
      "usuario_editado":   "Usuario editado",
      "menu_creado":       "Menú creado",
      "menu_editado":      "Menú editado",
      "menu_eliminado":    "Menú eliminado",
    };
    return mapa[tipo] || tipo;
  }

  // pasa la fecha de la base de datos (YYYY-MM-DD HH:MM:SS) a formato HH:MM — DD/MM/YYYY
  function formatearFecha(fechaHora) {
    if (!fechaHora) return "";
    var partes = fechaHora.split(" ");
    var fecha = partes[0] || "";
    var hora  = (partes[1] || "").substring(0, 5); // solo cogemos HH:MM, sin segundos
    // pasamos la fecha de YYYY-MM-DD a DD/MM/YYYY que es como se ve en España
    var f = fecha.split("-");
    if (f.length === 3) fecha = f[2] + "/" + f[1] + "/" + f[0];
    return hora + " — " + fecha;
  }

  // escapa caracteres raros para que no rompan el html cuando los metemos en atributos
  // (lo aprendimos en seguridad cuando vimos lo del XSS)
  function escAttr(s) {
    return String(s != null ? s : "")
      .replace(/&/g, "&amp;")
      .replace(/'/g, "&#39;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  /* ===== TABLA DE MENUS ===== */
  // ponemos el listener una sola vez en el tbody para que no se duplique
  // cada vez que recargamos la tabla (si lo ponemos en cada fila se acumulan)
  var tbodyMenus = document.getElementById("tablaMenusBody");
  if (tbodyMenus) {
    tbodyMenus.addEventListener("click", function (ev) {
      // miramos si el click ha sido en un boton de editar
      var btn = ev.target.closest(".btn-editar-menu");
      if (!btn) return;

      // rellenamos el formulario con los datos que llevan los data-* del icono
      document.getElementById("id_menu_editar").value   = btn.dataset.id || "";
      document.getElementById("nombre_menu").value      = btn.dataset.nombre || "";
      document.getElementById("temporada_menu").value   = btn.dataset.temporada || "";
      document.getElementById("imagen_ruta_menu").value = btn.dataset.imagen || "";

      var selPlato = document.getElementById("id_plato_menu");
      var selVino  = document.getElementById("id_vino_menu");
      var idP = String(btn.dataset.plato != null ? btn.dataset.plato : "");
      var idV = String(btn.dataset.vino != null ? btn.dataset.vino : "");
      if (selPlato) selPlato.value = idP;
      if (selVino)  selVino.value  = idV;
      // actualizamos los campos de texto con los datos del plato y vino seleccionados
      actualizarDescPlatoDesdeSelect();
      actualizarNombreVinoDesdeSelect();

      // al editar dejamos que se pueda guardar aunque algun campo este vacio
      // (el php se encarga de mantener lo que habia antes)
      [
        "nombre_menu",
        "temporada_menu",
        "imagen_ruta_menu",
        "id_plato_menu",
        "id_vino_menu",
        "desc_plato_menu",
        "nombre_vino_menu"
      ].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.removeAttribute("required");
      });

      // cambiamos el formulario para que ahora vaya al php de editar (no al de crear)
      var form = document.getElementById("formMenu");
      form.action = "../php/menu_editar.php";
      document.getElementById("btn_guardar_menu").textContent = "Guardar cambios";
      document.getElementById("titulo-form-menu").textContent = "Editar menú";
    });
  }

  // cuando se elige un plato del select, ponemos su descripcion en el input de texto
  function actualizarDescPlatoDesdeSelect() {
    var selPlato = document.getElementById("id_plato_menu");
    var inpDesc = document.getElementById("desc_plato_menu");
    if (!selPlato || !inpDesc) return;
    var op = selPlato.options[selPlato.selectedIndex];
    if (!op || !op.value) {
      inpDesc.value = "";
      return;
    }
    // la descripcion la guardamos en data-desc cuando creamos las options
    inpDesc.value = op.getAttribute("data-desc") || "";
  }

  // igual pero para el vino
  function actualizarNombreVinoDesdeSelect() {
    var selVino = document.getElementById("id_vino_menu");
    var inpNombre = document.getElementById("nombre_vino_menu");
    if (!selVino || !inpNombre) return;
    var op = selVino.options[selVino.selectedIndex];
    if (!op || !op.value) {
      inpNombre.value = "";
      return;
    }
    inpNombre.value = op.getAttribute("data-nombre") || "";
  }

  /* ===== CATALOGOS Y TABLA DE MENUS ===== */
  // primero pedimos los catalogos (platos y vinos) para los desplegables
  // y cuando terminan llamamos a cargarMenus() para pintar la tabla
  // (asi cuando pulses editar ya estan los selects con sus opciones)
  function cargarCatalogos(alTerminar) {
    var selPlato = document.getElementById("id_plato_menu");
    var selVino  = document.getElementById("id_vino_menu");
    if (!selPlato || !selVino) {
      if (typeof alTerminar === "function") alTerminar();
      return;
    }

    fetch("../php/listar_platos_vinos.php")
      .then(function (r) { if (!r.ok) throw new Error("red"); return r.json(); })
      .then(function (data) {
        // rellenamos el desplegable de platos
        selPlato.innerHTML = '<option value="">Selecciona plato</option>';
        data.platos.forEach(function (p) {
          var op = document.createElement("option");
          op.value = String(p.Id_Plato);
          op.textContent = "[" + p.Id_Plato + "] " + p.Tipo + " — " + p.Descripcion;
          // guardamos la descripcion en data-desc para usarla luego al editar
          op.setAttribute("data-desc", p.Descripcion || "");
          selPlato.appendChild(op);
        });

        // rellenamos el desplegable de vinos
        selVino.innerHTML = '<option value="">Selecciona vino</option>';
        data.vinos.forEach(function (v) {
          var op = document.createElement("option");
          op.value = String(v.Id_Vino);
          op.textContent = "[" + v.Id_Vino + "] " + v.Nombre + " (" + v.Tipo_Vino + ")";
          op.setAttribute("data-nombre", v.Nombre || "");
          selVino.appendChild(op);
        });
        // cuando el admin cambia plato o vino actualizamos los inputs de texto
        selPlato.addEventListener("change", actualizarDescPlatoDesdeSelect);
        selVino.addEventListener("change", actualizarNombreVinoDesdeSelect);
        actualizarDescPlatoDesdeSelect();
        actualizarNombreVinoDesdeSelect();
        if (typeof alTerminar === "function") alTerminar();
      })
      .catch(function () {
        // si falla algo dejamos los desplegables con un mensaje de error
        selPlato.innerHTML = '<option value="">Error al cargar platos</option>';
        selVino.innerHTML  = '<option value="">Error al cargar vinos</option>';
        if (typeof alTerminar === "function") alTerminar();
      });
  }

  // primero los catalogos, luego la tabla de menus
  cargarCatalogos(cargarMenus);

  // pide los menus al php y los pinta en la tabla del admin
  function cargarMenus() {
    var tbody = document.getElementById("tablaMenusBody");
    if (!tbody) return;

    fetch("../php/listar_menu_admin.php")
      .then(function (r) { if (!r.ok) throw new Error("red"); return r.json(); })
      .then(function (menus) {
        tbody.innerHTML = "";

        if (!menus.length) {
          tbody.innerHTML = "<tr><td colspan='6'>No hay menús creados.</td></tr>";
          return;
        }

        // por cada menu hacemos una fila con sus datos y los iconos de editar/eliminar
        menus.forEach(function (m) {
          var tr = document.createElement("tr");
          tr.innerHTML =
            "<td>" + m.Id_Menu + "</td>" +
            "<td>" + escAttr(m.Nombre) + "</td>" +
            "<td>" + escAttr(m.Temporada || "—") + "</td>" +
            "<td>" + escAttr(m.Plato_Descripcion || "—") + "</td>" +
            "<td>" + escAttr(m.Vino_Nombre || "—") + "</td>" +
            "<td class='acciones acciones-tabla acciones-tabla-menus'>" +
              // icono de editar: lleva todos los datos del menu en data-*
              "<i class='bx bx-edit btn-editar btn-editar-menu icono-accion icono-dorado' title='Editar menú'" +
                " data-id='"        + m.Id_Menu + "'" +
                " data-nombre='"    + escAttr(m.Nombre) + "'" +
                " data-temporada='" + escAttr(m.Temporada) + "'" +
                " data-imagen='"    + escAttr(m.Imagen_Ruta) + "'" +
                " data-plato='"     + escAttr(m.Id_Plato != null ? m.Id_Plato : "") + "'" +
                " data-vino='"      + escAttr(m.Id_Vino != null ? m.Id_Vino : "") + "'" +
                "></i>" +
              // formulario en linea para borrar el menu (con confirm para no borrar sin querer)
              "<form action='../php/menu_eliminar.php' method='POST' class='form-accion-inline' onsubmit='return confirm(\"¿Eliminar el menú?\")'>" +
                "<input type='hidden' name='id_menu' value='" + m.Id_Menu + "'>" +
                "<button type='submit' class='btn-icono-inline' title='Eliminar menú'>" +
                  "<i class='bx bx-trash btn-eliminar-menu icono-accion icono-rojo'></i>" +
                "</button>" +
              "</form>" +
            "</td>";
          tbody.appendChild(tr);
        });
      })
      .catch(function () {
        var t = document.getElementById("tablaMenusBody");
        if (t) t.innerHTML = "<tr><td colspan='6'>Error al cargar menús.</td></tr>";
      });
  }

  /* ===== TABLA DE RESERVAS ===== */
  cargarReservas();

  // pide las reservas al php y las pinta en la tabla
  function cargarReservas() {
    var tbody = document.getElementById("tablaReservasBody");
    if (!tbody) return;

    fetch("../php/getReservas.php")
      .then(function (r) { if (!r.ok) throw new Error("red"); return r.json(); })
      .then(function (data) {
        tbody.innerHTML = "";
        var reservas = data.reservas || [];

        if (!reservas.length) {
          tbody.innerHTML = "<tr><td colspan='8'>No hay reservas.</td></tr>";
          filtrarReservas();
          return;
        }

        // por cada reserva creamos una fila
        reservas.forEach(function (r) {
          var tr = document.createElement("tr");
          // si tiene varias mesas asignadas las ponemos juntas, si no solo la mesa principal
          var txtMesa = r.Mesas_Asignadas ? ("Mesas " + r.Mesas_Asignadas) : ("Mesa " + r.Numero_Mesa);
          // si tiene observaciones ponemos un iconito que al pulsarlo las muestra
          var obsTxt = (r.Observaciones && String(r.Observaciones).trim()) ? String(r.Observaciones).trim() : "";
          var obsIcon = "";
          if (obsTxt.length > 0) {
            // TODO: deberiamos hacer un modal en lugar de un alert pero por ahora vale
            obsIcon =
              "<i class='bx bx-message-detail icono-observaciones' onclick='alert(\"" +
              obsTxt.replace(/"/g, "&quot;") +
              "\")'></i>";
          }
          tr.innerHTML =
            "<td>" + r.Id_Reserva + "</td>" +
            "<td>" + r.Nombre + obsIcon + "<br><small>" + r.Email + "</small></td>" +
            "<td>" + txtMesa + "</td>" +
            "<td>" + r.Fecha + "</td>" +
            "<td>" + r.Hora + "</td>" +
            "<td>" + r.Num_Personas + "</td>" +
            "<td>" + r.Estado + "</td>" +
            "<td class='acciones acciones-tabla acciones-tabla-reservas'>" +
              "<i class='bx bx-check-circle btn-confirmar-reserva icono-verde' title='Confirmar' data-id='" +
              r.Id_Reserva +
              "'></i>" +
              "<i class='bx bx-edit btn-editar-reserva icono-dorado' title='Editar' data-id='" +
              r.Id_Reserva +
              "' data-mesa='" +
              r.Id_Mesa +
              "' data-fecha='" +
              r.Fecha +
              "' data-hora='" +
              r.Hora +
              "' data-estado='" +
              (r.Estado || "pendiente") +
              "'></i>" +
              "<i class='bx bx-x-circle btn-cancelar-reserva icono-rojo-vivo' title='Cancelar' data-id='" +
              r.Id_Reserva +
              "'></i>" +
            "</td>";
          tbody.appendChild(tr);
        });
        filtrarReservas();
      })
      .catch(function () {
        var t = document.getElementById("tablaReservasBody");
        if (t) t.innerHTML = "<tr><td colspan='8'>Error al cargar reservas.</td></tr>";
      });
  }

  // filtra las filas de la tabla segun mes, dia o estado elegidos arriba
  function filtrarReservas() {
    var tbody = document.getElementById("tablaReservasBody");
    if (!tbody) return;

    var selMes    = document.getElementById("filtroMes");
    var inputDia  = document.getElementById("filtroDia");
    var selEstado = document.getElementById("filtroEstado");

    var mesElegido    = selMes    ? selMes.value    : "";
    var diaElegido    = inputDia  ? inputDia.value.trim()  : "";
    var estadoElegido = selEstado ? selEstado.value.trim() : "";

    var filas = tbody.querySelectorAll("tr");

    // miramos fila por fila si cumple los filtros
    filas.forEach(function (tr) {
      var celdas = tr.querySelectorAll("td");
      // si es una fila con mensaje (tipo "no hay reservas") la dejamos visible
      if (celdas.length < 8 || celdas[0].getAttribute("colspan")) {
        tr.style.display = "table-row";
        return;
      }

      var textoFecha = celdas[3].textContent.trim();
      var textoEstado = celdas[6].textContent.trim().toLowerCase();

      // filtro de mes: comparamos el numero de mes de la fecha
      var okMes = true;
      if (mesElegido !== "") {
        var partes = textoFecha.split("-");
        okMes = partes.length >= 2 && parseInt(partes[1], 10) === parseInt(mesElegido, 10);
      }

      // filtro de dia exacto
      var okDia = true;
      if (diaElegido !== "") {
        okDia = textoFecha === diaElegido;
      }

      // filtro de estado
      var okEstado = true;
      if (estadoElegido !== "") {
        okEstado = textoEstado === estadoElegido.toLowerCase();
      }

      // mostramos la fila solo si cumple todos los filtros
      tr.style.display = okMes && okDia && okEstado ? "table-row" : "none";
    });
  }

  // enganchamos los selectores para que al cambiar se filtre solo
  var filtroMes = document.getElementById("filtroMes");
  if (filtroMes) {
    filtroMes.addEventListener("change", filtrarReservas);
  }
  var filtroDia = document.getElementById("filtroDia");
  if (filtroDia) {
    filtroDia.addEventListener("change", filtrarReservas);
  }
  var filtroEstado = document.getElementById("filtroEstado");
  if (filtroEstado) {
    filtroEstado.addEventListener("change", filtrarReservas);
  }
  // boton para limpiar todos los filtros de golpe
  var btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");
  if (btnLimpiarFiltros) {
    btnLimpiarFiltros.addEventListener("click", function () {
      if (filtroMes) filtroMes.value = "";
      if (filtroDia) filtroDia.value = "";
      if (filtroEstado) filtroEstado.value = "";
      filtrarReservas();
    });
  }

  /* ===== ACCIONES DE LAS RESERVAS (confirmar / cancelar / editar) ===== */
  // un solo listener para toda la pagina (delegacion de eventos)
  // asi no tenemos que añadir un addEventListener a cada icono cuando se recarga la tabla
  document.addEventListener("click", function (ev) {
    // boton confirmar
    var btnConfirmar = ev.target.closest(".btn-confirmar-reserva");
    if (btnConfirmar) {
      cambiarEstadoReserva(btnConfirmar.dataset.id, "confirmada");
      return;
    }

    // boton cancelar
    var btnCancelar = ev.target.closest(".btn-cancelar-reserva");
    if (btnCancelar) {
      cancelarReserva(btnCancelar.dataset.id);
      return;
    }

    // boton editar (abre el modal)
    var btnEditar = ev.target.closest(".btn-editar-reserva");
    if (btnEditar) {
      editarReserva(btnEditar);
    }
  });

  // cambia el estado de una reserva (pendiente / confirmada / cancelada)
  function cambiarEstadoReserva(idReserva, estado) {
    fetch("../php/actualizarReserva.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "id_reserva=" + encodeURIComponent(idReserva) +
            "&estado="    + encodeURIComponent(estado)
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.ok) {
          mostrarToastAdmin("Reserva marcada como " + estado + ".");
          cargarReservas();
        } else {
          mostrarToastAdmin(data.msg || "No se pudo actualizar.");
        }
      })
      .catch(function () { mostrarToastAdmin("Error de red."); });
  }

  // cancela una reserva (le pone Estado = cancelada)
  function cancelarReserva(idReserva) {
    fetch("../php/cancelarReserva.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "id_reserva=" + encodeURIComponent(idReserva)
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.ok) {
          mostrarToastAdmin("Reserva cancelada.");
          cargarReservas();
        } else {
          mostrarToastAdmin(data.msg || "No se pudo cancelar.");
        }
      })
      .catch(function () { mostrarToastAdmin("Error de red."); });
  }

  /* ===== MODAL DE EDITAR RESERVA ===== */
  var idReservaEnEdicion = null; // guardamos el id de la reserva que estamos editando
  var modal      = document.getElementById("modalEditarReserva");
  var inputFecha = document.getElementById("edit_fecha");
  var inputHora  = document.getElementById("edit_hora");
  var selMesa    = document.getElementById("edit_mesa");
  var selEstado  = document.getElementById("edit_estado");

  // abre el modal con los datos de la reserva en los campos
  function editarReserva(btn) {
    idReservaEnEdicion = btn.dataset.id;
    inputFecha.value = btn.dataset.fecha || "";
    inputHora.value  = (btn.dataset.hora || "").substring(0, 5);
    if (selEstado) selEstado.value = (btn.dataset.estado || "pendiente").toLowerCase();
    selMesa.innerHTML = "<option value=''>— elige fecha y hora primero —</option>";

    // si ya hay fecha y hora, pedimos las mesas libres directamente
    if (inputFecha.value && inputHora.value) {
      cargarMesasLibres();
    }

    modal.hidden = false;
  }

  // pide al php las mesas que estan libres para esa fecha y hora
  function cargarMesasLibres() {
    var fecha = inputFecha.value;
    var hora  = inputHora.value + ":00"; // el php espera el formato HH:MM:SS
    if (!fecha || !inputHora.value) {
      selMesa.innerHTML = "<option value=''>— elige fecha y hora primero —</option>";
      return;
    }

    selMesa.innerHTML = "<option value=''>Cargando mesas…</option>";

    // mandamos tambien el id_reserva para que no cuente como ocupada la propia mesa
    var url = "../php/getMesasLibres.php" +
              "?fecha="      + encodeURIComponent(fecha) +
              "&hora="       + encodeURIComponent(hora)  +
              "&id_reserva=" + encodeURIComponent(idReservaEnEdicion || 0);

    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        selMesa.innerHTML = "";
        if (!data.ok || !data.mesas.length) {
          selMesa.innerHTML = "<option value=''>No hay mesas libres</option>";
          return;
        }
        // creamos una option por cada mesa libre
        data.mesas.forEach(function (m) {
          var op = document.createElement("option");
          op.value = m.Id_Mesa;
          op.textContent = "Mesa " + m.Numero_Mesa;
          selMesa.appendChild(op);
        });
      })
      .catch(function () {
        selMesa.innerHTML = "<option value=''>Error al cargar mesas</option>";
      });
  }

  // si cambia la fecha o la hora en el modal, recargamos las mesas libres
  if (inputFecha) inputFecha.addEventListener("change", cargarMesasLibres);
  if (inputHora)  inputHora.addEventListener("change",  cargarMesasLibres);

  // boton para cerrar el modal sin guardar
  document.getElementById("btnCerrarModal").addEventListener("click", function () {
    document.getElementById("modalEditarReserva").hidden = true;
    idReservaEnEdicion = null;
  });

  // boton para guardar los cambios de la reserva editada
  document.getElementById("btnGuardarEdicion").addEventListener("click", function () {
    var mesa   = selMesa.value;
    var fecha  = inputFecha.value;
    var hora   = inputHora.value + ":00";
    var estado = selEstado ? selEstado.value : "pendiente";

    if (!idReservaEnEdicion || !mesa || !fecha || !inputHora.value) {
      mostrarToastAdmin("Rellena todos los campos.");
      return;
    }

    fetch("../php/actualizarReserva.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "id_reserva=" + encodeURIComponent(idReservaEnEdicion) +
            "&id_mesa="   + encodeURIComponent(mesa)               +
            "&fecha="     + encodeURIComponent(fecha)              +
            "&hora="      + encodeURIComponent(hora)               +
            "&estado="    + encodeURIComponent(estado)
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.ok) {
          modal.hidden = true;
          idReservaEnEdicion = null;
          mostrarToastAdmin("Reserva editada correctamente.");
          cargarReservas();
        } else {
          mostrarToastAdmin(data.msg || "No se pudo editar.");
        }
      })
      .catch(function () { mostrarToastAdmin("Error de red."); });
  });

  /* ===== USUARIOS ===== */
  cargarUsuarios();

  // pide los usuarios al php y los pinta en la tabla con sus botones
  function cargarUsuarios() {
    var tbody = document.getElementById("tablaUsuariosBody");
    if (!tbody) return;

    fetch("../php/getUsuarios.php")
      .then(function (r) { if (!r.ok) throw new Error("red"); return r.json(); })
      .then(function (data) {
        tbody.innerHTML = "";
        var usuarios = data.usuarios || [];

        if (!usuarios.length) {
          tbody.innerHTML = "<tr><td colspan='5'>No hay usuarios.</td></tr>";
          return;
        }

        usuarios.forEach(function (u) {
          var tr = document.createElement("tr");
          tr.innerHTML =
            "<td>" + u.Id_Usuario + "</td>" +
            "<td>" + u.Nombre + "</td>" +
            "<td>" + u.Email + "</td>" +
            "<td>" + u.Rol + "</td>" +
            "<td class='acciones acciones-tabla acciones-tabla-usuarios'>" +
              "<i class='bx bx-show btn-ver-usuario icono-accion icono-gris' title='Ver detalles'" +
                " data-id='" + u.Id_Usuario + "'" +
                "></i>" +
              "<i class='bx bx-edit btn-editar-usuario icono-accion icono-dorado' title='Editar usuario'" +
                " data-id='"     + u.Id_Usuario + "'" +
                " data-nombre='" + (u.Nombre || "").replace(/'/g, "&#39;") + "'" +
                " data-email='"  + (u.Email  || "").replace(/'/g, "&#39;") + "'" +
                " data-rol='"    + (u.Rol    || "") + "'" +
                "></i>" +
              "<i class='bx bx-trash btn-eliminar-usuario icono-accion icono-rojo' title='Eliminar usuario'" +
                " data-id='" + u.Id_Usuario + "'" +
                "></i>" +
            "</td>";
          tbody.appendChild(tr);
        });
      })
      .catch(function () {
        var t = document.getElementById("tablaUsuariosBody");
        if (t) t.innerHTML = "<tr><td colspan='5'>Error al cargar usuarios.</td></tr>";
      });
  }

  /* ===== MODALES DE USUARIO (variables) ===== */
  var modalEditarUsuario    = document.getElementById("modalEditarUsuario");
  var modalDetallesUsuario  = document.getElementById("modalDetallesUsuario");
  var idUsuarioEnEdicion    = null; // id del usuario que se esta editando

  // un solo listener para todas las acciones de usuario (ver, editar, eliminar, cerrar)
  document.addEventListener("click", function (ev) {
    // boton de ver detalles
    var btnVer = ev.target.closest(".btn-ver-usuario");
    if (btnVer) {
      verUsuario(btnVer.dataset.id);
      return;
    }

    // boton de editar
    var btnEditarU = ev.target.closest(".btn-editar-usuario");
    if (btnEditarU) {
      abrirEditarUsuario(btnEditarU);
      return;
    }

    // boton de eliminar
    var btnEliminarU = ev.target.closest(".btn-eliminar-usuario");
    if (btnEliminarU) {
      eliminarUsuario(btnEliminarU.dataset.id);
      return;
    }

    // cerrar el modal de editar
    if (ev.target.id === "btnCerrarModalUsuario") {
      modalEditarUsuario.hidden = true;
      idUsuarioEnEdicion = null;
      return;
    }

    // cerrar el modal de detalles
    if (ev.target.id === "btnCerrarDetallesUsuario") {
      modalDetallesUsuario.hidden = true;
    }
  });

  // pide al php los datos del usuario y sus reservas y los enseña en el modal
  function verUsuario(id) {
    fetch("../php/getUsuarioDetalles.php?id_usuario=" + encodeURIComponent(id))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.ok) { mostrarToastAdmin(data.msg || "Error al cargar usuario."); return; }

        var u = data.usuario;
        document.getElementById("detallesUsuarioInfo").innerHTML =
          "<p><strong>ID:</strong> "     + u.Id_Usuario + "</p>" +
          "<p><strong>Nombre:</strong> " + u.Nombre     + "</p>" +
          "<p><strong>Email:</strong> "  + u.Email      + "</p>" +
          "<p><strong>Rol:</strong> "    + u.Rol        + "</p>";

        var tbodyR = document.getElementById("detallesUsuarioReservas");
        tbodyR.innerHTML = "";
        var reservas = data.reservas || [];

        if (!reservas.length) {
          tbodyR.innerHTML = "<tr><td colspan='5'>Sin reservas.</td></tr>";
        } else {
          reservas.forEach(function (r) {
            var tr = document.createElement("tr");
            tr.innerHTML =
              "<td>" + r.Id_Reserva   + "</td>" +
              "<td>Mesa " + r.Numero_Mesa + "</td>" +
              "<td>" + r.Fecha        + "</td>" +
              "<td>" + r.Hora         + "</td>" +
              "<td>" + r.Estado       + "</td>";
            tbodyR.appendChild(tr);
          });
        }

        modalDetallesUsuario.hidden = false;
      })
      .catch(function () { mostrarToastAdmin("Error de red."); });
  }

  // abre el modal de editar usuario y rellena los campos con los data-* del icono
  function abrirEditarUsuario(btn) {
    idUsuarioEnEdicion = btn.dataset.id;
    document.getElementById("eu_nombre").value = btn.dataset.nombre || "";
    document.getElementById("eu_email").value  = btn.dataset.email  || "";
    document.getElementById("eu_rol").value    = (btn.dataset.rol   || "cliente").toLowerCase();
    modalEditarUsuario.hidden = false;
  }

  // boton guardar del modal de editar usuario
  document.getElementById("btnGuardarUsuario").addEventListener("click", function () {
    var nombre = document.getElementById("eu_nombre").value.trim();
    var email  = document.getElementById("eu_email").value.trim();
    var rol    = document.getElementById("eu_rol").value;

    if (!idUsuarioEnEdicion || !nombre || !email) {
      mostrarToastAdmin("Rellena todos los campos.");
      return;
    }

    fetch("../php/actualizarUsuario.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "id_usuario=" + encodeURIComponent(idUsuarioEnEdicion) +
            "&nombre="    + encodeURIComponent(nombre) +
            "&email="     + encodeURIComponent(email)  +
            "&rol="       + encodeURIComponent(rol)
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.ok) {
          modalEditarUsuario.hidden = true;
          idUsuarioEnEdicion = null;
          mostrarToastAdmin("Usuario actualizado correctamente.");
          cargarUsuarios();
        } else {
          mostrarToastAdmin(data.msg || "No se pudo actualizar.");
        }
      })
      .catch(function () { mostrarToastAdmin("Error de red."); });
  });

  // borra un usuario (el php no le deja si tiene reservas asociadas)
  function eliminarUsuario(id) {
    fetch("../php/eliminarUsuario.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "id_usuario=" + encodeURIComponent(id)
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.ok) {
          mostrarToastAdmin("Usuario eliminado.");
          cargarUsuarios();
        } else {
          mostrarToastAdmin(data.msg || "No se pudo eliminar.");
        }
      })
      .catch(function () { mostrarToastAdmin("Error de red."); });
  }

  /* ===== AVISOS POR URL =====
     cuando creamos o editamos un menu, el php redirige con ?menu=ok o ?menu=error
     aqui detectamos eso y enseñamos un toast */
  var params = new URLSearchParams(window.location.search);
  if (params.get("menu") === "ok") {
    mostrarToastAdmin("Menú guardado correctamente.");
    // limpiamos la URL para que si recarga no salga otra vez el aviso
    window.history.replaceState({}, document.title, "admin.html");
  }
  if (params.get("menu") === "error") {
    mostrarToastAdmin("Error: revisa todos los campos.");
    window.history.replaceState({}, document.title, "admin.html");
  }

  // muestra un mensaje en la esquina (toast) durante unos segundos
  function mostrarToastAdmin(texto) {
    var div = document.createElement("div");
    div.className = "toast-reserva";
    div.textContent = texto;
    div.style.setProperty("--toast-duration", TOAST_ADMIN_MS + "ms");
    div.classList.add("toast-reserva--countdown");
    document.body.appendChild(div);
    // pequeño timeout para que se vea la animacion de entrada
    setTimeout(function () {
      div.classList.add("toast-reserva--visible");
    }, 50);
    // y otro para esconderlo y borrarlo del DOM (sino se acumulan)
    setTimeout(function () {
      div.classList.remove("toast-reserva--visible");
      setTimeout(function () { div.remove(); }, 250);
    }, TOAST_ADMIN_MS);
  }
});
