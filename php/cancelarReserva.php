<?php
// elimina una reserva del sistema (DELETE real)
// las FK con ON DELETE CASCADE limpian solas las filas asociadas
// en reserva_mesa y reserva_menu, asi no quedan datos sueltos

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
    // borramos la reserva. los registros de reserva_mesa y reserva_menu
    // se borran automaticamente por las FK con ON DELETE CASCADE
    $del = $pdo->prepare("DELETE FROM reserva WHERE Id_Reserva = :id");
    $del->execute([':id' => $idReserva]);

    // si no se borro nada es que el id no existia
    if ($del->rowCount() === 0) {
        echo json_encode(['ok' => false, 'msg' => 'La reserva no existe']);
        exit();
    }

    // lo apuntamos en actividad reciente
    registrarActividad($pdo, 'reserva_eliminada', 'Reserva #' . $idReserva . ' eliminada');
    echo json_encode(['ok' => true]);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'msg' => 'Error de servidor']);
}
