export function validateNewPassword(password: string): string | null {
    if (password.length < 8) {
        return "La contraseña debe tener al menos 8 caracteres.";
    }
    if (!/[A-Z]/.test(password)) {
        return "La contraseña debe tener al menos una letra mayúscula.";
    }
    if (!/[a-z]/.test(password)) {
        return "La contraseña debe tener al menos una letra minúscula.";
    }
    if (!/[0-9]/.test(password)) {
        return "La contraseña debe tener al menos un número.";
    }
    // Si quieres un carácter especial:
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return "La contraseña debe tener al menos un carácter especial.";
    }
    return null;
}