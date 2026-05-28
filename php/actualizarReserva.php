<?php
// edita una reserva desde el panel del admin
// se puede usar de dos formas:
//   1) cambiar mesa + fecha + hora (y estado si lo mandan)
//   2) solo cambiar el estado (boton confirmar o cancelar rapido)
// siempre devuelve un json para el javascript del admin

session_start();
require_once 'db.php';
require_once 'registro_actividad.php';
header('Content-Type: application/json; charset=utf-8');

// datos que mandan por POST
$idReserva = (int)($_POST['id_reserva'] ?? 0);
$estado    = trim($_POST['estado']      ?? '');
$idMesa    = (int)($_POST['id_mesa']    ?? 0);
$fecha     = trim($_POST['fecha']       ?? '');
$hora      = trim($_POST['hora']        ?? '');

if ($idReserva < 1) {
    echo json_encode(['ok' => false, 'msg' => 'id_reserva inválido']);
    exit();
}

// estados validos para la reserva
$permitidos = ['pendiente', 'confirmada', 'cancelada'];

try {
    // CASO 1: edicion completa (mesa + fecha + hora, estado opcional)
    if ($idMesa > 0 && $fecha !== '' && $hora !== '') {

        // si viene un estado nos aseguramos de que sea valido
        if ($estado !== '' && !in_array($estado, $permitidos, true)) {
            echo json_encode(['ok' => false, 'msg' => 'Estado inválido']);
            exit();
        }

        // miramos que la mesa no este ya cogida ese dia y hora por otra reserva
        $sqlChk = "SELECT 1
                   FROM reserva r
                   INNER JOIN reserva_mesa rm ON rm.Id_Reserva = r.Id_Reserva
                   WHERE rm.Id_Mesa   = :mesa
                     AND r.Fecha      = :fecha
                     AND r.Hora       = :hora
                     AND r.Estado    != 'cancelada'
                     AND r.Id_Reserva != :id
                   LIMIT 1";
        $chk = $pdo->prepare($sqlChk);
        $chk->execute([
            ':mesa'  => $idMesa,
            ':fecha' => $fecha,
            ':hora'  => $hora,
            ':id'    => $idReserva,
        ]);

        if ($chk->fetch()) {
            echo json_encode(['ok' => false, 'msg' => 'Mesa ocupada en esa fecha y hora']);
            exit();
        }

        // si han mandado estado lo metemos tambien en el UPDATE
        if ($estado !== '') {
            $up = $pdo->prepare("UPDATE reserva
                                  SET Id_Mesa = :mesa, Fecha = :fecha, Hora = :hora, Estado = :estado
                                  WHERE Id_Reserva = :id");
            $up->execute([
                ':mesa'   => $idMesa,
                ':fecha'  => $fecha,
                ':hora'   => $hora,
                ':estado' => $estado,
                ':id'     => $idReserva,
            ]);
        } else {
            // si no, dejamos el estado como estaba
            $up = $pdo->prepare("UPDATE reserva
                                  SET Id_Mesa = :mesa, Fecha = :fecha, Hora = :hora
                                  WHERE Id_Reserva = :id");
            $up->execute([
                ':mesa'  => $idMesa,
                ':fecha' => $fecha,
                ':hora'  => $hora,
                ':id'    => $idReserva,
            ]);
        }

        // actualizamos tambien reserva_mesa, borramos las viejas y metemos la nueva
        $pdo->prepare("DELETE FROM reserva_mesa WHERE Id_Reserva = :id")
            ->execute([':id' => $idReserva]);
        $pdo->prepare("INSERT INTO reserva_mesa (Id_Reserva, Id_Mesa) VALUES (:id, :mesa)")
            ->execute([':id' => $idReserva, ':mesa' => $idMesa]);

        registrarActividad($pdo, 'reserva_editada',
            'Reserva #' . $idReserva . ' editada: Mesa ' . $idMesa .
            ', ' . $fecha . ' a las ' . substr($hora, 0, 5));

        echo json_encode(['ok' => true]);
        exit();
    }

    // CASO 2: solo cambiar el estado (boton confirmar/cancelar rapido)
    if ($estado !== '') {
        if (!in_array($estado, $permitidos, true)) {
            echo json_encode(['ok' => false, 'msg' => 'Estado inválido']);
            exit();
        }
        $up = $pdo->prepare("UPDATE reserva SET Estado = :estado WHERE Id_Reserva = :id");
        $up->execute([':estado' => $estado, ':id' => $idReserva]);

        // segun el estado nuevo guardamos un tipo u otro en actividad
        $tipo = ($estado === 'confirmada') ? 'reserva_confirmada' : 'reserva_cancelada';
        registrarActividad($pdo, $tipo,
            'Reserva #' . $idReserva . ' marcada como ' . $estado);

        echo json_encode(['ok' => true]);
        exit();
    }

    // si no entra en ningun caso es que faltaban datos
    echo json_encode(['ok' => false, 'msg' => 'Datos incompletos']);

} catch (Exception $e) {
    echo json_encode(['ok' => false, 'msg' => 'Error de servidor']);
}
