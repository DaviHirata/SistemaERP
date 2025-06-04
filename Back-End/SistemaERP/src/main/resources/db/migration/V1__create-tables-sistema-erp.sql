-- Definindo ENUM para tipo_usuario e status
-- create type tipo_usuario as enum ('administrador', 'membro', 'presidente');
-- create type status_tarefa as enum ('pendente', 'em_desenvolvimento', 'concluido');


create table usuario (
    usuario_id bigserial primary key,
    nome_completo varchar(255) not null,
    email varchar(255) not null unique,
    senha varchar(255) not null,
    carga_horaria_semanal int not null,
    tipo_usuario varchar(20) not null
);

create table tarefa (
    tarefa_id bigserial primary key,
    usuario_id bigint not null,
    titulo varchar(255) not null,
    descricao text not null,
    data_inicio timestamp not null,
    data_conclusao timestamp,
    prazo date not null,
    status varchar(20) not null,
    total_horas_trabalhadas bigint,
    foreign key (usuario_id) references usuario (usuario_id)
);

create table sessao_trabalho (
    sessao_id bigserial primary key,
    tarefa_id bigint not null,
    inicio_sessao timestamp not null,
    fim_sessao timestamp,
    duracao_total bigint,
    validado boolean default null,
    foreign key (tarefa_id) references tarefa (tarefa_id) on delete cascade
);

create table intervalo_sessao_trabalho (
    intervalo_id bigserial primary key,
    sessao_id bigint not null,
    inicio timestamp not null,
    fim timestamp,
    foreign key (sessao_id) references sessao_trabalho (sessao_id) on delete cascade
);