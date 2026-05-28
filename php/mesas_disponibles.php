<?php
// devuelve las mesas libres para reservar.html (la pagina del cliente)
// es como getMesasLibres pero con capacidad y filtrando segun el numero de comensales
// si la mesa sola no llega, marcamos Requiere_Segunda_Mesa = true para juntarla con otra

session_start();
require_once 'db.php';
header('Content-Type: application/json; charset=utf-8');

$fecha = $_GET['fecha'] ?? '';
$hora  = $_GET['hora']  ?? '';
$comensales = (int)($_GET['comensales'] ?? 0);

if ($fecha === '' || $hora === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'msg' => 'Faltan fecha u hora']);
    exit();
}

// sacamos todas las mesas que no estan en una reserva activa de esa fecha/hora
$sql = "SELECT m.Id_Mesa, m.Numero_Mesa, m.Capacidad
        FROM mesa m
        WHERE m.Id_Mesa NOT IN (
            SELECT rm.Id_Mesa
            FROM reserva r
            INNER JOIN reserva_mesa rm ON rm.Id_Reserva = r.Id_Reserva
            WHERE r.Fecha = :fecha
              AND r.Hora  = :hora
              AND r.Estado != 'cancelada'
        )
        ORDER BY m.Numero_Mesa ASC";

$stmt = $pdo->prepare($sql);
$stmt->execute([':fecha' => $fecha, ':hora' => $hora]);
$mesasLibres = $stmt->fetchAll(PDO::FETCH_ASSOC);

// si nos dicen cuantos comensales son, filtramos las mesas que valen
if ($comensales > 0) {
    $filtradas = [];
    foreach ($mesasLibres as $m1) {
        $cap1 = (int)$m1['Capacidad'];
        $requiereSegunda = false;
        $esValida = false;

        // la mesa vale si tiene la capacidad justa o como mucho 1 mas que los comensales.
        // asi una pareja no se sienta en mesa de 4 ni 3 personas en mesa de 6
        if ($cap1 >= $comensales && $cap1 <= $comensales + 1) {
            $esValida = true;
        } else {
            // si no, miramos si juntandola con otra mesa libre llega
            foreach ($mesasLibres as $m2) {
                if ((int)$m2['Id_Mesa'] === (int)$m1['Id_Mesa']) continue;
                if ($cap1 + (int)$m2['Capacidad'] >= $comensales) {
                    $esValida = true;
                    $requiereSegunda = true;
                    break;
                }
            }
        }

        if ($esValida) {
            // marcamos si necesita juntar dos mesas para avisar al usuario
            $m1['Requiere_Segunda_Mesa'] = $requiereSegunda;
            $filtradas[] = $m1;
        }
    }
    $mesasLibres = $filtradas;
}

echo json_encode([
    'ok'    => true,
    'mesas' => $mesasLibres,
]);
