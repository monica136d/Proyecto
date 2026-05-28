<?php
// este archivo lo llama el javascript para saber si hay alguien logueado
// devuelve un json con loggedIn, rol y nombre
// asi en el header podemos esconder o mostrar Login, Cerrar sesion y Admin

session_start();
require_once 'db.php';
header('Content-Type: application/json; charset=utf-8');

$loggedIn = false;

if (isset($_SESSION['usuario_id'])) {
    // miramos que el usuario siga existiendo en la base de datos
    // (por si el admin lo borro mientras estaba logueado)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM usuario WHERE Id_Usuario = :id");
    $stmt->execute([':id' => $_SESSION['usuario_id']]);

    if ((int)$stmt->fetchColumn() === 1) {
        $loggedIn = true;
    } else {
        // no existe ya, le cerramos la sesion
        session_unset();
        session_destroy();
    }
}

echo json_encode([
    'loggedIn' => $loggedIn,
    'rol' => $loggedIn ? ($_SESSION['rol'] ?? null) : null,
    'nombre' => $loggedIn ? ($_SESSION['nombre'] ?? null) : null,
]);
