import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import LoginButton from '../components/LoginButton'
import './AdminChamados.css'

function AdminChamados() {
  const [chamados, setChamados] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

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

  async function loadChamados() {
    const { data, error } = await supabase
      .from('chamados')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      alert('Erro ao carregar chamados')
      setLoading(false)
      return
    }

    setChamados(data || [])
    setLoading(false)
  }

  if (!authChecked) {
    return (
      <main className="adminPage">
        <div className="adminCenter">
          <h1>Carregando...</h1>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="adminPage">
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
      <main className="adminPage">
        <div className="adminCenter">
          <h1>Acesso negado</h1>
          <p>Sua conta não possui permissão para acessar o painel.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <h1>Painel de Chamados</h1>
        <button onClick={loadChamados}>Atualizar</button>
      </header>

      {loading ? (
        <div className="adminLoading">Carregando chamados...</div>
      ) : (
        <div className="chamadosGrid">
          {chamados.map((chamado) => (
            <div className="chamadoCard" key={chamado.id}>
              <div className="chamadoTop">
                <strong>{chamado.nome}</strong>
                <span className={`status ${chamado.status}`}>
                  {chamado.status}
                </span>
              </div>

              <div className="chamadoInfo">
                <p><strong>Serviço:</strong> {chamado.servico}</p>
                <p><strong>Urgência:</strong> {chamado.urgencia}</p>
                <p><strong>Condomínio:</strong> {chamado.condominio}</p>
                <p><strong>Apartamento:</strong> {chamado.apartamento}</p>
                <p><strong>Telefone:</strong> {chamado.telefone}</p>
                <p><strong>Descrição:</strong></p>

                <div className="descricaoBox">
                  {chamado.descricao}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default AdminChamados