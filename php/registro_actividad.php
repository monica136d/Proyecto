<?php
// funcion para guardar movimientos en el historial
// los demas php la llaman cuando pasa algo importante (crear menu, cancelar reserva, etc)
// asi en el panel del admin sale una lista con todo lo que se ha hecho

function registrarActividad(PDO $pdo, string $tipo, string $mensaje): void {
    try {
        // metemos una fila nueva con el tipo, el mensaje y la fecha actual
        $stmt = $pdo->prepare(
            "INSERT INTO actividad_reciente (Tipo, Mensaje, FechaHora)
             VALUES (:tipo, :mensaje, NOW())"
        );
        $stmt->execute([':tipo' => $tipo, ':mensaje' => $mensaje]);
    } catch (Exception $e) {
        // si falla esto no es grave, lo dejamos pasar para no romper la accion principal
    }
}
