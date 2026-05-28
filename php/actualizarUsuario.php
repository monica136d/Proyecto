<?php
// el admin edita un usuario (nombre, email o rol)
// validamos los campos y hacemos un UPDATE en la tabla usuario

session_start();
require_once 'db.php';
require_once 'registro_actividad.php';
header('Content-Type: application/json; charset=utf-8');

$id     = (int)trim($_POST['id_usuario'] ?? 0);
$nombre = trim($_POST['nombre']          ?? '');
$email  = trim($_POST['email']           ?? '');
$rol    = trim($_POST['rol']             ?? '');

// si falta algo no seguimos
if ($id < 1 || $nombre === '' || $email === '' || $rol === '') {
    echo json_encode(['ok' => false, 'msg' => 'Todos los campos son obligatorios']);
    exit();
}

// el email tiene que tener formato bueno
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['ok' => false, 'msg' => 'Email no válido']);
    exit();
}

// solo dejamos admin o cliente como rol
$rolesPermitidos = ['admin', 'cliente'];
if (!in_array($rol, $rolesPermitidos, true)) {
    echo json_encode(['ok' => false, 'msg' => 'Rol no válido']);
    exit();
}

try {
    // miramos que el email no lo este usando ya OTRO usuario distinto
    $chk = $pdo->prepare(
        "SELECT 1 FROM usuario WHERE Email = :email AND Id_Usuario != :id LIMIT 1"
    );
    $chk->execute([':email' => $email, ':id' => $id]);
    if ($chk->fetch()) {
        echo json_encode(['ok' => false, 'msg' => 'Ese email ya está en uso por otro usuario']);
        exit();
    }

    // actualizamos los datos del usuario
    $up = $pdo->prepare(
        "UPDATE usuario SET Nombre = :nombre, Email = :email, Rol = :rol
         WHERE Id_Usuario = :id"
    );
    $up->execute([
        ':nombre' => $nombre,
        ':email'  => $email,
        ':rol'    => $rol,
        ':id'     => $id,
    ]);

    // lo guardamos en el historial de actividad
    registrarActividad($pdo, 'usuario_editado',
        'Usuario editado: ' . $nombre . ' (' . $email . '), rol: ' . $rol);

    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    echo json_encode(['ok' => false, 'msg' => 'Error de servidor']);
}
