package ufsm.poli.csi.SistemaERP;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "ufsm.poli.csi.SistemaERP.repository")
public class SistemaErpApplication {
	public static void main(String[] args) {
		SpringApplication.run(SistemaErpApplication.class, args);
	}
}
