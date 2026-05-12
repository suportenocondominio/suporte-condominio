import '../App.css'

function TermosUso() {
  return (
    <main className="legalPage">
      <section className="legalCard">
        <h1>Termos de Uso</h1>

        <p>
          Ao utilizar o Suporte no Condomínio, você concorda com estes termos e com o uso adequado da plataforma.
        </p>

        <h2>Finalidade</h2>
        <p>
          A plataforma permite solicitar suporte técnico, acompanhar chamados, enviar mensagens e anexos relacionados ao
          atendimento.
        </p>

        <h2>Responsabilidades do usuário</h2>
        <p>
          O usuário deve fornecer informações verdadeiras, utilizar o serviço de forma adequada e não enviar conteúdos
          ofensivos, ilegais ou que não estejam relacionados ao atendimento.
        </p>

        <h2>Atendimento</h2>
        <p>
          A abertura de chamado não garante atendimento imediato. Os prazos podem variar conforme disponibilidade,
          complexidade do serviço e agenda técnica.
        </p>

        <h2>Uso indevido</h2>
        <p>
          Podemos suspender ou restringir o acesso em caso de uso abusivo, tentativa de fraude, envio de conteúdo indevido
          ou violação destes termos.
        </p>

        <h2>Alterações</h2>
        <p>
          Estes termos podem ser atualizados periodicamente para refletir melhorias no serviço ou ajustes legais.
        </p>

        <a href="/" className="legalBackButton">Voltar</a>
      </section>
    </main>
  )
}

export default TermosUso