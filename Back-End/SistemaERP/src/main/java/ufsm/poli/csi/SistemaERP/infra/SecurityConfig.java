package ufsm.poli.csi.SistemaERP.infra;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import ufsm.poli.csi.SistemaERP.infra.AutenticacaoFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final AutenticacaoFilter autenticacaoFilter;
    public SecurityConfig(AutenticacaoFilter filtro) {
        this.autenticacaoFilter = filtro;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> {})
                .csrf(csrf-> csrf.disable())
                .sessionManagement(sm-> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth->
                        auth
                                // Endpoints para usuários
                                .requestMatchers(HttpMethod.POST, "/api/login").permitAll()
                                .requestMatchers(HttpMethod.POST, "/usuario/cadastrar")
                                    .permitAll()
                                .requestMatchers(HttpMethod.GET, "/usuario/listar")
                                    .hasAnyAuthority("administrador", "presidente")
                                .requestMatchers(HttpMethod.PUT, "/usuario/atualizarUsuario")
                                    .hasAnyAuthority("administrador", "presidente", "membro")
                                .requestMatchers(HttpMethod.DELETE, "/usuario/deletarUsuario/{id}")
                                    .hasAnyAuthority("administrador", "presidente")
                                .requestMatchers(HttpMethod.GET, "/usuario/buscarUsuario/{id}")
                                    .hasAnyAuthority("administrador", "presidente")
                                .requestMatchers(HttpMethod.GET, "/usuario/relatorio")
                                    .hasAnyAuthority("administrador", "presidente")

                                // Endpoint para tarefas
                                .requestMatchers(HttpMethod.POST, "/tarefa/salvar")
                                    .hasAnyAuthority("administrador", "presidente")
                                .requestMatchers(HttpMethod.GET, "/tarefa/listar")
                                    .hasAnyAuthority("administrador", "presidente")
                                .requestMatchers(HttpMethod.GET, "/tarefa/concluidas")
                                    .hasAnyAuthority("administrador", "presidente")
                                .requestMatchers(HttpMethod.PUT, "tarefa/atualizarTarefa")
                                    .hasAnyAuthority("administrador", "presidente", "membro")
                                .requestMatchers(HttpMethod.DELETE, "tarefa/deletarTarefa/{id}")
                                    .hasAnyAuthority("administrador", "presidente")
                                .requestMatchers(HttpMethod.GET, "/tarefa/tarefas/{usuarioId}")
                                    .hasAnyAuthority("administrador", "presidente", "membro")
                                .requestMatchers("tarefa/tarefasNaoConcluidas/{usuarioId}")
                                    .hasAnyAuthority("administrador", "presidente", "membro")
                                .requestMatchers(HttpMethod.GET, "/tarefa/buscarTarefa/{tarefaId}")
                                    .hasAnyAuthority("administrador", "presidente", "membro")

                                // Endpoint para sessões
                                .requestMatchers(HttpMethod.POST, "/sessao/iniciar")
                                    .hasAnyAuthority("administrador", "presidente", "membro")
                                .requestMatchers(HttpMethod.GET, "/sessao/listar")
                                    .hasAnyAuthority("administrador", "presidente")
                                .requestMatchers(HttpMethod.PUT, "/sessao/encerrar")
                                    .hasAnyAuthority("administrador", "presidente", "membro")
                                .requestMatchers(HttpMethod.DELETE, "/sessao/deletarSessao/{id}")
                                    .hasAnyAuthority("administrador", "presidente")
                                .requestMatchers(HttpMethod.PUT, "/sessao/validarSessao/{id}")
                                    .hasAnyAuthority("administrador", "presidente")
                                .requestMatchers("/sessao/sessoesTarefa/{tarefaId}")
                                    .hasAnyAuthority("administrador", "presidente")

                                // Endpoint para intervalos
                                .requestMatchers(HttpMethod.POST, "/intervalo/pausar")
                                    .hasAnyAuthority("administrador", "presidente", "membro")
                                .requestMatchers(HttpMethod.GET, "/intervalo/listar")
                                    .hasAnyAuthority("administrador", "presidente", "membro")
                                .requestMatchers(HttpMethod.PUT, "/intervalo/retomar")
                                    .hasAnyAuthority("administrador", "presidente", "membro")
                                .requestMatchers(HttpMethod.DELETE, "/intervalo/deletarIntervalo/{id}")
                                    .hasAnyAuthority("administrador", "presidente")

                                // Endpoint para mensagens
                                .requestMatchers(HttpMethod.POST, "/mensagem/salvar")
                                    .hasAnyAuthority("administrador", "presidente"/*, "membro"*/)
                                .requestMatchers(HttpMethod.GET, "/mensagem/lidas/{usuarioId}")
                                    .hasAnyAuthority("administrador", "presidente", "membro")
                                .requestMatchers(HttpMethod.GET, "/mensagem/naoLidas/{usuarioId}")
                                    .hasAnyAuthority("administrador", "presidente", "membro")
                                .requestMatchers(HttpMethod.PATCH, "/mensagem/marcarComoLida/{mensagemId}")
                                    .hasAnyAuthority("administrador", "presidente", "membro")
                                .requestMatchers(HttpMethod.DELETE, "/mensagem/deletar/{mensagemId}")
                                    .hasAnyAuthority("administrador", "presidente", "membro")

                                .requestMatchers("/error").permitAll()
                                .anyRequest().authenticated())
                .addFilterBefore(this.autenticacaoFilter, UsernamePasswordAuthenticationFilter.class)
                .build();

    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration)
            throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // URLs permitidas (adicione outras se necessário)
        configuration.addAllowedOrigin("http://localhost:3000");
        configuration.addAllowedOrigin("http://127.0.0.1:3000");

        // Métodos HTTP permitidos
        configuration.addAllowedMethod("GET");
        configuration.addAllowedMethod("POST");
        configuration.addAllowedMethod("PUT");
        configuration.addAllowedMethod("DELETE");
        configuration.addAllowedMethod("OPTIONS");
        configuration.addAllowedMethod("PATCH");

        // Headers permitidos
        configuration.addAllowedHeader("*");

        // Permitir envio de cookies/credenciais
        configuration.setAllowCredentials(true);

        // Headers que podem ser expostos ao cliente
        configuration.addExposedHeader("Authorization");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
