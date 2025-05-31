package ufsm.poli.csi.SistemaERP.controller;

import ufsm.poli.csi.SistemaERP.infra.security.TokenServiceJWT;
import ufsm.poli.csi.SistemaERP.model.Usuario;
import ufsm.poli.csi.SistemaERP.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/login")
public class AutenticacaoController {

    private final AuthenticationManager authenticationManager;
    private final TokenServiceJWT tokenServiceJWT;
    private final UsuarioRepository usuarioRepository;

    public AutenticacaoController(AuthenticationManager authenticationManager,
                                  TokenServiceJWT tokenServiceJWT,
                                  UsuarioRepository usuarioRepository) {
        this.authenticationManager = authenticationManager;
        this.tokenServiceJWT = tokenServiceJWT;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping
    public ResponseEntity efetuarLogin(@RequestBody @Valid DadosAutenticacao dados){
        try {
            Authentication autenticado = new UsernamePasswordAuthenticationToken(dados.email(), dados.senha());
            Authentication at = authenticationManager.authenticate(autenticado);

            User user = (User) at.getPrincipal();
            String token = this.tokenServiceJWT.gerarToken(user);

            // Buscar dados completos do usuário
            Usuario usuario = this.usuarioRepository.findUsuarioByEmail(dados.email());
            if (usuario == null) {
                return ResponseEntity.badRequest().body("Usuário não encontrado");
            }

            // Criar DTO com dados do usuário (sem senha)
            DadosUsuarioResponse usuarioResponse = new DadosUsuarioResponse(
                    usuario.getUsuarioId(),
                    usuario.getNomeCompleto(),
                    usuario.getEmail(),
                    usuario.getTipoUsuario()
            );

            return ResponseEntity.ok().body(new DadosLoginResponse(token, usuarioResponse));
        }catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Record para resposta completa do login
    private record DadosLoginResponse(String token, DadosUsuarioResponse usuario) {}

    // Record para dados do usuário (sem informações sensíveis)
    private record DadosUsuarioResponse(Long id, String nomeCompleto, String email, Usuario.TipoUsuario tipoUsuario) {}

    private record DadosAutenticacao(String email, String senha){}
}