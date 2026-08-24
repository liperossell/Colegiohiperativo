-- Referência DDL do schema hiperativo.
-- Init do banco unificado: infra/postgres/init.sql
-- Tabelas são criadas automaticamente por api/src/ensureSchema.js na subida da API.

SET search_path TO hiperativo;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  cpf VARCHAR(11) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) NOT NULL,
  accept_terms BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email);
CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios (cpf);

CREATE TABLE IF NOT EXISTS matriculas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo VARCHAR(20) NOT NULL UNIQUE,
  full_name VARCHAR(200) NOT NULL,
  social_name VARCHAR(200),
  birth_date DATE NOT NULL,
  gender VARCHAR(20) NOT NULL,
  cpf VARCHAR(11) NOT NULL,
  rg VARCHAR(30),
  nationality VARCHAR(60),
  birth_place VARCHAR(120),
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20),
  address_cep VARCHAR(8) NOT NULL,
  address_street VARCHAR(180) NOT NULL,
  address_number VARCHAR(20) NOT NULL,
  address_complement VARCHAR(120),
  address_neighborhood VARCHAR(120) NOT NULL,
  address_city VARCHAR(120) NOT NULL,
  address_state CHAR(2) NOT NULL,
  course_level VARCHAR(40) NOT NULL,
  course_name VARCHAR(120) NOT NULL,
  shift VARCHAR(20) NOT NULL,
  previous_school VARCHAR(200),
  year_of_completion VARCHAR(10),
  guardian JSONB,
  sports_interests TEXT[] NOT NULL DEFAULT '{}',
  special_needs TEXT,
  medical_info TEXT,
  how_found_us VARCHAR(40),
  observations TEXT,
  accept_terms BOOLEAN NOT NULL DEFAULT FALSE,
  accept_privacy BOOLEAN NOT NULL DEFAULT FALSE,
  accept_marketing BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matriculas_cpf ON matriculas (cpf);
CREATE INDEX IF NOT EXISTS idx_matriculas_email ON matriculas (email);
CREATE INDEX IF NOT EXISTS idx_matriculas_protocolo ON matriculas (protocolo);
CREATE INDEX IF NOT EXISTS idx_matriculas_created_at ON matriculas (created_at DESC);

CREATE TABLE IF NOT EXISTS mensagens_contato (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(160) NOT NULL,
  email VARCHAR(160) NOT NULL,
  telefone VARCHAR(20),
  assunto VARCHAR(80),
  mensagem TEXT NOT NULL,
  origem VARCHAR(40) NOT NULL DEFAULT 'site',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mensagens_created_at ON mensagens_contato (created_at DESC);
