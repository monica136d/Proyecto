<?php
// devuelve los datos de un usuario y sus reservas
// se usa cuando el admin pulsa "ver detalles" en la tabla de usuarios

session_start();
require_once 'db.php';
header('Content-Type: application/json; charset=utf-8');

$id = (int)($_GET['id_usuario'] ?? 0);

// si el id no es valido salimos directamente
if ($id < 1) {
    echo json_encode(['ok' => false, 'msg' => 'id_usuario inválido']);
    exit();
}

// datos del usuario
$stmtU = $pdo->prepare(
    "SELECT Id_Usuario, Nombre, Email, Rol
     FROM usuario
     WHERE Id_Usuario = :id"
);
$stmtU->execute([':id' => $id]);
$usuario = $stmtU->fetch(PDO::FETCH_ASSOC);

if (!$usuario) {
    echo json_encode(['ok' => false, 'msg' => 'Usuario no encontrado']);
    exit();
}

// reservas del usuario, las ultimas primero
$stmtR = $pdo->prepare(
    "SELECT r.Id_Reserva,
            m.Numero_Mesa,
            r.Fecha,
            TIME_FORMAT(r.Hora, '%H:%i') AS Hora,
            r.Estado
     FROM reserva r
     INNER JOIN mesa m ON m.Id_Mesa = r.Id_Mesa
     WHERE r.Id_Usuario = :id
     ORDER BY r.Fecha DESC, r.Hora DESC"
);
$stmtR->execute([':id' => $id]);

echo json_encode([
    'ok'       => true,
    'usuario'  => $usuario,
    'reservas' => $stmtR->fetchAll(PDO::FETCH_ASSOC),
]);
