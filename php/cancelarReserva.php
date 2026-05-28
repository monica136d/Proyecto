<?php
// cancela una reserva (no la borra, le pone Estado = cancelada)
// asi queda en el historial y se puede ver luego

session_start();
require_once 'db.php';
require_once 'registro_actividad.php';
header('Content-Type: application/json; charset=utf-8');

$idReserva = (int)($_POST['id_reserva'] ?? 0);

if ($idReserva < 1) {
    echo json_encode(['ok' => false, 'msg' => 'id_reserva inválido']);
    exit();
}

try {
    // ponemos el estado a cancelada
    $up = $pdo->prepare("UPDATE reserva SET Estado = 'cancelada' WHERE Id_Reserva = :id");
    $up->execute([':id' => $idReserva]);
    // y lo apuntamos en actividad reciente
    registrarActividad($pdo, 'reserva_cancelada', 'Reserva #' . $idReserva . ' cancelada');
    echo json_encode(['ok' => true]);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'msg' => 'Error de servidor']);
}
