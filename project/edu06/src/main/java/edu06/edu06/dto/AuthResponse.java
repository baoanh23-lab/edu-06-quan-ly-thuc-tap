
package edu06.edu06.dto;

public class AuthResponse {

    private String username;
    private String vaiTro;
    private String message;
    private String token;

    public AuthResponse() {
    }

    public AuthResponse(
            String username,
            String vaiTro,
            String message,
            String token) {
        this.username = username;
        this.vaiTro = vaiTro;
        this.message = message;
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public String getVaiTro() {
        return vaiTro;
    }

    public String getMessage() {
        return message;
    }

    public String getToken() {
        return token;
    }
}