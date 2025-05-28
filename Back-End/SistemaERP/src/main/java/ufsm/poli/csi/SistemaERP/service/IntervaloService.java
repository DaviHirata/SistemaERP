package ufsm.poli.csi.SistemaERP.service;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ufsm.poli.csi.SistemaERP.dto.IntervaloDTO;
import ufsm.poli.csi.SistemaERP.model.Intervalo;
import ufsm.poli.csi.SistemaERP.model.Sessao;
import ufsm.poli.csi.SistemaERP.repository.IntervaloRepository;
import ufsm.poli.csi.SistemaERP.repository.SessaoRepository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class IntervaloService {
    private final IntervaloRepository intervaloRepository;
    private final SessaoRepository sessaoRepository;

    public IntervaloService(IntervaloRepository intervaloRepository, SessaoRepository sessaoRepository) {
        this.intervaloRepository = intervaloRepository;
        this.sessaoRepository = sessaoRepository;
    }

    public void iniciarIntervalo(IntervaloDTO intervaloDTO) {
        Sessao sessao = sessaoRepository.findById(intervaloDTO.getSessaoId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Sessão não encontrada com o id: " + intervaloDTO.getSessaoId()
                ));
        Intervalo intervalo = new Intervalo();
        intervalo.setSessao(sessao);
        intervalo.setInicio(LocalDateTime.now());
        this.intervaloRepository.save(intervalo);
    }

    public List<Intervalo> listarIntervalos(){
        return this.intervaloRepository.findAll();
    }

    /*public Duration totalIntervalosNaSessao(Long sessaoId){
        List<Intervalo> intervalos = intervaloRepository.findBySessaoId(sessaoId);

        Duration total = Duration.ZERO;
        for(Intervalo intervalo : intervalos){
            if (intervalo.getFim() != null) {
                total = total.plus(Duration.between(intervalo.getInicio(), intervalo.getFim()));
            }
        }

        return total;
    }*/

    public Duration totalIntervalosNaSessao(Long sessaoId) {
        Long totalSegundos = intervaloRepository.calcularDuracaoTotalPorSessao(sessaoId);
        return totalSegundos != null ? Duration.ofSeconds(totalSegundos) : Duration.ZERO;
    }

    public void encerrarIntervalo(Long intervaloId){
        Intervalo intervalo = intervaloRepository.findById(intervaloId)
                .orElseThrow(() -> new EntityNotFoundException("Intervalo não encontrado para id: " + intervaloId));
        LocalDateTime fim = LocalDateTime.now();
        intervalo.setFim(fim);
        intervaloRepository.save(intervalo);
    }

    @Transactional
    public void excluirIntervalo(Long id){
        Intervalo intervalo = intervaloRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Intervalo não encontrado para id: " + id));
        intervaloRepository.delete(intervalo);
    }
}
