<?php
// saca los ultimos 20 eventos del historial para el bloque "Actividad reciente" del admin

session_start();
require_once 'db.php';
header('Content-Type: application/json; charset=utf-8');

// los mas nuevos primero
$stmt = $pdo->query(
    "SELECT Tipo, Mensaje, FechaHora
     FROM actividad_reciente
     ORDER BY FechaHora DESC
     LIMIT 20"
);

echo json_encode([
    'ok'      => true,
    'eventos' => $stmt->fetchAll(PDO::FETCH_ASSOC),
]);
