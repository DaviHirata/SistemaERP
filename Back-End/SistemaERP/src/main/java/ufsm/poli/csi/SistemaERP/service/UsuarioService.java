package ufsm.poli.csi.SistemaERP.service;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ufsm.poli.csi.SistemaERP.model.Usuario;
import ufsm.poli.csi.SistemaERP.repository.UsuarioRepository;

import java.util.List;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public void salvarUsuario(Usuario usuario) {
        // Criptografar senha antes de salvar
        usuario.setSenha(new BCryptPasswordEncoder().encode(usuario.getSenha()));
        this.usuarioRepository.save(usuario);
    }

    public Usuario buscarUsuarioPorEmail(String email) {
        return this.usuarioRepository.findUsuarioByEmail(email);
    }

    public List<Usuario> listarUsuarios() {
        return this.usuarioRepository.findAll();
    }

    public Usuario buscarUsuarioPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com o id: " + id));
        return usuario;
    }

    public void atualizarUsuario(Usuario usuario) {
        Usuario usuarioAtual = this.usuarioRepository.findUsuarioByEmail(usuario.getEmail());
        usuarioAtual.setNomeCompleto(usuario.getNomeCompleto());
        usuarioAtual.setEmail(usuario.getEmail());
        usuarioAtual.setSenha(new BCryptPasswordEncoder().encode(usuario.getSenha()));
        usuarioAtual.setTipoUsuario(usuario.getTipoUsuario());
        usuarioAtual.setCargaHorariaSemanal(usuario.getCargaHorariaSemanal());
        usuarioAtual.setTarefas(usuario.getTarefas());
        this.usuarioRepository.save(usuarioAtual);
    }

    @Transactional
    public void excluirUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com o id: " + id));
        this.usuarioRepository.delete(usuario);
    }
}
