<?php
// saca la lista de todos los usuarios para la tabla del admin
// devuelve un json con id, nombre, email y rol

session_start();
require_once 'db.php';
header('Content-Type: application/json; charset=utf-8');

// los pedimos ordenados por id de usuario
$stmt = $pdo->query(
    "SELECT Id_Usuario, Nombre, Email, Rol
     FROM usuario
     ORDER BY Id_Usuario ASC"
);

echo json_encode([
    'ok'       => true,
    'usuarios' => $stmt->fetchAll(PDO::FETCH_ASSOC),
]);
