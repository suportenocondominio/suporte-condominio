import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import LoginButton from '../components/LoginButton'
import logo from '../assets/logo.png'
import './AdminChamados.css'

function AdminChamados() {
  const [chamados, setChamados] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  const [selectedChamado, setSelectedChamado] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const [statusFilter, setStatusFilter] = useState('Todos')
  const [search, setSearch] = useState('')

  const [mensagens, setMensagens] = useState([])
  const [novaMensagem, setNovaMensagem] = useState('')
  const [arquivo, setArquivo] = useState(null)
  const [enviandoMensagem, setEnviandoMensagem] = useState(false)
  const [loadingMensagens, setLoadingMensagens] = useState(false)

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const loggedUser = userData.user
    setUser(loggedUser)

    if (!loggedUser) {
      setAuthChecked(true)
      setLoading(false)
      return
    }

    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('email', loggedUser.email)
      .eq('ativo', true)
      .single()

    if (!adminData) {
      setIsAdmin(false)
      setAuthChecked(true)
      setLoading(false)
      return
    }

    setIsAdmin(true)
    setAuthChecked(true)
    await loadChamados()
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    window.location.href = '/'
  }

  async function loadChamados() {
    setLoading(true)

    const { data, error } = await supabase
      .from('chamados')
      .select('*')
      .order('ticket_id', { ascending: false })

    if (error) {
      console.error(error)
      alert('Erro ao carregar chamados')
      setLoading(false)
      return
    }

      setChamados(data || [])
    setLoading(false)
  }

  async function loadMensagens(chamadoId) {
    setLoadingMensagens(true)

    const { data, error } = await supabase
      .from('mensagens_chamado')
      .select('*')
      .eq('chamado_id', chamadoId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error(error)
      alert('Erro ao carregar mensagens')
      setLoadingMensagens(false)
      return
    }

    setMensagens(data || [])
    setLoadingMensagens(false)
  }

  async function uploadArquivo(chamadoId) {
    if (!arquivo) return null

    const extensao = arquivo.name.split('.').pop()
    const nomeArquivo = `${chamadoId}/admin-${Date.now()}.${extensao}`

    const { error } = await supabase.storage
      .from('chamados-anexos')
      .upload(nomeArquivo, arquivo)

    if (error) {
      console.error(error)
      alert('Erro ao enviar anexo')
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

  async function enviarMensagem() {
    if (!selectedChamado) return

    if (!novaMensagem.trim() && !arquivo) {
      alert('Digite uma mensagem ou selecione um anexo.')
      return
    }

    setEnviandoMensagem(true)

    const anexo = await uploadArquivo(selectedChamado.id)

    const mensagem = {
      chamado_id: selectedChamado.id,
      user_id: user.id,
      mensagem: novaMensagem.trim() || ' ',
      autor_nome: user.user_metadata?.full_name || user.email,
      autor_email: user.email,
      autor_tipo: 'admin',
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
      alert('Erro ao enviar mensagem')
      setEnviandoMensagem(false)
      return
    }

const { data: emailData, error: emailError } = await supabase.functions.invoke(
  'notificar-cliente-chamado',
  {
    body: {
      ticketId: selectedChamado.ticket_id,
      clienteNome: selectedChamado.nome,
      clienteEmail: selectedChamado.email,
      mensagem:
        novaMensagem.trim() ||
        'O suporte enviou uma nova atualização no seu chamado.',
    },
  }
)

console.log('Retorno e-mail:', emailData)
console.error('Erro e-mail:', emailError)

    setMensagens((prev) => [...prev, data])
    setNovaMensagem('')
    setArquivo(null)
    setEnviandoMensagem(false)
  }

  async function updateStatus(id, status) {
    const { error } = await supabase
      .from('chamados')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error(error)
      alert('Erro ao atualizar status')
      return
    }

    setChamados((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    )

    if (selectedChamado?.id === id) {
      setSelectedChamado((prev) => ({ ...prev, status }))
    }
  }

  function abrirDetalhes(chamado) {
    setSelectedChamado(chamado)
    setShowModal(true)
    setMensagens([])
    setNovaMensagem('')
    setArquivo(null)
    loadMensagens(chamado.id)
  }

  function fecharModal() {
    setShowModal(false)
    setSelectedChamado(null)
    setMensagens([])
    setNovaMensagem('')
    setArquivo(null)
  }

  function statusClass(status) {
    return status?.toLowerCase().replaceAll(' ', '-') || 'aberto'
  }

  function formatDate(date) {
    if (!date) return '-'

    return new Date(date).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  const chamadosFiltrados = useMemo(() => {
    return chamados.filter((chamado) => {
      const matchStatus =
        statusFilter === 'Todos' || chamado.status === statusFilter

      const termo = search.toLowerCase()

      const matchSearch =
        !termo ||
        chamado.nome?.toLowerCase().includes(termo) ||
        chamado.email?.toLowerCase().includes(termo) ||
        chamado.servico?.toLowerCase().includes(termo) ||
        chamado.condominio?.toLowerCase().includes(termo) ||
        String(chamado.ticket_id).includes(termo)

      return matchStatus && matchSearch
    })
  }, [chamados, statusFilter, search])

  if (!authChecked) {
    return (
      <main className="adminPageSimple">
        <div className="adminCenter">
          <h1>Carregando...</h1>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="adminPageSimple">
        <div className="adminCenter">
          <h1>Área Administrativa</h1>
          <p>Faça login com uma conta autorizada.</p>
          <LoginButton />
        </div>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="adminPageSimple">
        <div className="adminCenter">
          <h1>Acesso negado</h1>
          <p>Sua conta não possui permissão para acessar o painel.</p>
          <button className="adminLogoutButton" onClick={logout}>Sair</button>
        </div>
      </main>
    )
  }

  return (
    <main className="adminShell">
      <aside className="adminSidebar">
        <div className="adminBrand">
          <img src={logo} alt="Logo" />
          <div>
            <strong>Suporte</strong>
            <span>no Condomínio</span>
          </div>
        </div>

        <nav className="adminNav">
          <a className="active" href="/admin">Chamados</a>
          <a href="/">Site principal</a>
        </nav>

        <div className="adminUserBox">
          <small>Logado como</small>
          <strong>{user.email}</strong>
          <button onClick={logout}>Sair</button>
        </div>
      </aside>

      <section className="adminContent">
        <header className="adminHeader">
          <div>
            <h1>Painel de Chamados</h1>
            <p>Gerencie atendimentos, converse com clientes e acompanhe status.</p>
          </div>

          <button onClick={loadChamados}>Atualizar</button>
        </header>

        <section className="adminCards">
          <div>
            <span>Total</span>
            <strong>{chamados.length}</strong>
          </div>
          <div>
            <span>Abertos</span>
            <strong>{chamados.filter((c) => c.status === 'Aberto').length}</strong>
          </div>
          <div>
            <span>Em andamento</span>
            <strong>{chamados.filter((c) => c.status === 'Em andamento').length}</strong>
          </div>
          <div>
            <span>Resolvidos</span>
            <strong>{chamados.filter((c) => c.status === 'Resolvido').length}</strong>
          </div>
        </section>

        <section className="adminFilters">
          <input
            type="text"
            placeholder="Buscar por ID, nome, e-mail, serviço ou condomínio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>Todos</option>
            <option>Aberto</option>
            <option>Em andamento</option>
            <option>Aguardando morador</option>
            <option>Resolvido</option>
            <option>Cancelado</option>
          </select>
        </section>

        <section className="filterInfo">
          <strong>{chamadosFiltrados.length}</strong> chamado(s) encontrado(s)
          {statusFilter !== 'Todos' && (
            <span> · Filtro aplicado: {statusFilter}</span>
          )}
        </section>

        {loading ? (
          <div className="adminLoading">Carregando chamados...</div>
        ) : chamadosFiltrados.length === 0 ? (
          <div className="emptyState">
            <h2>Nenhum chamado encontrado</h2>
            <p>Altere o filtro ou aguarde novos chamados.</p>
          </div>
        ) : (
          
                 
          <div className="tableWrapper">
            <table className="chamadosTable">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Morador</th>
                  <th>Serviço</th>
                  <th>Urgência</th>
                  <th>Status</th>
                  <th>Condomínio</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {chamadosFiltrados.map((chamado) => (
                  <tr key={chamado.id}>
                    <td>
  <button
    className="ticketLink"
    onClick={() => abrirDetalhes(chamado)}
  >
    #{chamado.ticket_id}
  </button>
</td>

                    <td>
                      <div className="moradorCell">
                        <strong>{chamado.nome}</strong>
                        <span>{chamado.email}</span>
                      </div>
                    </td>

                    <td>{chamado.servico}</td>

                    <td>
                      <span className={`urgencia urgencia-${chamado.urgencia?.toLowerCase()}`}>
                        {chamado.urgencia}
                      </span>
                    </td>

                    <td>
                      <select
                        className={`statusSelect ${statusClass(chamado.status)}`}
                        value={chamado.status || 'Aberto'}
                        onChange={(e) => updateStatus(chamado.id, e.target.value)}
                      >
                        <option>Aberto</option>
                        <option>Em andamento</option>
                        <option>Aguardando morador</option>
                        <option>Resolvido</option>
                        <option>Cancelado</option>
                      </select>
                    </td>

                    <td>{chamado.condominio || '-'}</td>

                    <td>{formatDate(chamado.created_at)}</td>

                    <td>
                      <button
                        className="detailsButton"
                        onClick={() => abrirDetalhes(chamado)}
                      >
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          
        )}

        {showModal && selectedChamado && (
          <div className="modalOverlay">
            <div className="modalChamado">
              <button className="closeModal" onClick={fecharModal}>×</button>

              <div className="modalHeader">
                <div>
                  <span>Chamado #{selectedChamado.ticket_id}</span>
                  <h2>{selectedChamado.nome}</h2>
                  <p>Aberto em {formatDate(selectedChamado.created_at)}</p>
                </div>

                <select
                  className={`statusSelect ${statusClass(selectedChamado.status)}`}
                  value={selectedChamado.status || 'Aberto'}
                  onChange={(e) => updateStatus(selectedChamado.id, e.target.value)}
                >
                  <option>Aberto</option>
                  <option>Em andamento</option>
                  <option>Aguardando morador</option>
                  <option>Resolvido</option>
                  <option>Cancelado</option>
                </select>
              </div>

              <div className="modalInfo">
                <p><strong>Serviço:</strong> {selectedChamado.servico}</p>
                <p><strong>Urgência:</strong> {selectedChamado.urgencia}</p>
                <p><strong>Condomínio:</strong> {selectedChamado.condominio || '-'}</p>
                <p><strong>Apartamento:</strong> {selectedChamado.apartamento || '-'}</p>
                <p><strong>Telefone:</strong> {selectedChamado.telefone || '-'}</p>
                <p><strong>Email:</strong> {selectedChamado.email || '-'}</p>

                <p><strong>Descrição:</strong></p>
                <div className="descricaoBox">{selectedChamado.descricao}</div>
              </div>

              <section className="mensagensBox">
                <div className="mensagensHeader">
                  <h3>Interação com o cliente</h3>
                  <span>{mensagens.length} mensagem(ns)</span>
                </div>

                {loadingMensagens ? (
                  <p className="mensagensLoading">Carregando mensagens...</p>
                ) : mensagens.length === 0 ? (
                  <div className="semMensagens">
                    Nenhuma mensagem registrada ainda.
                  </div>
                ) : (
                  <div className="mensagensLista">
                    {mensagens.map((msg) => (
                      <div
                        className={`mensagemItem ${msg.autor_tipo === 'admin' ? 'mensagemAdmin' : 'mensagemCliente'}`}
                        key={msg.id}
                      >
                        <div className="mensagemMeta">
                          <strong>{msg.autor_tipo === 'admin' ? 'Suporte' : 'Cliente'}</strong>
                          <span>{formatDate(msg.created_at)}</span>
                        </div>

                        {msg.mensagem && <p>{msg.mensagem}</p>}

                        {msg.anexo_url && (
                          <div className="adminAnexoBox">
                            {msg.anexo_tipo?.startsWith('image/') ? (
                              <a href={msg.anexo_url} target="_blank" rel="noreferrer">
                                <img src={msg.anexo_url} alt={msg.anexo_nome || 'Imagem anexada'} />
                              </a>
                            ) : (
                              <a href={msg.anexo_url} target="_blank" rel="noreferrer">
                                Abrir anexo: {msg.anexo_nome || 'arquivo'}
                              </a>
                            )}
                          </div>
                        )}

                        {msg.autor_email && <small>{msg.autor_email}</small>}
                      </div>
                    ))}
                  </div>
                )}

                <div className="respostaBox">
                  <textarea
                    placeholder="Digite uma resposta para o cliente..."
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                  />

                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                  />

                  {arquivo && <small>Arquivo selecionado: {arquivo.name}</small>}

                  <button
                    onClick={enviarMensagem}
                    disabled={enviandoMensagem || (!novaMensagem.trim() && !arquivo)}
                  >
                    {enviandoMensagem ? 'Enviando...' : 'Enviar resposta'}
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default AdminChamados