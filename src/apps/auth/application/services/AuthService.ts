import axiosInstance from "../../../../core/infrastructure/http/axiosInstance";

export class AuthService {
  static async login(username: string, password: string) {
    const response = await axiosInstance.post("/token/", {
      username,
      password,
    });
    return response.data;
  }
}
