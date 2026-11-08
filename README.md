# Clini+ · Gestão para clínicas odontológicas e HOF

Sistema web para clínicas e consultórios odontológicos, com módulo de harmonização orofacial (HOF). Reúne agenda, pacientes, prontuário com odontograma, plano de tratamento, orçamentos, financeiro, comunicação pelo WhatsApp e relatórios.

> **Status:** protótipo funcional. Os dados ficam salvos no navegador (`localStorage`), sem backend e sem login real. Veja [Limitações](#limitações).

## Funcionalidades

| Módulo | O que faz |
|---|---|
| **Dashboard** | Atendimentos do dia, pacientes ativos, receitas, despesas e atalhos rápidos |
| **Agenda** | Visão de dia, semana e mês, filtros, check-in, reagendamento e lembrete pelo WhatsApp |
| **Pacientes** | Cadastro completo com busca de CEP (ViaCEP), envio de documentos, consentimentos LGPD, tipo de atendimento (odontologia ou HOF) e exclusão completa dos dados e arquivos |
| **Prontuário** | Resumo, anamnese, evoluções, odontograma interativo por dente e face, avaliação pré-tratamento, procedimentos, exames e documentos |
| **Plano de tratamento** | Itens por fase, dente, prioridade e valor, com impressão e geração de orçamento |
| **Orçamentos** | Lista dos orçamentos gerados a partir dos planos, com filtros e taxa de aprovação |
| **HOF** | Procedimentos de harmonização com produto, lote, validade (bloqueia produto vencido), quantidade, valor e retorno |
| **Financeiro** | Receitas e despesas, convênios odontológicos com guia e autorização |
| **Comunicação** | Mensagens prontas pelo WhatsApp Web: confirmação de consultas de amanhã, retornos, orçamentos sem resposta, cobranças e aniversariantes |
| **Relatórios** | Receita recebida, a receber, saldo, receita por mês, procedimentos mais frequentes, orçamentos e cancelamentos, com exportação em CSV |
| **Documentos** | Envio, visualização e download de radiografias, fotos, termos e exames (PDF, JPG, PNG, WEBP) |
| **Tratamentos** | Cadastro, status editável e lançamento de pagamento |
| **Equipe, perfil e configurações** | Profissionais, perfil do dentista (nome e CRO) e dados da clínica usados na agenda e nos documentos impressos |
| **Onboarding e planos** | Fluxo de entrada com escolha de plano (Starter, Pro, Premium) |

## Stack

- **Next.js 16** (App Router) e **React 19**
- **TypeScript** em modo estrito
- **Tailwind CSS 4**
- **Lucide** para ícones

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000` e clique em **Entrar**. A demonstração abre no plano Premium, com pacientes e agendamentos de exemplo.

O plano escolhido muda o que fica liberado. O odontograma, por exemplo, exige Pro ou Premium.

## Estrutura

```text
app/          páginas (uma pasta por rota)
components/   componentes de tela (prontuário, odontograma, formulários, menu)
data/         dados de exemplo usados na primeira abertura
types/        tipos compartilhados
utils/
  cliniplusStore.ts   camada de dados: pacientes, agenda, prontuário, orçamentos, financeiro...
  whatsapp.ts         geração de links do WhatsApp Web
  arquivos.ts         arquivos dos pacientes no IndexedDB
  datas.ts, format.ts, agendaStatus.ts  datas locais, dinheiro e status padronizados
public/       imagens das telas de entrada
```

Toda leitura e gravação de dados passa pelo `utils/cliniplusStore.ts`, e os arquivos pelo `utils/arquivos.ts`. As telas escutam o evento `cliniplus:store` para atualizar sozinhas quando algo muda.

## Limitações

- **Sem backend:** os dados ficam no navegador de quem usa. Limpar o navegador apaga tudo, e cada computador tem seus próprios dados.
- **Sem autenticação real:** as telas de login e cadastro são demonstrativas.
- **WhatsApp manual:** as mensagens abrem no WhatsApp Web para envio pelo usuário. Não há envio automático.
- **Arquivos locais:** documentos e imagens ficam no IndexedDB do navegador. Em produção, devem ir para um armazenamento em nuvem (S3, Supabase Storage).
- **Pagamento do onboarding:** é demonstrativo, sem gateway integrado.

## Próximos passos

- API com banco de dados (por exemplo, FastAPI ou Next.js com PostgreSQL) substituindo o `localStorage`
- Autenticação com perfis de acesso
- Armazenamento de arquivos em nuvem
- Gateway de pagamento para as assinaturas
- Testes automatizados

---

Desenvolvido por **Fernando Ivo Negreiro da Silva** · [GitHub](https://github.com/FerNegreiro)
