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
                .csrf(csrf-> csrf.disable())
                .sessionManagement(sm-> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth->
                        auth
                                // Endpoints para usuários
                                .requestMatchers(HttpMethod.POST, "/login").permitAll()
                                .requestMatchers(HttpMethod.POST, "/usuario/cadastrar").permitAll()
                                .requestMatchers(HttpMethod.GET, "/usuario/listar")
                                    .hasAnyAuthority("administrador", "presidente")
                                .requestMatchers(HttpMethod.PUT, "/usuario/atualizarUsuario")
                                    .hasAnyAuthority("administrador", "presidente", "membro")
                                .requestMatchers(HttpMethod.DELETE, "/usuario/deletarUsuario/{id}")
                                    .hasAnyAuthority("administrador", "presidente")

                                // Endpoint para tarefas
                                .requestMatchers(HttpMethod.POST, "/tarefa/salvar")
                                    .hasAnyAuthority("administrador", "presidente")
                                .requestMatchers(HttpMethod.GET, "/tarefa/listar")
                                    .hasAnyAuthority("administrador", "presidente", "membro")
                                .requestMatchers(HttpMethod.PUT, "tarefa/atualizarTarefa")
                                    .hasAnyAuthority("administrador", "presidente", "membro")
                                .requestMatchers(HttpMethod.DELETE, "tarefa/deletarTarefa/{id}")
                                    .hasAnyAuthority("administrador", "presidente")

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

                                // Endpoint para intervalos
                                .requestMatchers(HttpMethod.POST, "/intervalo/pausar")
                                    .hasAnyAuthority("administrador", "presidente", "membro")
                                .requestMatchers(HttpMethod.GET, "/intervalo/listar")
                                    .hasAnyAuthority("administrador", "presidente", "membro")
                                .requestMatchers(HttpMethod.PUT, "/intervalo/retomar")
                                    .hasAnyAuthority("administrador", "presidente", "membro")
                                .requestMatchers(HttpMethod.DELETE, "/intervalo/deletarIntervalo/{id}")
                                    .hasAnyAuthority("administrador", "presidente")

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
}
