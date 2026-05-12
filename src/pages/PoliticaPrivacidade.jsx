import '../App.css'

function PoliticaPrivacidade() {
  return (
    <main className="legalPage">
      <section className="legalCard">
        <h1>Política de Privacidade</h1>

        <p>
          O Suporte no Condomínio respeita a sua privacidade e utiliza seus dados apenas para prestar atendimento,
          abrir chamados, acompanhar solicitações e entrar em contato quando necessário.
        </p>

        <h2>Dados coletados</h2>
        <p>
          Podemos coletar nome, e-mail, telefone, condomínio, bloco, apartamento, endereço, mensagens, imagens enviadas
          em chamados e informações relacionadas ao atendimento solicitado.
        </p>

        <h2>Uso dos dados</h2>
        <p>
          Os dados são utilizados para identificar o solicitante, prestar suporte, acompanhar chamados, responder mensagens
          e melhorar a experiência de atendimento.
        </p>

        <h2>Compartilhamento</h2>
        <p>
          Não vendemos seus dados. Podemos compartilhar informações apenas quando necessário para execução do atendimento
          ou cumprimento de obrigações legais.
        </p>

        <h2>Segurança</h2>
        <p>
          Utilizamos medidas técnicas e administrativas para proteger as informações armazenadas e reduzir riscos de acesso
          indevido.
        </p>

        <h2>Direitos do titular</h2>
        <p>
          Você pode solicitar atualização, correção ou exclusão dos seus dados por meio da página de exclusão de conta.
        </p>

        <a href="/" className="legalBackButton">Voltar</a>
      </section>
    </main>
  )
}

export default PoliticaPrivacidade