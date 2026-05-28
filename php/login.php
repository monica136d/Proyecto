<?php
// login del usuario
// recoge el nombre y la contraseña del formulario y mira si esta en la base de datos
// si esta bien guardamos los datos en la sesion para que la web sepa quien es

session_start();
require_once 'db.php'; // conexion a la base de datos

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // cogemos lo que ha escrito el usuario en el formulario
    $nombre_escrito = $_POST['usuario'];
    $password_escrita = $_POST['password'];

    // buscamos en la tabla usuario por el nombre
    $stmt = $pdo->prepare("SELECT * FROM usuario WHERE Nombre = ?");
    $stmt->execute([$nombre_escrito]);
    $user = $stmt->fetch();

    // si existe el usuario miramos si la contraseña coincide
    // password_verify lo usamos porque las guardamos cifradas con password_hash
    if ($user && password_verify($password_escrita, $user['Password'])) {

        // login bien, guardamos los datos en la sesion
        $_SESSION['usuario_id'] = $user['Id_Usuario'];
        $_SESSION['nombre']     = $user['Nombre'];
        $_SESSION['rol']        = $user['Rol'];
        $_SESSION['email']      = $user['Email'] ?? '';

        // si es admin lo mandamos al panel y si no a reservar
        if ($user['Rol'] == 'admin') {
            header("Location: ../html/admin.html");
        } else {
            header("Location: ../html/reservar.html");
        }
        exit();

    } else {
        // si no coincide nada avisamos con un alert
        echo "<script>alert('Usuario o contraseña incorrectos'); window.location.href='../html/login.html';</script>";
    }
}
