CREATE TABLE mensagem (
    mensagem_id bigserial primary key ,
    remetente_id bigint, -- pode ser NULL para mensagens do sistema
    destinatario_id bigint not null,
    texto text not null ,
    tipo varchar(50) not null , -- ex: 'nova_tarefa', 'baixa_carga', 'mensagem', etc.
    data_envio timestamp default current_timestamp,
    lida boolean default false,

    constraint fk_remetente foreign key (remetente_id) references usuario (usuario_id),
    constraint fk_destinatario foreign key (destinatario_id) references usuario (usuario_id)
);
