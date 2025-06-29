package ufsm.poli.csi.SistemaERP.service;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ufsm.poli.csi.SistemaERP.dto.RelatorioUsuarioDTO;
import ufsm.poli.csi.SistemaERP.dto.SessaoDTO;
import ufsm.poli.csi.SistemaERP.dto.TarefaDTO;
import ufsm.poli.csi.SistemaERP.model.Sessao;
import ufsm.poli.csi.SistemaERP.model.Tarefa;
import ufsm.poli.csi.SistemaERP.model.Usuario;
import ufsm.poli.csi.SistemaERP.repository.SessaoRepository;
import ufsm.poli.csi.SistemaERP.repository.TarefaRepository;
import ufsm.poli.csi.SistemaERP.repository.UsuarioRepository;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final SessaoRepository sessaoRepository;
    private final TarefaRepository tarefaRepository;

    public UsuarioService(UsuarioRepository usuarioRepository, SessaoRepository sessaoRepository, TarefaRepository tarefaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.sessaoRepository = sessaoRepository;
        this.tarefaRepository = tarefaRepository;
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

    public List<RelatorioUsuarioDTO> gerarRelatorio(LocalDate dataInicio, LocalDate dataFim) {
        List<Usuario> usuarios = usuarioRepository.findAll();

        return usuarios.stream().map(usuario -> {
            // Sessões
            List<Sessao> sessoesNoPeriodo = sessaoRepository.findByUsuarioAndPeriodo(
                    usuario.getUsuarioId(),
                    dataInicio.atStartOfDay(),
                    dataFim.atTime(23, 59, 59)
            );

            // Tarefas concluídas no período
            List<Tarefa> tarefasDoUsuario = tarefaRepository.findByUsuarioAndDataConclusaoBetween(
                    usuario.getUsuarioId(),
                    dataInicio.atStartOfDay(),
                    dataFim.atTime(23, 59, 59)
            );

            double horasDasTarefas = tarefasDoUsuario.stream()
                    .filter(t -> t.getTotalHorasTrabalhadas() != null)
                    .mapToDouble(t -> t.getTotalHorasTrabalhadas() / 3_600_000_000_000.0)
                    .sum();

            double totalHorasCumpridas = horasDasTarefas;

            List<TarefaDTO> tarefasDTO = tarefasDoUsuario.stream()
                    .map(TarefaDTO::new)
                    .toList();

            return new RelatorioUsuarioDTO(
                    usuario.getUsuarioId(),
                    usuario.getNomeCompleto(),
                    usuario.getCargaHorariaSemanal(),
                    totalHorasCumpridas,
                    tarefasDTO
            );
        }).toList();
    }

    @Transactional
    public void excluirUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com o id: " + id));
        this.usuarioRepository.delete(usuario);
    }
}
