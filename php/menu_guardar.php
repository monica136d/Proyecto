<?php
// crea un menu nuevo desde el panel del admin
// guarda en la tabla menu y tambien en detalle_menu con su plato y vino
// si algo falla deshacemos los cambios (rollback)

session_start();
require_once 'db.php';
require_once 'registro_actividad.php';

// si entra alguien sin formulario lo mandamos al admin
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../html/admin.html');
    exit();
}

// cogemos los datos del formulario
$nombre     = trim($_POST['nombre']      ?? '');
$temporada  = trim($_POST['temporada']   ?? '');
$imagenRuta = trim($_POST['imagen_ruta'] ?? '');
$idPlato    = (int) trim((string) ($_POST['id_plato'] ?? ''));
$idVino     = (int) trim((string) ($_POST['id_vino'] ?? ''));

// si falta algo o es invalido lo mandamos con error
if ($nombre === '' || $temporada === '' || $imagenRuta === '' || $idPlato < 1 || $idVino < 1) {
    header('Location: ../html/admin.html?menu=error');
    exit();
}

try {
    // empezamos transaccion para que si algo falla no se quede a medias
    $pdo->beginTransaction();

    // metemos el menu y guardamos su id
    $stmt = $pdo->prepare('INSERT INTO menu (Nombre, Temporada, Imagen_Ruta) VALUES (?, ?, ?)');
    $stmt->execute([$nombre, $temporada, $imagenRuta]);
    $idMenuNuevo = (int) $pdo->lastInsertId();

    // metemos el detalle (plato y vino)
    $stmtDetalle = $pdo->prepare('INSERT INTO detalle_menu (Id_Menu, Id_Plato, Id_Vino) VALUES (?, ?, ?)');
    $stmtDetalle->execute([$idMenuNuevo, $idPlato, $idVino]);

    // confirmamos los cambios y registramos en el historial
    $pdo->commit();
    registrarActividad($pdo, 'menu_creado', 'Menú creado: ' . $nombre . ' (' . $temporada . ')');
    header('Location: ../html/admin.html?menu=ok');
    exit();

} catch (Exception $e) {
    // si algo peta deshacemos los cambios
    if ($pdo->inTransaction()) $pdo->rollBack();
    header('Location: ../html/admin.html?menu=error');
    exit();
}
