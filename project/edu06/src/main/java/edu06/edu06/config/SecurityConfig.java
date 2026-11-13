
package edu06.edu06.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import edu06.edu06.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder);

        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AuthenticationProvider authenticationProvider,
            JwtAuthenticationFilter jwtAuthenticationFilter)
            throws Exception {

        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authenticationProvider(authenticationProvider)

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            )

            .authorizeHttpRequests(auth -> auth

                // =====================================
                // ĐĂNG NHẬP, ĐĂNG KÝ
                // =====================================

                .requestMatchers("/api/auth/**").permitAll()

                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()


                // =====================================
                // SINH VIÊN
                // =====================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/sinh-vien/ho-so"
                ).hasRole("SINH_VIEN")

                .requestMatchers("/api/sinh-vien/**")
                    .hasRole("SINH_VIEN")


                // =====================================
                // SINH VIÊN QUẢN LÝ NHẬT KÝ
                // =====================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/nhat-ky/cua-toi",
                    "/api/nhat-ky/qua-trinh/*"
                ).hasRole("SINH_VIEN")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/nhat-ky/*"
                ).hasRole("SINH_VIEN")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/nhat-ky/*"
                ).hasRole("SINH_VIEN")

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/nhat-ky/*"
                ).hasRole("SINH_VIEN")


                // =====================================
                // SINH VIÊN QUẢN LÝ MINH CHỨNG
                // =====================================

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/minh-chung/nhat-ky/*"
                ).hasRole("SINH_VIEN")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/minh-chung/nhat-ky/*",
                    "/api/minh-chung/*",
                    "/api/minh-chung/*/tai-xuong"
                ).hasRole("SINH_VIEN")

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/minh-chung/*"
                ).hasRole("SINH_VIEN")


                // =====================================
                // BÁO CÁO THỰC TẬP
                // =====================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/bao-cao/qua-trinh/*",
                    "/api/bao-cao/*",
                    "/api/bao-cao/*/tai-xuong"
                ).hasAnyRole(
                    "SINH_VIEN",
                    "GIANG_VIEN",
                    "DOANH_NGHIEP"
                )

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/bao-cao/qua-trinh/*"
                ).hasRole("SINH_VIEN")

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/bao-cao/*"
                ).hasRole("SINH_VIEN")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/bao-cao/*/duyet",
                    "/api/bao-cao/*/tu-choi"
                ).hasRole("GIANG_VIEN")


                // =====================================
                // ĐỐI SOÁT ĐÁNH GIÁ
                // =====================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/doi-soat-danh-gia/giang-vien",
                    "/api/doi-soat-danh-gia/qua-trinh/*"
                ).hasRole("GIANG_VIEN")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/doi-soat-danh-gia/qua-trinh/*"
                ).hasRole("GIANG_VIEN")


                // =====================================
                // SINH VIÊN ĐĂNG KÝ THỰC TẬP
                // =====================================

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/dang-ky-thuc-tap"
                ).hasRole("SINH_VIEN")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/dang-ky-thuc-tap/cua-toi"
                ).hasRole("SINH_VIEN")


                // =====================================
                // SINH VIÊN ĐĂNG KÝ GIẢNG VIÊN
                // =====================================

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/dang-ky-giang-vien"
                ).hasRole("SINH_VIEN")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/dang-ky-giang-vien/cua-toi",
                    "/api/dang-ky-giang-vien/da-duyet"
                ).hasRole("SINH_VIEN")


                // =====================================
                // GIẢNG VIÊN XỬ LÝ YÊU CẦU ĐĂNG KÝ
                // =====================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/dang-ky-giang-vien/cua-giang-vien"
                ).hasRole("GIANG_VIEN")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/dang-ky-giang-vien/*/duyet",
                    "/api/dang-ky-giang-vien/*/tu-choi"
                ).hasRole("GIANG_VIEN")

                .requestMatchers("/api/dang-ky-giang-vien/**")
                    .hasAnyRole("SINH_VIEN", "GIANG_VIEN")


                // =====================================
                // DOANH NGHIỆP QUẢN LÝ VỊ TRÍ THỰC TẬP
                // =====================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/vi-tri-thuc-tap/doanh-nghiep"
                ).hasRole("DOANH_NGHIEP")


                // =====================================
                // DOANH NGHIỆP THEO DÕI QUÁ TRÌNH THỰC TẬP
                // =====================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/qua-trinh-thuc-tap/doanh-nghiep"
                ).hasRole("DOANH_NGHIEP")


                // =====================================
                // GIẢNG VIÊN THEO DÕI QUÁ TRÌNH THỰC TẬP
                // =====================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/qua-trinh-thuc-tap/giang-vien"
                ).hasRole("GIANG_VIEN")


                // =====================================
                // GIẢNG VIÊN XEM NHẬT KÝ VÀ MINH CHỨNG
                // =====================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/nhat-ky/giang-vien/qua-trinh/*"
                ).hasRole("GIANG_VIEN")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/minh-chung/giang-vien/nhat-ky/*",
                    "/api/minh-chung/giang-vien/*/tai-xuong"
                ).hasRole("GIANG_VIEN")


                // =====================================
                // GIẢNG VIÊN ĐÁNH GIÁ SINH VIÊN
                // =====================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/danh-gia/giang-vien",
                    "/api/danh-gia/qua-trinh/*"
                ).hasRole("GIANG_VIEN")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/danh-gia/qua-trinh/*"
                ).hasRole("GIANG_VIEN")


                // =====================================
                // GIẢNG VIÊN XÁC NHẬN KẾT QUẢ
                // =====================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/ket-qua/giang-vien",
                    "/api/ket-qua/qua-trinh/*"
                ).hasRole("GIANG_VIEN")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/ket-qua/qua-trinh/*/xac-nhan"
                ).hasRole("GIANG_VIEN")


                // =====================================
                // DOANH NGHIỆP XỬ LÝ ĐĂNG KÝ THỰC TẬP
                // =====================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/dang-ky-thuc-tap/doanh-nghiep"
                ).hasRole("DOANH_NGHIEP")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/dang-ky-thuc-tap/*/chap-nhan",
                    "/api/dang-ky-thuc-tap/*/tu-choi"
                ).hasRole("DOANH_NGHIEP")


                // =====================================
                // DOANH NGHIỆP THEO DÕI THỰC TẬP
                // =====================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/doanh-nghiep/thuc-tap",
                    "/api/doanh-nghiep/thuc-tap/**",
                    "/api/minh-chung/doanh-nghiep/**"
                ).hasRole("DOANH_NGHIEP")


                // =====================================
                // DOANH NGHIỆP ĐÁNH GIÁ SINH VIÊN
                // =====================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/danh-gia/doanh-nghiep",
                    "/api/danh-gia/doanh-nghiep/**"
                ).hasRole("DOANH_NGHIEP")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/danh-gia/doanh-nghiep/**"
                ).hasRole("DOANH_NGHIEP")


                // =====================================
                // DOANH NGHIỆP QUẢN LÝ HỒ SƠ
                // =====================================

                .requestMatchers("/api/doanh-nghiep/**")
                    .hasRole("DOANH_NGHIEP")


                // =====================================
                // GIẢNG VIÊN
                // =====================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/giang-vien/danh-sach"
                ).hasAnyRole("SINH_VIEN", "GIANG_VIEN")

                .requestMatchers("/api/giang-vien/**")
                    .hasRole("GIANG_VIEN")


                // =====================================
                // CÁC API CÒN LẠI
                // =====================================

                .anyRequest().authenticated()
            );

        return http.build();
    }


    // =====================================
    // CORS
    // =====================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
            List.of("http://localhost:5173")
        );

        configuration.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
            )
        );

        configuration.setAllowedHeaders(
            List.of(
                "Authorization",
                "Content-Type"
            )
        );

        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
