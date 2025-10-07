import axiosInstance from "../../../../core/infrastructure/http/axiosInstance";

export const login = async (username: string, password: string) => {
  try {
    const response = await axiosInstance.post("/users/login/", {
      username,
      password,
    });

    const data = response.data;
    //console.log('Login response:', data);

    // Si requiere 2FA
    if (data.require_2fa) {
      return {
        require_2fa: true,
        temp_token: data.temp_token,
        message: data.message
      };
    }

    // Si no requiere 2FA, guardamos los tokens y datos del usuario
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return {
      user: data.user,
      token: data.access
    };
  } catch (error: any) {
    //console.error('Login error:', error.response?.data);
    throw new Error(error.response?.data?.detail || 'Error en el inicio de sesión');
  }
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

export const requestPasswordReset = async (email: string) => {
  try {
    const response = await axiosInstance.post("/users/password-reset/", { 
      email,
      // Asegúrate de que el frontend base_url esté configurado correctamente
      reset_url: `${window.location.origin}/auth/reset-password` 
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Error al solicitar el reset de contraseña');
  }
};

export const resetPassword = async (userId: string, token: string, password: string) => {
  try {
    return await axiosInstance.post(`/users/password-reset-confirm/${userId}/${token}/`, {
      password
    });
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Error al restablecer la contraseña');
  }
};

export const enable2FA = async () => {
  try {
    const response = await axiosInstance.post("/users/2fa/toggle/", {
      enable_2fa: true
    });
    
    //console.log('Enable 2FA response:', response.data);
    
    // Guardamos el estado temporal
    if (response.data.temp_token) {
      localStorage.setItem('temp_2fa_token', response.data.temp_token);
    }
    
    return response.data;
  } catch (error: any) {
    //console.error('Enable 2FA error:', error.response?.data);
    throw new Error(error.response?.data?.detail || 'Error al activar 2FA');
  }
};

export const verify2FA = async ({ code, temp_token }: { code: string, temp_token: string }) => {
  try {
    const response = await axiosInstance.post("/users/verify-otp/", {
      temp_token,
      otp_code: code
    });

    const data = response.data;
    //console.log('Verify 2FA response:', data);

    // Guardamos los tokens y datos del usuario después de verificación exitosa
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  } catch (error: any) {
    //console.error('Verify 2FA error:', error.response?.data);
    throw new Error(error.response?.data?.error || 'Error en la verificación 2FA');
  }
};

export const toggle2FA = async () => {
  try {
    const response = await axiosInstance.post("/users/2fa/toggle/");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Error al cambiar estado de 2FA');
  }
};

export const disable2FA = async () => {
  try {
    const response = await axiosInstance.post("/users/2fa/toggle/", {
      enable_2fa: false
    });
    
    // Actualizamos el estado del usuario en localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({
      ...currentUser,
      is_2fa_enabled: false
    }));

    return response.data;
  } catch (error: any) {
    //console.error('Disable 2FA error:', error.response?.data);
    throw new Error(error.response?.data?.detail || 'Error al desactivar 2FA');
  }
};

export const getProfile = async () => {
  const response = await axiosInstance.get("/users/me/");
  // Actualiza localStorage para mantener sincronizado el usuario
  localStorage.setItem("user", JSON.stringify(response.data));
  return response.data;
};

export const updateProfile = async (data: any, isMultipart = false) => {
  const config = isMultipart
    ? { headers: { "Content-Type": "multipart/form-data" } }
    : {};
  // Cambia put por patch aquí:
  const response = await axiosInstance.patch("/users/me/", data, config);
  localStorage.setItem("user", JSON.stringify(response.data));
  return response.data;
};

export const changePassword = async ({
  current_password,
  new_password,
}: {
  current_password: string;
  new_password: string;
}) => {
  try {
    const response = await axiosInstance.post("/users/change-password/", {
      current_password,
      new_password,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail ||
        error.response?.data?.error ||
        "Error al cambiar la contraseña"
    );
  }
};
