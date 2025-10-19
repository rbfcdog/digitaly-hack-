# 📋 Documentação Completa - Plataforma Médica Oncológica

## 📑 Índice

1. [Visão Geral do Projeto](#-visão-geral-do-projeto)
2. [Stack Tecnológica](#️-stack-tecnológica)
3. [Estrutura do Banco de Dados](#️-estrutura-do-banco-de-dados)
4. [Backend - API](#-backend---api)
5. [Frontend - Interface](#-frontend---interface)
6. [Fluxo de Funcionamento](#-fluxo-de-funcionamento)
7. [Cobertura do Escopo](#-cobertura-do-escopo)
8. [Como Executar](#-como-executar)

---

## 🎯 Visão Geral do Projeto

A plataforma é um sistema médico especializado em oncologia que permite:

- **Chat em tempo real** entre médico e paciente
- **Análise automática** de conversas usando IA (OpenAI)
- **Dashboard de alertas** para monitoramento de atrasos nas etapas de tratamento
- **Gestão de sessões** para múltiplos atendimentos simultâneos

### Objetivo Principal

Auxiliar médicos oncologistas com um agente inteligente que:

- Identifica sintomas mencionados pelos pacientes
- Detecta alertas críticos baseados no histórico
- Sugere planos de ação personalizados
- Monitora atrasos nas etapas: Diagnóstico → Estadiamento → Tratamento

---

## 🛠️ Stack Tecnológica

### Backend

```json
{
  "runtime": "Node.js",
  "linguagem": "TypeScript",
  "framework": "Express.js",
  "banco_de_dados": "Supabase (PostgreSQL)",
  "comunicacao_tempo_real": "Socket.IO",
  "ia": "OpenAI GPT-4",
  "validacao": "Zod"
}
```

#### Dependências Principais (Backend)

- **express** `^5.1.0` - Framework web
- **socket.io** `^4.8.1` - WebSockets para chat em tempo real
- **@supabase/supabase-js** `^2.75.1` - Cliente Supabase
- **openai** `^6.5.0` - Integração com GPT-4
- **zod** `^4.1.12` - Validação de schemas
- **cors** `^2.8.5` - CORS para comunicação frontend/backend
- **dotenv** `^17.2.3` - Variáveis de ambiente

### Frontend

```json
{
  "runtime": "Node.js",
  "linguagem": "TypeScript",
  "framework": "Next.js 15",
  "estilizacao": "Tailwind CSS 4",
  "ui_components": "Radix UI",
  "graficos": "Recharts",
  "comunicacao": "Socket.IO Client + Axios"
}
```

#### Dependências Principais (Frontend)

- **next** `^15.5.6` - Framework React com SSR
- **react** `^19.1.0` - Biblioteca UI
- **socket.io-client** `^4.8.1` - WebSockets cliente
- **axios** `^1.12.2` - Cliente HTTP
- **recharts** `^3.3.0` - Biblioteca de gráficos
- **lucide-react** `^0.546.0` - Ícones
- **tailwindcss** `^4` - Framework CSS utility-first
- **@radix-ui/react-slot** `^1.2.3` - Componentes UI acessíveis

---

## 🗄️ Estrutura do Banco de Dados

### Supabase (PostgreSQL)

#### Tabela: `client_info`

Armazena informações completas dos pacientes oncológicos.

```sql
CREATE TABLE client_info (
  patient_id VARCHAR PRIMARY KEY,
  nome_paciente VARCHAR NOT NULL,
  sexo VARCHAR(10),
  idade INTEGER,
  diagnostico_data DATE,
  tipo_cancer VARCHAR,
  estadiamento VARCHAR,
  cirurgia_data DATE,
  quimioterapia_inicio DATE,
  radioterapia_inicio DATE,
  ultima_consulta DATE,
  proxima_consulta DATE,
  status_jornada VARCHAR,
  alerta_atraso BOOLEAN DEFAULT false,
  atraso_etapa VARCHAR
);
```

**Campos Críticos:**

- `patient_id`: Identificador único do paciente
- `tipo_cancer`: Tipo de câncer (ex: mama, pulmão, próstata)
- `estadiamento`: Estágio do câncer (I, II, III, IV)
- `status_jornada`: Etapa atual (Diagnóstico, Estadiamento, Tratamento)
- `alerta_atraso`: Flag booleana para alertas
- `atraso_etapa`: Descrição do atraso (ex: "Estadiamento → Tratamento")

#### Tabela: `messages`

Armazena todas as mensagens trocadas entre médico e paciente.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR NOT NULL,
  sender_role VARCHAR(10) CHECK (sender_role IN ('doctor', 'patient')),
  patient_id VARCHAR REFERENCES client_info(patient_id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices Importantes:**

```sql
CREATE INDEX idx_messages_patient ON messages(patient_id, created_at);
CREATE INDEX idx_messages_session ON messages(session_id, created_at);
```

#### Lógica de Alertas

Os alertas são calculados automaticamente baseado em:

```typescript
// Atraso de 7 dias entre etapas
if (dias_entre_etapas > 7) {
  alerta_atraso = true;
  atraso_etapa = "Estadiamento → Tratamento";
}
```

**Exemplo de Dados Fictícios:**

```json
{
  "patient_id": "P001",
  "nome_paciente": "Maria Silva",
  "tipo_cancer": "Mama",
  "estadiamento": "II",
  "diagnostico_data": "2025-09-01",
  "status_jornada": "Tratamento",
  "alerta_atraso": true,
  "atraso_etapa": "Estadiamento → Tratamento"
}
```

---

## 🔌 Backend - API

### Arquitetura

```
backend/
├── src/
│   ├── app.ts                    # Configuração Express
│   ├── server.ts                 # Servidor HTTP + Socket.IO
│   ├── config/
│   │   └── supabase.ts          # Cliente Supabase
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   └── api/
│       ├── routes/
│       │   └── actions.router.ts # Rotas HTTP
│       ├── controllers/
│       │   └── actions.controller.ts # Lógica de controle
│       └── services/
│           ├── agent.service.ts      # Integração OpenAI
│           ├── supabase.service.ts   # Queries Supabase
│           └── sessions.service.ts   # Gestão de sessões
```

### Módulos e Responsabilidades

#### 1. **app.ts** - Configuração Express

```typescript
// Configurações:
// - CORS para permitir frontend
// - JSON parsing
// - Health check endpoint
// - Rotas da API
```

**Endpoints Base:**

- `GET /health` - Verificação de saúde do servidor
- `POST /api/actions/*` - Todas as ações da aplicação

#### 2. **server.ts** - Socket.IO + HTTP

```typescript
// Responsabilidades:
// - Criar servidor HTTP
// - Configurar Socket.IO para chat em tempo real
// - Gerenciar salas de chat (rooms)
// - Broadcast de mensagens entre médico/paciente
```

**Eventos Socket.IO:**

- `join_room` - Cliente entra em uma sala de chat
- `chat_message` - Envio de mensagem
- `error` - Erros de validação/permissão

#### 3. **actions.controller.ts** - Controladores HTTP

##### Rotas Implementadas:

| Método | Rota                                         | Descrição               | Escopo               |
| ------ | -------------------------------------------- | ----------------------- | -------------------- |
| `GET`  | `/api/actions/foo`                           | Teste de conexão        | -                    |
| `POST` | `/api/actions/create-session`                | Cria sessão de chat     | ✅ Chat              |
| `POST` | `/api/actions/query-client-info`             | Busca dados do paciente | ✅ Identificação     |
| `POST` | `/api/actions/insert-message`                | Salva mensagem no BD    | ✅ Chat              |
| `POST` | `/api/actions/query-all-client-messages`     | Histórico completo      | ✅ Chat              |
| `POST` | `/api/actions/query-session-client-messages` | Mensagens da sessão     | ✅ Chat              |
| `POST` | `/api/actions/agent-conversation`            | Análise IA da conversa  | ✅ Resumo Automático |
| `POST` | `/api/actions/query-all-clients-info`        | Lista todos pacientes   | ✅ Dashboard         |

##### Detalhamento: `agent-conversation`

```typescript
// Fluxo:
// 1. Recebe patient_id
// 2. Busca todas mensagens do paciente
// 3. Busca informações cadastrais
// 4. Envia para OpenAI para análise
// 5. Retorna análise estruturada
```

**Exemplo de Request:**

```json
POST /api/actions/agent-conversation
{
  "patient_id": "P001"
}
```

**Exemplo de Response:**

```json
{
  "patient_id": "P001",
  "sintomas": [
    {
      "sintoma": "Dor no peito",
      "gravidade": "grave"
    },
    {
      "sintoma": "Falta de ar",
      "gravidade": "medio"
    }
  ],
  "observacoes": "Paciente relata dor persistente há 3 dias...",
  "sugestao_plano": "Solicitar tomografia de tórax urgente...",
  "alertas_risco": [
    {
      "alerta": "Sintomas sugerem metástase pulmonar",
      "nivel_alerta": "gravissimo"
    }
  ]
}
```

#### 4. **agent.service.ts** - Serviço de IA

```typescript
// Utiliza OpenAI GPT-4 Mini
// Prompt Engineering específico para oncologia
// Schema Zod para validação de resposta
```

**Prompt System:**

```
Você é um assistente médico especializado em pacientes oncológicos.
Use TODAS as informações do paciente (tipo de câncer, estágio,
histórico de tratamentos, consultas etc.) e TODAS as mensagens
do paciente para gerar um relatório completo.
```

**Parâmetros OpenAI:**

- `model`: gpt-4o-mini
- `temperature`: 0.3 (baixa criatividade)
- `response_format`: json_schema (resposta estruturada)

#### 5. **supabase.service.ts** - Queries do Banco

**Métodos:**

```typescript
class SupabaseService {
  // Busca informações de um paciente
  queryClientInfo(patient_id: string): Promise<ClientInfo>;

  // Insere nova mensagem
  insertMessage(message: NewMessage): Promise<void>;

  // Busca todas mensagens de um paciente
  queryAllClientMessages(patient_id: string): Promise<Message[]>;

  // Busca mensagens de uma sessão específica
  querySessionClientMessages(
    patient_id: string,
    session_id: string
  ): Promise<Message[]>;

  // Busca informações de todos pacientes
  queryAllClientsInfo(): Promise<ClientInfo[]>;
}
```

#### 6. **sessions.service.ts** - Gestão de Sessões

```typescript
// Gerencia mapeamento hash -> patient_id
// Garante segurança nas sessões de chat
// Armazenamento em memória (pode ser migrado para Redis)

class SessionsManager {
  static addSession(hash: string, patient_id: string): void;
  static getPatientId(hash: string): string | undefined;
}
```

### TypeScript Types

```typescript
// src/types/index.ts

interface ClientInfo {
  patient_id: string;
  nome_paciente: string;
  sexo: string;
  idade: number;
  diagnostico_data: string;
  tipo_cancer: string;
  estadiamento: string;
  // ... demais campos de tratamento
  alerta_atraso: boolean;
  atraso_etapa: string;
}

interface Message {
  id: string;
  session_id: string;
  sender_role: "doctor" | "patient";
  patient_id: string;
  message: string;
  created_at: string;
}

interface PatientAnalysis {
  patient_id: string;
  sintomas: {
    sintoma: string;
    gravidade: "leve" | "medio" | "grave" | "gravissimo";
  }[];
  observacoes: string;
  sugestao_plano: string;
  alertas_risco: {
    alerta: string;
    nivel_alerta: "leve" | "medio" | "grave" | "gravissimo";
  }[];
}
```

---

## 🎨 Frontend - Interface

### Arquitetura

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage
│   │   ├── layout.tsx            # Layout raiz
│   │   ├── globals.css           # Estilos globais
│   │   ├── doctor/
│   │   │   └── page.tsx          # Interface do médico
│   │   ├── patient/
│   │   │   └── page.tsx          # Interface do paciente
│   │   └── test/
│   │       └── page.tsx          # Página de testes
│   ├── components/
│   │   ├── ChatBox/
│   │   │   ├── ChatBox.tsx       # Componente de chat
│   │   │   └── ChatMessage.tsx   # Mensagem individual
│   │   ├── InfoBox/
│   │   │   └── InfoBox.tsx       # Box de análise IA
│   │   ├── DashboardModal/
│   │   │   └── DashboardModal.tsx # Modal com gráficos
│   │   ├── HeaderBar/
│   │   │   └── Headerbar.tsx     # Cabeçalho
│   │   ├── notification/
│   │   │   └── notification.tsx  # Sistema de notificações
│   │   └── ui/
│   │       └── badge.tsx         # Badge componente
│   ├── services/
│   │   ├── api.ts                # Cliente Axios
│   │   ├── agentService.ts       # Chamadas IA
│   │   ├── dbService.ts          # Chamadas DB
│   │   └── sessionService.ts     # Gestão de sessões
│   └── types.ts                  # TypeScript types
```

### Páginas e Componentes

#### 1. **Homepage (`/`)**

```typescript
// Página inicial
// - Links para interfaces médico/paciente
// - Informações do sistema
```

#### 2. **Interface do Médico (`/doctor`)**

**URL Pattern:**

```
/doctor?session=abc123&id=P001
```

**Parâmetros:**

- `session`: Hash da sessão de chat
- `id`: ID do paciente

**Layout:**

```
┌─────────────────────────────────────────┐
│          HeaderBar                      │
├────────────────┬────────────────────────┤
│                │                        │
│   ChatBox      │      InfoBox           │
│   (Conversa)   │   (Análise IA)         │
│                │                        │
│                │  - Identificação       │
│                │  - Alertas             │
│                │  - Sintomas            │
│                │  - Plano de Ação       │
│                │                        │
└────────────────┴────────────────────────┘
```

**Funcionalidades:**

- ✅ Chat em tempo real com paciente
- ✅ Análise automática da conversa usando IA
- ✅ Identificação automática do paciente
- ✅ Detecção de alertas de atraso (7 dias)
- ✅ Listagem de sintomas com gravidade
- ✅ Sugestões de plano de ação
- ✅ Dashboard modal com indicadores
- ✅ Notificações de consultas atrasadas

**Código Principal:**

```typescript
export default function MedicoPage() {
  const [analysisResult, setAnalysisResult] = useState<PatientAnalysis | null>(
    null
  );
  const [patientInfo, setPatientInfo] = useState<ClientInfo | null>(null);

  // Dispara análise a cada nova mensagem
  const handleMessageTrigger = async () => {
    const analysis = await agentConversation(patient_id);
    setAnalysisResult(analysis);
  };

  // Calcula alertas de atraso
  useEffect(() => {
    if (proximaConsulta < hoje) {
      setConsultaAtrasadaMsg("ALERTA: Consulta atrasada!");
    }
  }, [patientInfo]);
}
```

#### 3. **Interface do Paciente (`/patient`)**

**URL Pattern:**

```
/patient?session=abc123&id=P001
```

**Layout:**

```
┌─────────────────────────────────────────┐
│          HeaderBar                      │
├─────────────────────────────────────────┤
│                                         │
│           ChatBox                       │
│       (Atendimento Virtual)             │
│                                         │
│    - Interface simples                  │
│    - Chat centralizado                  │
│    - Foco na comunicação                │
│                                         │
└─────────────────────────────────────────┘
```

**Funcionalidades:**

- ✅ Chat em tempo real com médico
- Interface limpa e intuitiva
- Sem informações sensíveis expostas

#### 4. **Componente: ChatBox**

**Props:**

```typescript
interface ChatBoxProps {
  title?: string;
  placeholder?: string;
  style?: React.CSSProperties;
  session_id: string;
  role: "medic" | "patient";
  patient_id?: string;
  onMessageTrigger?: () => void; // Callback para nova mensagem
}
```

**Funcionalidades:**

- Conexão WebSocket (Socket.IO)
- Envio/recebimento de mensagens em tempo real
- Persistência no banco de dados
- Auto-scroll para última mensagem
- Callback para disparar análise IA

**Fluxo de Mensagem:**

```
Usuário digita → Enter/Botão Enviar
    ↓
1. Salva no Supabase (insertMessage)
2. Adiciona à UI local
3. Emite via Socket.IO
4. Dispara callback onMessageTrigger (médico)
    ↓
Servidor Socket.IO faz broadcast
    ↓
Outros usuários recebem a mensagem
```

#### 5. **Componente: InfoBox**

**Props:**

```typescript
interface InfoBoxProps {
  patientInfo: ClientInfo | null;
  analysisResult: PatientAnalysis | null;
  loading: boolean;
}
```

**Seções:**

1. **Identificação do Paciente**

```
📋 Nome: Maria Silva
🆔 ID: P001
🩺 Tipo de Câncer: Mama
📊 Estadiamento: II
```

2. **Alertas de Atraso**

```
⚠️ ALERTA: Atraso de 10 dias
Etapa: Estadiamento → Tratamento
```

3. **Sintomas Detectados**

```
🔴 Grave: Dor no peito
🟡 Médio: Falta de ar
🟢 Leve: Fadiga
```

4. **Análise IA**

```
📝 Observações: [Texto detalhado]
💡 Plano Sugerido: [Ações recomendadas]
🚨 Alertas de Risco: [Alertas críticos]
```

#### 6. **Componente: DashboardModal**

**Props:**

```typescript
interface DashboardModalProps {
  visible: boolean;
  onClose: () => void;
  estadiamentoData: { name: string; value: number }[];
  tipoCancerData: { name: string; value: number }[];
  statusJornadaData: { name: string; value: number }[];
}
```

**Gráficos (Recharts):**

1. **Pizza: Distribuição por Estadiamento**

```
I: 15 pacientes
II: 25 pacientes
III: 20 pacientes
IV: 10 pacientes
```

2. **Pizza: Tipos de Câncer**

```
Mama: 30%
Pulmão: 25%
Próstata: 20%
Outros: 25%
```

3. **Barras: Status da Jornada**

```
Diagnóstico: 15
Estadiamento: 20
Tratamento: 35
```

**Calculo de Alertas Críticos:**

```typescript
const pacientesComAtraso = allPatientsInfo.filter(
  (p) => p.alerta_atraso === true
).length;
```

#### 7. **Componente: Notification**

Sistema de notificações toast para alertas importantes.

```typescript
interface NotificationProps {
  message: string;
  type: "info" | "warning" | "error" | "success";
}
```

**Casos de Uso:**

- Consulta atrasada detectada
- Nova análise IA disponível
- Erro de conexão
- Mensagem enviada com sucesso

### Serviços Frontend

#### 1. **api.ts**

```typescript
// Cliente Axios configurado
const api = axios.create({
  baseURL: "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});
```

#### 2. **agentService.ts**

```typescript
export async function agentConversation(
  patient_id: string
): Promise<PatientAnalysis> {
  const res = await api.post("api/actions/agent-conversation", { patient_id });
  return res.data;
}
```

#### 3. **dbService.ts**

```typescript
export async function queryClientInfo(patient_id: string): Promise<ClientInfo>;
export async function insertMessage(message: NewMessage): Promise<void>;
export async function queryAllClientMessages(
  patient_id: string
): Promise<Message[]>;
export async function queryAllClientsInfo(): Promise<ClientInfo[]>;
```

#### 4. **sessionService.ts**

```typescript
export async function createSession(
  patient_id: string
): Promise<SessionResponse>;
```

---

## 🔄 Fluxo de Funcionamento

### 1. Criação de Sessão

```
Médico acessa sistema
    ↓
POST /api/actions/create-session { patient_id: "P001" }
    ↓
Backend gera hash único (abc123)
    ↓
Retorna session_id: "abc123"
    ↓
URLs geradas:
- Médico: /doctor?session=abc123&id=P001
- Paciente: /patient?session=abc123&id=P001
```

### 2. Entrada no Chat

```
Usuário acessa URL
    ↓
Frontend conecta Socket.IO
    ↓
Emite: join_room { hash: "abc123", role: "medic", patient_id: "P001" }
    ↓
Servidor valida sessão
    ↓
Adiciona socket à room "abc123"
    ↓
Carrega mensagens anteriores (opcional)
```

### 3. Envio de Mensagem

```
Usuário digita mensagem
    ↓
Frontend:
1. Salva no Supabase via API
   POST /api/actions/insert-message
2. Adiciona à UI local
3. Emite via Socket.IO
   socket.emit("chat_message", { hash, content })
    ↓
Backend Socket.IO:
1. Recebe mensagem
2. Faz broadcast para a room
   io.to(hash).emit("chat_message", { role, content })
    ↓
Outros clientes na room recebem
    ↓
[Se for médico] Dispara callback onMessageTrigger()
```

### 4. Análise IA (Médico)

```
Nova mensagem chega
    ↓
onMessageTrigger() é chamado
    ↓
POST /api/actions/agent-conversation { patient_id: "P001" }
    ↓
Backend:
1. Busca todas mensagens do paciente
   SELECT * FROM messages WHERE patient_id = 'P001'
2. Busca informações do paciente
   SELECT * FROM client_info WHERE patient_id = 'P001'
3. Monta prompt para OpenAI
4. Envia para GPT-4 mini
5. Valida resposta com Zod
    ↓
Retorna PatientAnalysis
    ↓
Frontend atualiza InfoBox
    ↓
Médico vê:
- Sintomas identificados
- Alertas de risco
- Sugestões de plano
```

### 5. Dashboard de Alertas

```
Médico clica "Ver Dashboard"
    ↓
POST /api/actions/query-all-clients-info
    ↓
Backend retorna todos pacientes
    ↓
Frontend processa dados:
1. Conta por estadiamento
2. Conta por tipo de câncer
3. Conta por status da jornada
4. Filtra pacientes com alerta_atraso = true
    ↓
Renderiza gráficos Recharts
    ↓
Exibe ações críticas:
"5 pacientes com atrasos detectados"
```

### 6. Detecção de Atraso (Frontend)

```typescript
// Executado no useEffect da página do médico
const hoje = new Date();
const proxima = new Date(patientInfo.proxima_consulta);

if (proxima < hoje) {
  const diasAtraso = Math.floor(
    (hoje.getTime() - proxima.getTime()) / (1000 * 60 * 60 * 24)
  );

  setConsultaAtrasadaMsg(`⚠️ ALERTA: Consulta atrasada há ${diasAtraso} dias!`);
}
```

---

## ✅ Cobertura do Escopo

### Requisitos MVP

#### ✅ Módulo de Chat

| Requisito                 | Implementação     | Status |
| ------------------------- | ----------------- | ------ |
| Interface simples de chat | ChatBox.tsx       | ✅     |
| Tempo real                | Socket.IO         | ✅     |
| Persistência de mensagens | Supabase messages | ✅     |

#### ✅ Resumo Automático (Médico)

| Requisito                     | Implementação                          | Status |
| ----------------------------- | -------------------------------------- | ------ |
| **Identificação do Paciente** | `queryClientInfo()` + InfoBox          | ✅     |
| - Nome, ID, dados cadastrais  | ClientInfo interface                   | ✅     |
| - Tipo de câncer              | client_info.tipo_cancer                | ✅     |
| - Estadiamento                | client_info.estadiamento               | ✅     |
| - Histórico de tratamento     | client_info (cirurgia, quimio, radio)  | ✅     |
| **Alertas de Atraso**         | Lógica em doctor/page.tsx              | ✅     |
| - Diagnóstico → Estadiamento  | client_info.alerta_atraso              | ✅     |
| - Estadiamento → Tratamento   | client_info.atraso_etapa               | ✅     |
| - Critério: 7 dias            | Validação frontend + backend           | ✅     |
| **Principais Sintomas**       | PatientAnalysis.sintomas               | ✅     |
| - Identificação automática    | OpenAI GPT-4                           | ✅     |
| - Classificação de gravidade  | gravidade: leve/medio/grave/gravissimo | ✅     |
| **Pontos Relevantes**         | PatientAnalysis completo               | ✅     |
| - Exames mencionados          | observacoes + alertas_risco            | ✅     |
| - Medicamentos                | Detectado pela IA                      | ✅     |
| - Suspeitas                   | alertas_risco                          | ✅     |
| **Sugestões**                 | sugestao_plano                         | ✅     |
| - Perguntas recomendadas      | Gerado pela IA                         | ✅     |
| - Plano de ação               | sugestao_plano                         | ✅     |

#### ✅ Dashboard de Indicadores

| Requisito                       | Implementação            | Status |
| ------------------------------- | ------------------------ | ------ |
| **Alertas de Pacientes**        | DashboardModal           | ✅     |
| - Listagem de atrasos           | Filtro por alerta_atraso | ✅     |
| - Diagnóstico → Estadiamento    | atraso_etapa             | ✅     |
| - Estadiamento → Tratamento     | atraso_etapa             | ✅     |
| - Critério: 7 dias              | Validação consistente    | ✅     |
| **Indicadores Visuais**         | Recharts                 | ✅     |
| - Gráfico de estadiamento       | PieChart                 | ✅     |
| - Gráfico de tipos de câncer    | PieChart                 | ✅     |
| - Gráfico de status jornada     | BarChart                 | ✅     |
| **Ações Críticas**              | Contador de alertas      | ✅     |
| - Total de pacientes com atraso | Filter + count           | ✅     |

### Diferenciais Implementados

| Funcionalidade              | Descrição                               |
| --------------------------- | --------------------------------------- |
| 🤖 **IA Contextual**        | GPT-4 com contexto completo do paciente |
| 🎯 **Análise Oncológica**   | Prompts especializados em oncologia     |
| 📊 **Dashboard Interativo** | Gráficos em tempo real                  |
| 🔔 **Notificações**         | Sistema de alertas visual               |
| 🔒 **Segurança de Sessão**  | Validação de permissões por hash        |
| 📱 **Responsivo**           | Interface adaptável                     |
| ⚡ **Tempo Real**           | WebSockets para chat instantâneo        |
| 💾 **Persistência**         | Histórico completo de conversas         |

---

## 🚀 Como Executar

### Pré-requisitos

```bash
- Node.js 18+
- Conta Supabase (gratuita)
- Chave API OpenAI
```

### 1. Configuração do Banco de Dados

**Criar projeto no Supabase:**

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Execute os scripts SQL:

```sql
-- Tabela de informações dos pacientes
CREATE TABLE client_info (
  patient_id VARCHAR PRIMARY KEY,
  nome_paciente VARCHAR NOT NULL,
  sexo VARCHAR(10),
  idade INTEGER,
  diagnostico_data DATE,
  tipo_cancer VARCHAR,
  estadiamento VARCHAR,
  cirurgia_data DATE,
  quimioterapia_inicio DATE,
  radioterapia_inicio DATE,
  ultima_consulta DATE,
  proxima_consulta DATE,
  status_jornada VARCHAR,
  alerta_atraso BOOLEAN DEFAULT false,
  atraso_etapa VARCHAR
);

-- Tabela de mensagens
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR NOT NULL,
  sender_role VARCHAR(10) CHECK (sender_role IN ('doctor', 'patient')),
  patient_id VARCHAR REFERENCES client_info(patient_id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_messages_patient ON messages(patient_id, created_at);
CREATE INDEX idx_messages_session ON messages(session_id, created_at);

-- Dados fictícios de exemplo
INSERT INTO client_info VALUES
('P001', 'Maria Silva', 'Feminino', 52, '2025-09-01', 'Mama', 'II',
 '2025-09-15', '2025-10-01', NULL, '2025-09-20', '2025-10-25',
 'Tratamento', true, 'Estadiamento → Tratamento'),
('P002', 'João Santos', 'Masculino', 68, '2025-08-10', 'Próstata', 'III',
 '2025-08-25', '2025-09-05', '2025-09-20', '2025-10-01', '2025-10-30',
 'Tratamento', false, NULL);
```

### 2. Backend

```bash
cd backend

# Criar arquivo .env
cat > .env << EOF
PORT=3001
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=sua_url_aqui
SUPABASE_KEY=sua_chave_aqui
OPENAI_API_KEY=sua_chave_openai_aqui
OPENAI_MODEL=gpt-4o-mini
EOF

# Instalar dependências
npm install

# Executar em desenvolvimento
npx ts-node src/server.ts
# ou com nodemon:
npx nodemon src/server.ts
```

**Verificar:**

```bash
curl http://localhost:3001/health
# Resposta esperada: {"status":"OK","timestamp":"..."}
```

### 3. Frontend

```bash
cd frontend

# Criar arquivo .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

**Acessar:**

```
http://localhost:3000
```

### 4. Fluxo de Teste

**1. Criar sessão:**

```bash
curl -X POST http://localhost:3001/api/actions/create-session \
  -H "Content-Type: application/json" \
  -d '{"patient_id": "P001"}'

# Resposta: { "session_id": "abc123" }
```

**2. Acessar interface médico:**

```
http://localhost:3000/doctor?session=abc123&id=P001
```

**3. Acessar interface paciente (outra aba):**

```
http://localhost:3000/patient?session=abc123&id=P001
```

**4. Testar chat:**

- Digite mensagens no lado do paciente
- Observe análise automática no lado do médico
- Verifique sintomas e alertas detectados

**5. Ver dashboard:**

- Clique em "Ver Dashboard" na interface do médico
- Observe gráficos e indicadores

### 5. Scripts Úteis

**Backend:**

```bash
# Compilar TypeScript
npx tsc

# Verificar tipos
npx tsc --noEmit

# Watch mode
npx nodemon --exec ts-node src/server.ts
```

**Frontend:**

```bash
# Build produção
npm run build

# Executar produção
npm run start

# Lint
npm run lint
```

---

## 📝 Notas Técnicas

### Performance

- Socket.IO mantém conexões persistentes
- Índices no banco otimizam queries
- Cache de sessões em memória

### Segurança

- CORS configurado
- Validação de sessões
- Sanitização de inputs (Zod)
- Variáveis de ambiente para secrets

### Escalabilidade

- Sessões podem migrar para Redis
- Supabase escala automaticamente
- Socket.IO suporta múltiplos workers

### Melhorias Futuras

- [ ] Autenticação JWT
- [ ] Rate limiting
- [ ] Testes unitários/integração
- [ ] CI/CD pipeline
- [ ] Monitoramento (Sentry)
- [ ] Logs estruturados
- [ ] Cache Redis
- [ ] Upload de arquivos (exames)
- [ ] Videochamada
- [ ] Notificações push

---

## 🤝 Contribuindo

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📄 Licença

Projeto desenvolvido para hackathon. Código aberto para fins educacionais.

---

## 📞 Suporte

Para dúvidas ou problemas:

- Abra uma issue no GitHub
- Documente o erro com logs
- Descreva os passos para reproduzir

---

**Última atualização:** Outubro 2025  
**Versão:** 1.0.0  
**Status:** MVP Completo ✅
