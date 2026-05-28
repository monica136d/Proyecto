<?php
// aqui registramos un usuario nuevo
// validamos el email, que las dos contraseñas coincidan y que no exista ya el nombre
// la contraseña la guardamos cifrada con password_hash para que no se vea en la base de datos

session_start();
require_once 'db.php';
require_once 'registro_actividad.php';

// si alguien entra aqui sin formulario lo mandamos otra vez al registro
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../html/register.html');
    exit();
}
// cogemos los datos del formulario
$email     = trim($_POST['email']     ?? '');
$usuario   = trim($_POST['usuario']   ?? '');
$password  = $_POST['password']  ?? '';
$password2 = $_POST['password2'] ?? '';

// validaciones para que no se mande cualquier cosa

// si esta vacio uno de los campos
if ($email === '' || $usuario === '' || $password === '') {
    header('Location: ../html/register.html?error=vacio');
    exit();
}

// si el email no tiene formato bueno
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: ../html/register.html?error=email');
    exit();
}

// si las dos contraseñas no son iguales
if ($password !== $password2) {
    header('Location: ../html/register.html?error=password');
    exit();
}

// si la contraseña tiene menos de 6 caracteres
if (strlen($password) < 6) {
    header('Location: ../html/register.html?error=corta');
    exit();
}

try {
    // miramos si ya existe ese nombre de usuario para no repetirlo
    $stmt = $pdo->prepare('SELECT Id_Usuario FROM usuario WHERE Nombre = ?');
    $stmt->execute([$usuario]);

    if ($stmt->fetch()) {
        // ya existe, lo mandamos a registro con error
        header('Location: ../html/register.html?error=existe');
        exit();
    }

    // ciframos la contraseña antes de guardarla
    $hash = password_hash($password, PASSWORD_DEFAULT);

    // insertamos el usuario nuevo, por defecto rol cliente
    $rol = 'cliente';
    $insertar = $pdo->prepare(
        'INSERT INTO usuario (Email, Nombre, Password, Rol) VALUES (?, ?, ?, ?)'
    );
    $insertar->execute([$email, $usuario, $hash, $rol]);

    registrarActividad($pdo, 'usuario_nuevo', 'Nuevo usuario registrado: ' . $usuario);

    // lo mandamos al login para que entre con su cuenta nueva
    header('Location: ../html/login.html?registro=ok');
    exit();

} catch (PDOException $e) {
    // si peta la base de datos
    header('Location: ../html/register.html?error=bd');
    exit();
}
