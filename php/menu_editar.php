<?php
// edita un menu que ya existe
// si dejamos algun campo en blanco mantenemos lo de antes (edicion parcial)
// tambien se puede cambiar la descripcion del plato y el nombre del vino

session_start();
require_once 'db.php';
require_once 'registro_actividad.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../html/admin.html');
    exit();
}

// cogemos los datos del formulario
$idMenu     = (int)($_POST['id_menu']    ?? 0);
$nombre     = trim($_POST['nombre']      ?? '');
$temporada  = trim($_POST['temporada']   ?? '');
$imagenRuta = trim($_POST['imagen_ruta'] ?? '');
$descPlato  = trim($_POST['desc_plato']  ?? '');
$nombreVino = trim($_POST['nombre_vino'] ?? '');
$idPlato    = (int) trim((string) ($_POST['id_plato'] ?? ''));
$idVino     = (int) trim((string) ($_POST['id_vino'] ?? ''));

if ($idMenu < 1) {
    header('Location: ../html/admin.html?menu=error');
    exit();
}

try {
    $pdo->beginTransaction();

    // pedimos los datos actuales del menu para no perder lo que el admin no cambia
    $qryActual = $pdo->prepare("
        SELECT m.Nombre, m.Temporada, m.Imagen_Ruta,
               dm.Id_Plato AS Id_Plato_Actual, dm.Id_Vino AS Id_Vino_Actual,
               p.Descripcion AS Desc_Plato_Actual,
               v.Nombre AS Nombre_Vino_Actual
        FROM menu m
        LEFT JOIN detalle_menu dm
          ON dm.Id_Menu = m.Id_Menu
         AND dm.Id_Plato = (SELECT MIN(x.Id_Plato) FROM detalle_menu x WHERE x.Id_Menu = m.Id_Menu)
        LEFT JOIN plato p ON p.Id_Plato = dm.Id_Plato
        LEFT JOIN vino  v ON v.Id_Vino  = dm.Id_Vino
        WHERE m.Id_Menu = ?
        LIMIT 1
    ");
    $qryActual->execute([$idMenu]);
    $actual = $qryActual->fetch(PDO::FETCH_ASSOC);
    if (!$actual) {
        throw new RuntimeException('menu no encontrado');
    }

    // si en el form viene algo lo usamos, si no dejamos el valor que ya tenia
    $nombreFinal     = ($nombre !== '')     ? $nombre     : (string)($actual['Nombre'] ?? '');
    $temporadaFinal  = ($temporada !== '')  ? $temporada  : (string)($actual['Temporada'] ?? '');
    $imagenRutaFinal = ($imagenRuta !== '') ? $imagenRuta : (string)($actual['Imagen_Ruta'] ?? '');
    $idPlatoActual   = (int)($actual['Id_Plato_Actual'] ?? 0);
    $idVinoActual    = (int)($actual['Id_Vino_Actual'] ?? 0);

    $idPlatoFinal = ($idPlato > 0) ? $idPlato : $idPlatoActual;
    $idVinoFinal  = ($idVino > 0)  ? $idVino  : $idVinoActual;
    if ($idPlatoFinal < 1 || $idVinoFinal < 1) {
        throw new RuntimeException('detalle incompleto');
    }

    // actualizamos el menu
    $updMenu = $pdo->prepare('UPDATE menu SET Nombre=?, Temporada=?, Imagen_Ruta=? WHERE Id_Menu=?');
    $updMenu->execute([$nombreFinal, $temporadaFinal, $imagenRutaFinal, $idMenu]);

    // si ya tenia detalle lo actualizamos, si no lo creamos
    if ($idPlatoActual > 0) {
        $updDet = $pdo->prepare(
            'UPDATE detalle_menu SET Id_Plato = ?, Id_Vino = ? WHERE Id_Menu = ? AND Id_Plato = ?'
        );
        $updDet->execute([$idPlatoFinal, $idVinoFinal, $idMenu, $idPlatoActual]);
    } else {
        $insDet = $pdo->prepare('INSERT INTO detalle_menu (Id_Menu, Id_Plato, Id_Vino) VALUES (?, ?, ?)');
        $insDet->execute([$idMenu, $idPlatoFinal, $idVinoFinal]);
    }

    // si han cambiado la descripcion del plato la actualizamos
    if ($descPlato !== '') {
        $updPlato = $pdo->prepare('UPDATE plato SET Descripcion=? WHERE Id_Plato=?');
        $updPlato->execute([$descPlato, $idPlatoFinal]);
    }

    // y si han cambiado el nombre del vino tambien
    if ($nombreVino !== '') {
        $updVinoNombre = $pdo->prepare('UPDATE vino SET Nombre=? WHERE Id_Vino=?');
        $updVinoNombre->execute([$nombreVino, $idVinoFinal]);
    }

    // confirmamos los cambios y los apuntamos en el historial
    $pdo->commit();
    registrarActividad($pdo, 'menu_editado', 'Menú editado: ' . $nombreFinal . ' (' . $temporadaFinal . ')');
    header('Location: ../html/admin.html?menu=ok');
    exit();

} catch (Exception $e) {
    // si algo falla deshacemos
    if ($pdo->inTransaction()) $pdo->rollBack();
    header('Location: ../html/admin.html?menu=error');
    exit();
}
