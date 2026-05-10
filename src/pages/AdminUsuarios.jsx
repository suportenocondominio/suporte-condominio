import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import LoginButton from '../components/LoginButton'
import logo from '../assets/logo.png'
import './AdminUsuarios.css'

function AdminUsuarios() {
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [temPermissao, setTemPermissao] = useState(false)
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)

  const [novoEmail, setNovoEmail] = useState('')
  const [novoPerfil, setNovoPerfil] = useState('analista')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    checkPermissao()
  }, [])

  async function checkPermissao() {
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
      .eq('perfil', 'admin')
      .single()

    if (!adminData) {
      setTemPermissao(false)
      setAuthChecked(true)
      setLoading(false)
      return
    }

    setTemPermissao(true)
    setAuthChecked(true)
    await carregarUsuarios()
  }

  async function carregarUsuarios() {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('email', { ascending: true })

    if (error) {
      console.error(error)
      alert('Erro ao carregar usuários.')
      setLoading(false)
      return
    }

    setUsuarios(data || [])
    setLoading(false)
  }

  async function adicionarUsuario(e) {
    e.preventDefault()

    if (!novoEmail.trim()) {
      alert('Informe o e-mail.')
      return
    }

    setSalvando(true)

    const { error } = await supabase
      .from('admins')
      .insert([
        {
          email: novoEmail.trim().toLowerCase(),
          perfil: novoPerfil,
          ativo: true,
        },
      ])

    setSalvando(false)

    if (error) {
      console.error(error)
      alert('Erro ao adicionar usuário.')
      return
    }

    setNovoEmail('')
    setNovoPerfil('analista')
    carregarUsuarios()
  }

  async function alterarPerfil(id, perfil) {
    const { error } = await supabase
      .from('admins')
      .update({ perfil })
      .eq('id', id)

    if (error) {
      console.error(error)
      alert('Erro ao alterar perfil.')
      return
    }

    carregarUsuarios()
  }

  async function alterarStatus(id, ativo) {
    const { error } = await supabase
      .from('admins')
      .update({ ativo })
      .eq('id', id)

    if (error) {
      console.error(error)
      alert('Erro ao alterar status.')
      return
    }

    carregarUsuarios()
  }

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (!authChecked) {
    return (
      <main className="usuariosPageSimple">
        <h1>Carregando...</h1>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="usuariosPageSimple">
        <div className="usuariosCenter">
          <h1>Área Administrativa</h1>
          <p>Faça login com uma conta autorizada.</p>
          <LoginButton />
        </div>
      </main>
    )
  }

  if (!temPermissao) {
    return (
      <main className="usuariosPageSimple">
        <div className="usuariosCenter">
          <h1>Acesso negado</h1>
          <p>Apenas administradores podem gerenciar usuários.</p>
          <button onClick={logout}>Sair</button>
        </div>
      </main>
    )
  }

  return (
    <main className="usuariosShell">
      <aside className="usuariosSidebar">
        <div className="usuariosBrand">
          <img src={logo} alt="Logo" />
          <div>
            <strong>Suporte</strong>
            <span>no Condomínio</span>
          </div>
        </div>

        <nav className="usuariosNav">
          <a href="/admin">Chamados</a>
          <a className="active" href="/admin/usuarios">Usuários</a>
          <a href="/">Site principal</a>
        </nav>

        <div className="usuariosUserBox">
          <small>Logado como</small>
          <strong>{user.email}</strong>
          <button onClick={logout}>Sair</button>
        </div>
      </aside>

      <section className="usuariosContent">
        <header className="usuariosHeader">
          <div>
            <h1>Usuários</h1>
            <p>Gerencie administradores e analistas do painel.</p>
          </div>

          <button onClick={carregarUsuarios}>Atualizar</button>
        </header>

        <form className="usuariosForm" onSubmit={adicionarUsuario}>
          <input
            type="email"
            placeholder="email@dominio.com"
            value={novoEmail}
            onChange={(e) => setNovoEmail(e.target.value)}
          />

          <select
            value={novoPerfil}
            onChange={(e) => setNovoPerfil(e.target.value)}
          >
            <option value="analista">Analista</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Adicionar'}
          </button>
        </form>

        {loading ? (
          <p>Carregando usuários...</p>
        ) : (
          <div className="usuariosTableWrapper">
            <table className="usuariosTable">
              <thead>
                <tr>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map((item) => (
                  <tr key={item.id}>
                    <td>{item.email}</td>

                    <td>
                      <select
                        value={item.perfil || 'analista'}
                        onChange={(e) => alterarPerfil(item.id, e.target.value)}
                      >
                        <option value="analista">Analista</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td>
                      <span className={item.ativo ? 'statusAtivo' : 'statusInativo'}>
                        {item.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    <td>
                      <button
                        className={item.ativo ? 'desativarButton' : 'ativarButton'}
                        onClick={() => alterarStatus(item.id, !item.ativo)}
                      >
                        {item.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

export default AdminUsuarios