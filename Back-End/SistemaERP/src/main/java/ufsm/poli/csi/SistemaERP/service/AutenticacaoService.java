package ufsm.poli.csi.SistemaERP.service;

import ufsm.poli.csi.SistemaERP.model.Usuario;
import ufsm.poli.csi.SistemaERP.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AutenticacaoService implements UserDetailsService {
    private final UsuarioRepository usuariosRepository;

    public AutenticacaoService(UsuarioRepository usuariosRepository) {
        this.usuariosRepository = usuariosRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = this.usuariosRepository.findUsuarioByEmail(email);
        if (usuario == null) {
            throw new UsernameNotFoundException("Usuário ou senha incorretos");
        } else{
            UserDetails user = User.withUsername(usuario.getEmail()).
                    password(usuario.getSenha()).authorities(String.valueOf(usuario.getTipoUsuario())).build();
            return user;
        }
    }
}