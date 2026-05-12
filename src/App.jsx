import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

import AppHome from './pages/AppHome'
import WebsiteHome from './pages/WebsiteHome'

import PoliticaPrivacidade from './pages/PoliticaPrivacidade'
import TermosUso from './pages/TermosUso'
import ExcluirConta from './pages/ExcluirConta'

function App() {
  const path = window.location.pathname.replace(/\/$/, '')

  /* PÁGINAS PÚBLICAS */

  if (path === '/politica-privacidade') {
    return <PoliticaPrivacidade />
  }

  if (path === '/termos-de-uso') {
    return <TermosUso />
  }

  if (path === '/excluir-conta') {
    return <ExcluirConta />
  }

  return <MainApp />
}

function MainApp() {
  const [isAppMode, setIsAppMode] = useState(false)
  const [user, setUser] = useState(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const appParam = params.get('app') === 'true'

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true

    setIsAppMode(appParam || standalone)

    async function loadUser() {
      const { data } = await supabase.auth.getUser()

      setUser(data.user ?? null)

      setLoadingAuth(false)
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loadingAuth) {
    return null
  }

  if (isAppMode) {
    return <AppHome user={user} setUser={setUser} />
  }

  return <WebsiteHome user={user} setUser={setUser} />
}

export default App