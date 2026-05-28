<?php
// borra todo el historial de actividad reciente
// se usa cuando el admin pulsa el boton de vaciar en el panel

session_start();
require_once 'db.php';
header('Content-Type: application/json; charset=utf-8');

try {
    // borramos todos los registros de la tabla
    $stmt = $pdo->prepare("DELETE FROM actividad_reciente");
    $stmt->execute();

    echo json_encode([
        'ok' => true,
        'eliminadas' => $stmt->rowCount()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'ok' => false,
        'msg' => 'Error al vaciar actividad',
        'error' => $e->getMessage()
    ]);
}
