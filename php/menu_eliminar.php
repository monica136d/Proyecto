<?php
// borra un menu desde el panel del admin
// el boton de la papelera de cada fila manda aqui por POST con el id

session_start();
require_once 'db.php';
require_once 'registro_actividad.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../html/admin.html');
    exit();
}

$idMenu = (int) ($_POST['id_menu'] ?? 0);

if ($idMenu < 1) {
    header('Location: ../html/admin.html?menu=error');
    exit();
}

// borramos el menu
$stmt = $pdo->prepare('DELETE FROM menu WHERE Id_Menu = ?');
$stmt->execute([$idMenu]);

// lo guardamos en el historial
registrarActividad($pdo, 'menu_eliminado', 'Menú #' . $idMenu . ' eliminado');

header('Location: ../html/admin.html?menu=ok');
exit();
