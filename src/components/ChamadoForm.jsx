import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import LoginButton from './LoginButton'

function ChamadoForm({ initialView = 'abrir', perfilCliente = null }) {
  const [activeView, setActiveView] = useState(initialView)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState(null)
  const [checkingUser, setCheckingUser] = useState(true)

  const [meusChamados, setMeusChamados] = useState([])
  const [loadingChamados, setLoadingChamados] = useState(false)
  const [selectedChamado, setSelectedChamado] = useState(null)

  const [mensagens, setMensagens] = useState([])
  const [novaMensagem, setNovaMensagem] = useState('')
  const [arquivo, setArquivo] = useState(null)
  const [enviandoMensagem, setEnviandoMensagem] = useState(false)

  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    condominio: '',
    apartamento: '',
    servico: '',
    urgencia: 'Normal',
    descricao: '',
  })

  useEffect(() => {
    setActiveView(initialView)
  }, [initialView])

  useEffect(() => {
    if (perfilCliente) {
      setForm((prev) => ({
        ...prev,
        nome: perfilCliente.nome || '',
        telefone: perfilCliente.telefone || '',
        condominio: perfilCliente.condominio || '',
        apartamento: `${perfilCliente.bloco ? `Bloco ${perfilCliente.bloco} - ` : ''}${
          perfilCliente.apartamento || ''
        }`,
      }))
    }
  }, [perfilCliente])

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setCheckingUser(false)

      if (data.user) {
        loadMeusChamados(data.user.id)
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        loadMeusChamados(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadMeusChamados(userId) {
    setLoadingChamados(true)

    const { data, error } = await supabase
      .from('chamados')
      .select('*')
      .eq('user_id', userId)
      .order('ticket_id', { ascending: false })

    if (error) {
      console.error(error)
      alert('Erro ao carregar seus chamados.')
      setLoadingChamados(false)
      return
    }

    setMeusChamados(data || [])
    setLoadingChamados(false)
  }

  async function loadMensagens(chamadoId) {
    const { data, error } = await supabase
      .from('mensagens_chamado')
      .select('*')
      .eq('chamado_id', chamadoId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error(error)
      alert('Erro ao carregar mensagens.')
      return
    }

    setMensagens(data || [])
  }

  function abrirDetalhes(chamado) {
    setSelectedChamado(chamado)
    setNovaMensagem('')
    setArquivo(null)
    loadMensagens(chamado.id)
  }

  function fecharDetalhes() {
    setSelectedChamado(null)
    setMensagens([])
    setNovaMensagem('')
    setArquivo(null)
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!user) {
      alert('Você precisa entrar com Google antes de abrir um chamado.')
      return
    }

    setLoading(true)
    setSuccess(false)

    const chamado = {
      nome: form.nome,
      telefone: form.telefone,
      condominio: form.condominio,
      apartamento: form.apartamento,
      servico: form.servico,
      urgencia: form.urgencia,
      descricao: form.descricao,
      user_id: user.id,
      email: user.email,
      status: 'Aberto',
    }

    const { data, error } = await supabase
      .from('chamados')
      .insert([chamado])
      .select()
      .single()

    setLoading(false)

    if (error) {
      console.error(error)
      alert('Erro ao abrir chamado.')
      return
    }

    setSuccess(true)
    setMeusChamados((prev) => [data, ...prev])
    setActiveView('acompanhar')

    setForm({
      nome: perfilCliente?.nome || '',
      telefone: perfilCliente?.telefone || '',
      condominio: perfilCliente?.condominio || '',
      apartamento: `${perfilCliente?.bloco ? `Bloco ${perfilCliente.bloco} - ` : ''}${
        perfilCliente?.apartamento || ''
      }`,
      servico: '',
      urgencia: 'Normal',
      descricao: '',
    })
  }

  async function uploadArquivo(chamadoId) {
    if (!arquivo) return null

    const extensao = arquivo.name.split('.').pop()
    const nomeArquivo = `${chamadoId}/${Date.now()}.${extensao}`

    const { error } = await supabase.storage
      .from('chamados-anexos')
      .upload(nomeArquivo, arquivo)

    if (error) {
      console.error(error)
      alert('Erro ao enviar anexo.')
      return null
    }

    const { data } = supabase.storage
      .from('chamados-anexos')
      .getPublicUrl(nomeArquivo)

    return {
      url: data.publicUrl,
      nome: arquivo.name,
      tipo: arquivo.type,
    }
  }

  async function enviarMensagemCliente() {
  if (!selectedChamado) return

  const temMensagem = novaMensagem.trim().length > 0
  const temArquivo = !!arquivo

  if (!temMensagem && !temArquivo) {
    alert('Digite uma mensagem ou selecione uma imagem.')
    return
  }

  setEnviandoMensagem(true)

  const anexo = await uploadArquivo(selectedChamado.id)

  if (temArquivo && !anexo) {
    setEnviandoMensagem(false)
    return
  }

  const mensagem = {
    chamado_id: selectedChamado.id,
    user_id: user.id,
    mensagem: temMensagem ? novaMensagem.trim() : '',
    autor_nome: perfilCliente?.nome || user.user_metadata?.full_name || user.email,
    autor_email: user.email,
    autor_tipo: 'cliente',
    anexo_url: anexo?.url || null,
    anexo_nome: anexo?.nome || null,
    anexo_tipo: anexo?.tipo || null,
  }

  const { data, error } = await supabase
    .from('mensagens_chamado')
    .insert([mensagem])
    .select()
    .single()

  if (error) {
    console.error(error)
    alert('Erro ao enviar mensagem.')
    setEnviandoMensagem(false)
    return
  }

  setMensagens((prev) => [...prev, data])
  setNovaMensagem('')
  setArquivo(null)
  setEnviandoMensagem(false)
}

  function formatDate(date) {
    if (!date) return '-'
    return new Date(date).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  function statusClass(status) {
    return status?.toLowerCase().replaceAll(' ', '-') || 'aberto'
  }

  if (checkingUser) return <p>Verificando login...</p>

  if (!user) {
    return (
      <section className="chamadoBox">
        <div className="sectionHeader">
          <span>Central do cliente</span>
          <h2>Entre para continuar</h2>
          <p>Faça login para abrir ou acompanhar seus chamados.</p>
        </div>
        <LoginButton />
      </section>
    )
  }

  return (
    <section className="chamadoBox">
      <div className="sectionHeader">
        <span>Central do cliente</span>
        <h2>Meus atendimentos</h2>
        <p>Abra chamados, acompanhe o andamento e converse com o suporte.</p>
        <small>Logado como: {user.email}</small>
      </div>

      <div className="clienteTabs">
        <button
          className={activeView === 'abrir' ? 'active' : ''}
          onClick={() => setActiveView('abrir')}
          type="button"
        >
          Abrir chamado
        </button>

        <button
          className={activeView === 'acompanhar' ? 'active' : ''}
          onClick={() => {
            setActiveView('acompanhar')
            loadMeusChamados(user.id)
          }}
          type="button"
        >
          Acompanhar chamados
        </button>
      </div>

      {activeView === 'abrir' && (
        <form className="chamadoForm" onSubmit={handleSubmit}>
          <input
            name="nome"
            placeholder="Seu nome"
            value={form.nome}
            onChange={handleChange}
            required
          />

          <input
            name="telefone"
            placeholder="WhatsApp / telefone"
            value={form.telefone}
            onChange={handleChange}
          />

          <input
            name="condominio"
            placeholder="Condomínio"
            value={form.condominio}
            onChange={handleChange}
          />

          <input
            name="apartamento"
            placeholder="Apartamento / bloco"
            value={form.apartamento}
            onChange={handleChange}
          />

          <select name="servico" value={form.servico} onChange={handleChange} required>
            <option value="">Tipo de serviço</option>
            <option>Suporte para computadores</option>
            <option>Wi-Fi e internet</option>
            <option>Câmeras de segurança</option>
            <option>Elétrica residencial</option>
            <option>Segurança digital</option>
            <option>Backup e upgrade</option>
          </select>

          <select name="urgencia" value={form.urgencia} onChange={handleChange}>
            <option>Baixa</option>
            <option>Normal</option>
            <option>Alta</option>
            <option>Urgente</option>
          </select>

          <textarea
            name="descricao"
            placeholder="Descreva o problema"
            value={form.descricao}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Abrir chamado'}
          </button>

          {success && <strong className="chamadoSuccess">Chamado aberto com sucesso!</strong>}
        </form>
      )}

      {activeView === 'acompanhar' && (
        <div className="meusChamadosBox">
          <div className="meusChamadosHeader">
            <h3>Meus chamados</h3>
            <button type="button" onClick={() => loadMeusChamados(user.id)}>
              Atualizar
            </button>
          </div>

          {loadingChamados ? (
            <p>Carregando seus chamados...</p>
          ) : meusChamados.length === 0 ? (
            <p>Você ainda não possui chamados.</p>
          ) : (
            <div className="meusChamadosLista">
              {meusChamados.map((chamado) => (
                <div className="meuChamadoCard" key={chamado.id}>
                  <div>
                    <strong>#{chamado.ticket_id || '-'}</strong>
                    <h4>{chamado.servico}</h4>
                    <p>{formatDate(chamado.created_at)}</p>
                  </div>

                  <span className={`clienteStatus ${statusClass(chamado.status)}`}>
                    {chamado.status || 'Aberto'}
                  </span>

                  <button type="button" onClick={() => abrirDetalhes(chamado)}>
                    Ver conversa
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedChamado && (
        <div className="clienteModalOverlay">
          <div className="clienteModal">
            <button className="clienteCloseModal" onClick={fecharDetalhes}>
              ×
            </button>

            <div className="clienteModalHeader">
              <span>Chamado #{selectedChamado.ticket_id || '-'}</span>
              <h3>{selectedChamado.servico}</h3>
              <p>
                Status: <strong>{selectedChamado.status}</strong>
              </p>
            </div>

            <div className="clienteDescricaoBox">
              <strong>Descrição enviada:</strong>
              <p>{selectedChamado.descricao}</p>
            </div>

            <div className="clienteMensagensBox">
              <h4>Conversa</h4>

              {mensagens.length === 0 ? (
                <p className="semMensagensCliente">Ainda não há mensagens neste chamado.</p>
              ) : (
                <div className="clienteMensagensLista">
                  {mensagens.map((msg) => (
                    <div
                      key={msg.id}
                      className={`clienteMensagemItem ${
                        msg.autor_tipo === 'admin'
                          ? 'clienteMensagemAdmin'
                          : 'clienteMensagemCliente'
                      }`}
                    >
                      <div className="clienteMensagemMeta">
                        <strong>{msg.autor_tipo === 'admin' ? 'Suporte' : 'Você'}</strong>
                        <span>{formatDate(msg.created_at)}</span>
                      </div>

                      {msg.mensagem && <p>{msg.mensagem}</p>}

                      {msg.anexo_url && (
                        <div className="clienteAnexoBox">
                          {msg.anexo_tipo?.startsWith('image/') ? (
                            <a href={msg.anexo_url} target="_blank" rel="noreferrer">
                              <img src={msg.anexo_url} alt={msg.anexo_nome || 'Imagem'} />
                            </a>
                          ) : (
                            <a href={msg.anexo_url} target="_blank" rel="noreferrer">
                              Abrir anexo: {msg.anexo_nome}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="clienteRespostaBox">
                <textarea
                  placeholder="Digite sua resposta..."
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                />

                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                />

                {arquivo && <small>Arquivo selecionado: {arquivo.name}</small>}

                <button type="button" onClick={enviarMensagemCliente} disabled={enviandoMensagem}>
                  {enviandoMensagem ? 'Enviando...' : 'Enviar mensagem'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ChamadoForm