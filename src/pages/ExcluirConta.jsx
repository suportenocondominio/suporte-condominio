import '../App.css'

function ExcluirConta() {
  return (
    <main className="legalPage">
      <section className="legalCard">
        <h1>Excluir minha conta</h1>

        <p>
          Você pode solicitar a exclusão da sua conta e dos dados pessoais associados ao Suporte no Condomínio.
        </p>

        <h2>O que será excluído</h2>
        <p>
          Dados cadastrais como nome, e-mail, telefone, condomínio, bloco, apartamento e endereço poderão ser removidos.
          Informações de chamados poderão ser mantidas quando necessário para histórico operacional, segurança, prevenção
          de fraude ou obrigação legal.
        </p>

        <h2>Como solicitar</h2>
        <p>
          Envie uma solicitação para o WhatsApp oficial informando o e-mail utilizado no cadastro e solicitando a exclusão
          da conta.
        </p>

        <a
          href="https://wa.me/5511952491217?text=Olá! Gostaria de solicitar a exclusão da minha conta no Suporte no Condomínio."
          className="legalPrimaryButton"
          target="_blank"
          rel="noreferrer"
        >
          Solicitar exclusão pelo WhatsApp
        </a>

        <a href="/" className="legalBackButton">Voltar</a>
      </section>
    </main>
  )
}

export default ExcluirConta