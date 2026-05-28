<?php
// dice que mesas estan libres en una fecha y hora
// se usa en el panel del admin cuando edita una reserva
// si mandan id_reserva, esa mesa no la contamos como ocupada (es la propia reserva)

require_once 'db.php';
header('Content-Type: application/json; charset=utf-8');

$fecha     = trim($_GET['fecha']      ?? '');
$hora      = trim($_GET['hora']       ?? '');
$idReserva = (int)($_GET['id_reserva'] ?? 0);

if ($fecha === '' || $hora === '') {
    echo json_encode(['ok' => false, 'msg' => 'Fecha y hora requeridas']);
    exit();
}

// sacamos las mesas que NO estan en ninguna reserva activa de ese dia/hora
$sql = "SELECT m.Id_Mesa, m.Numero_Mesa
        FROM mesa m
        WHERE m.Id_Mesa NOT IN (
          SELECT rm.Id_Mesa
          FROM reserva r
          INNER JOIN reserva_mesa rm ON rm.Id_Reserva = r.Id_Reserva
          WHERE r.Fecha    = :fecha
            AND r.Hora     = :hora
            AND r.Estado  != 'cancelada'
            AND (:id_reserva = 0 OR r.Id_Reserva != :id_reserva2)
        )
        ORDER BY m.Numero_Mesa ASC";

$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':fecha'       => $fecha,
    ':hora'        => $hora,
    ':id_reserva'  => $idReserva,
    ':id_reserva2' => $idReserva,
]);

echo json_encode([
    'ok'    => true,
    'mesas' => $stmt->fetchAll(PDO::FETCH_ASSOC),
]);
