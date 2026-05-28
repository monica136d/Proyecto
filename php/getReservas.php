<?php
// devuelve todas las reservas para la tabla del admin
// junta el usuario y la mesa con JOIN, y con GROUP_CONCAT mete todas las mesas
// asignadas en una sola columna (porque una reserva puede usar 1 o 2 mesas)
// las mas nuevas salen primero

session_start();
require_once 'db.php';
header('Content-Type: application/json; charset=utf-8');

$sql = "SELECT
          r.Id_Reserva,
          r.Id_Usuario,
          u.Nombre,
          u.Email,
          r.Id_Mesa,
          m.Numero_Mesa,
          GROUP_CONCAT(DISTINCT m2.Numero_Mesa ORDER BY m2.Numero_Mesa SEPARATOR ', ') AS Mesas_Asignadas,
          r.Fecha,
          TIME_FORMAT(r.Hora, '%H:%i:%s') AS Hora,
          r.Num_Personas,
          r.Estado,
          r.Observaciones
        FROM reserva r
        INNER JOIN usuario u ON u.Id_Usuario = r.Id_Usuario
        INNER JOIN mesa    m ON m.Id_Mesa    = r.Id_Mesa
        LEFT JOIN reserva_mesa rm ON rm.Id_Reserva = r.Id_Reserva
        LEFT JOIN mesa m2 ON m2.Id_Mesa = rm.Id_Mesa
        GROUP BY
          r.Id_Reserva, r.Id_Usuario, u.Nombre, u.Email,
          r.Id_Mesa, m.Numero_Mesa, r.Fecha, r.Hora,
          r.Num_Personas, r.Estado, r.Observaciones
        ORDER BY r.Fecha DESC, r.Hora DESC, r.Id_Reserva DESC";

$stmt = $pdo->query($sql);

echo json_encode([
    'ok'       => true,
    'reservas' => $stmt->fetchAll(PDO::FETCH_ASSOC),
]);
