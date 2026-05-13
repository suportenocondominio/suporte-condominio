import { useEffect, useState } from 'react'
import '../App.css'

import logo from '../assets/logo.png'
import ChamadoForm from '../components/ChamadoForm'
import LoginButton from '../components/LoginButton'

import { supabase } from '../lib/supabase'

import {
  Laptop,
  Wifi,
  Camera,
  Plug,
  ShieldCheck,
  HardDrive,
  MessageCircle,
  CheckCircle2,
  Home,
  User,
  ChevronRight,
  PlusCircle,
  ArrowLeft,
} from 'lucide-react'

function AppHome({ user, setUser }) {
  const [showChamado, setShowChamado] = useState(false)
  const [chamadoMode, setChamadoMode] = useState('abrir')
  const [perfilCliente, setPerfilCliente] = useState(null)
  const [showPerfilModal, setShowPerfilModal] = useState(false)
  const [salvandoPerfil, setSalvandoPerfil] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [servicoSelecionado, setServicoSelecionado] = useState('')

  const [perfilForm, setPerfilForm] = useState({
    nome: '',
    telefone: '',
    condominio: '',
    bloco: '',
    apartamento: '',
    endereco: '',
  })

  useEffect(() => {
    if (user) {
      carregarPerfil(user.id)
    } else {
      setPerfilCliente(null)
      setShowChamado(false)
      setShowPerfilModal(false)
      setSelectedService(null)
      setServicoSelecionado('')
    }
  }, [user])

  const carregarPerfil = async (userId) => {
    const { data, error } = await supabase
      .from('perfis_clientes')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Erro ao carregar perfil:', error)
      return
    }

    if (data) {
      setPerfilCliente(data)
      setPerfilForm({
        nome: data.nome || '',
        telefone: data.telefone || '',
        condominio: data.condominio || '',
        bloco: data.bloco || '',
        apartamento: data.apartamento || '',
        endereco: data.endereco || '',
      })
    }
  }

  const perfilEstaCompleto = () => {
    return (
      perfilCliente?.nome &&
      perfilCliente?.telefone &&
      perfilCliente?.condominio &&
      perfilCliente?.apartamento
    )
  }

  const abrirChamado = (servico = '') => {
    if (!user) return

    setServicoSelecionado(servico)

    if (!perfilEstaCompleto()) {
      setShowPerfilModal(true)
      return
    }

    setSelectedService(null)
    setChamadoMode('abrir')
    setShowChamado(true)
  }

  const acompanharChamados = () => {
    if (!user) return

    setSelectedService(null)
    setServicoSelecionado('')
    setChamadoMode('acompanhar')
    setShowChamado(true)
  }

  const salvarPerfilCliente = async (e) => {
    e.preventDefault()
    if (!user) return

    setSalvandoPerfil(true)

    const payload = {
      id: user.id,
      nome: perfilForm.nome,
      telefone: perfilForm.telefone,
      condominio: perfilForm.condominio,
      bloco: perfilForm.bloco,
      apartamento: perfilForm.apartamento,
      endereco: perfilForm.endereco,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('perfis_clientes')
      .upsert(payload)
      .select()
      .single()

    setSalvandoPerfil(false)

    if (error) {
      alert('Erro ao salvar cadastro.')
      console.error(error)
      return
    }

    setPerfilCliente(data)
    setShowPerfilModal(false)

    if (servicoSelecionado) {
      setSelectedService(null)
      setChamadoMode('abrir')
      setShowChamado(true)
    }
  }

  const whatsappBase = 'https://wa.me/5511952491217'
  const whatsapp = `${whatsappBase}?text=${encodeURIComponent(
    'Olá! Vim pelo app Suporte no Condomínio e gostaria de solicitar um atendimento.'
  )}`

  const services = [
    {
      icon: <Laptop size={24} />,
      title: 'Computadores',
      formValue: 'Suporte para computadores',
      desc: 'Notebook lento e manutenção.',
      details: [
        'Notebook lento ou travando',
        'Formatação e reinstalação',
        'Troca para SSD',
        'Upgrade de memória',
        'Instalação de programas',
        'Limpeza e manutenção preventiva',
      ],
    },
    {
      icon: <Wifi size={24} />,
      title: 'Wi-Fi',
      formValue: 'Wi-Fi e internet',
      desc: 'Internet e roteadores.',
      details: [
        'Internet caindo',
        'Configuração de roteador',
        'Melhoria de sinal',
        'Rede mesh',
        'Organização da rede residencial',
        'Orientação de melhor posicionamento',
      ],
    },
    {
      icon: <Camera size={24} />,
      title: 'Câmeras',
      formValue: 'Câmeras de segurança',
      desc: 'Instalação e configuração.',
      details: [
        'Instalação de câmeras',
        'Configuração no celular',
        'Acesso remoto',
        'DVR/NVR',
        'Ajuste de gravação',
        'Orientação de uso do aplicativo',
      ],
    },
    {
      icon: <Plug size={24} />,
      title: 'Elétrica',
      formValue: 'Elétrica residencial',
      desc: 'Pequenos reparos.',
      details: [
        'Tomadas',
        'Iluminação',
        'Pequenos reparos',
        'Disjuntores',
        'Instalação simples',
        'Avaliação inicial do problema',
      ],
    },
    {
      icon: <ShieldCheck size={24} />,
      title: 'Segurança',
      formValue: 'Segurança digital',
      desc: 'Proteção digital.',
      details: [
        'Remoção de vírus',
        'Proteção contra golpes',
        'Segurança de contas',
        'Orientação de senhas',
        'Backup seguro',
        'Apoio em suspeita de invasão',
      ],
    },
    {
      icon: <HardDrive size={24} />,
      title: 'Backup',
      formValue: 'Backup e upgrade',
      desc: 'SSD e upgrades.',
      details: [
        'Backup de arquivos',
        'Migração de dados',
        'Troca para SSD',
        'Upgrade de computador',
        'Organização de arquivos',
        'Proteção contra perda de dados',
      ],
    },
  ]

  if (!user) {
    return (
      <main className="appMode appAuthMode">
        <section className="appAuthCard">
          <img src={logo} alt="Suporte no Condomínio" className="appAuthLogo" />

          <h1>Suporte no Condomínio</h1>
          <p>Entre para abrir chamados, acompanhar atendimentos e falar com nossa equipe.</p>

          <div className="appAuthLogin">
            <LoginButton />
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="appMode">
      <header className="appHeaderPremium">
        <div className="appBrandCompact">
          <img src={logo} alt="Suporte no Condomínio" className="appLogoCompact" />

          <div>
            <strong>Suporte no Condomínio</strong>
            <span>Central de atendimento</span>
          </div>
        </div>
      </header>

      <section className="appHero">
        <h2>Olá, {perfilCliente?.nome || user.user_metadata?.full_name || 'morador'} </h2>
        <p>Solicite suporte, acompanhe chamados e fale com nossa equipe.</p>
      </section>

      <section className="appQuickPanel">
        <button className="appMainShortcut" onClick={() => abrirChamado('')}>
          <div className="appShortcutIcon">
            <PlusCircle size={24} />
          </div>

          <div>
            <strong>Abrir chamado</strong>
            <span>Abra um chamado para nossa equipe</span>
          </div>

          <ChevronRight size={22} />
        </button>

        <button className="appMainShortcut appMainShortcutSecondary" onClick={acompanharChamados}>
          <div className="appShortcutIcon">
            <CheckCircle2 size={24} />
          </div>

          <div>
            <strong>Meus chamados</strong>
            <span>Acompanhe respostas e status</span>
          </div>

          <ChevronRight size={22} />
        </button>

        <div className="appMiniActions">
          <a href={whatsapp} target="_blank" rel="noreferrer" className="appMiniAction">
            <MessageCircle size={20} />
            <span>WhatsApp</span>
          </a>

          <button className="appMiniAction" onClick={() => setShowPerfilModal(true)}>
            <User size={20} />
            <span>Conta</span>
          </button>
        </div>
      </section>

      <section className="appServices">
        <div className="sectionHeader">
          <span>Serviços</span>
          <h2>Atendimento residencial</h2>
        </div>

        <div className="servicesGrid">
          {services.map((service) => (
            <button
              type="button"
              className="serviceCard"
              key={service.title}
              onClick={() => setSelectedService(service)}
            >
              <div className="serviceIcon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
              <ChevronRight className="serviceChevron" size={20} />
            </button>
          ))}
        </div>
      </section>

      <nav className="bottomNav">
        <a href="#">
          <Home size={22} />
          <span>Início</span>
        </a>

        <button type="button" onClick={acompanharChamados}>
          <CheckCircle2 size={22} />
          <span>Chamados</span>
        </button>

        <button type="button" onClick={() => setShowPerfilModal(true)}>
          <User size={22} />
          <span>Conta</span>
        </button>
      </nav>

      {selectedService && (
        <div className="modalOverlay" onClick={() => setSelectedService(null)}>
          <div className="modalContent appModalContent" onClick={(e) => e.stopPropagation()}>
            <button className="closeModal" onClick={() => setSelectedService(null)}>
              ×
            </button>

            <button
              type="button"
              className="serviceBackButton"
              onClick={() => setSelectedService(null)}
            >
              <ArrowLeft size={18} />
              Voltar
            </button>

            <div className="serviceDetailsCard">
              <div className="serviceDetailsIcon">{selectedService.icon}</div>

              <h1>{selectedService.title}</h1>
              <p>{selectedService.desc}</p>

              <div className="serviceDetailsList">
                {selectedService.details.map((item) => (
                  <div className="serviceDetailsItem" key={item}>
                    <CheckCircle2 size={18} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="serviceOpenButton"
                onClick={() => abrirChamado(selectedService.formValue)}
              >
                Abrir chamado
              </button>
            </div>
          </div>
        </div>
      )}

      {showChamado && (
        <div className="modalOverlay" onClick={() => setShowChamado(false)}>
          <div className="modalContent appModalContent" onClick={(e) => e.stopPropagation()}>
            <button className="closeModal" onClick={() => setShowChamado(false)}>
              ×
            </button>

            <ChamadoForm
              initialView={chamadoMode}
              perfilCliente={perfilCliente}
              servicoInicial={servicoSelecionado}
            />
          </div>
        </div>
      )}

      {showPerfilModal && (
        <div className="modalOverlay" onClick={() => setShowPerfilModal(false)}>
          <div className="modalContent perfilModalContent" onClick={(e) => e.stopPropagation()}>
            <button className="closeModal" onClick={() => setShowPerfilModal(false)}>
              ×
            </button>

            <h2>Minha conta</h2>

            <div className="accountLinks">
              <a href="/politica-privacidade" target="_blank" rel="noreferrer">
                Política de Privacidade
              </a>

              <a href="/termos-de-uso" target="_blank" rel="noreferrer">
                Termos de Uso
              </a>

              <a href="/excluir-conta" target="_blank" rel="noreferrer" className="dangerLink">
                Excluir minha conta
              </a>
            </div>

            <form className="perfilForm" onSubmit={salvarPerfilCliente}>
              <label>
                Nome completo
                <input
                  type="text"
                  value={perfilForm.nome}
                  onChange={(e) => setPerfilForm({ ...perfilForm, nome: e.target.value })}
                  required
                />
              </label>

              <label>
                Telefone
                <input
                  type="tel"
                  value={perfilForm.telefone}
                  onChange={(e) => setPerfilForm({ ...perfilForm, telefone: e.target.value })}
                  required
                />
              </label>

              <label>
                Condomínio
                <input
                  type="text"
                  value={perfilForm.condominio}
                  onChange={(e) => setPerfilForm({ ...perfilForm, condominio: e.target.value })}
                  required
                />
              </label>

              <label>
                Apartamento
                <input
                  type="text"
                  value={perfilForm.apartamento}
                  onChange={(e) => setPerfilForm({ ...perfilForm, apartamento: e.target.value })}
                  required
                />
              </label>

              <button type="submit" className="premiumPrimaryButton" disabled={salvandoPerfil}>
                {salvandoPerfil ? 'Salvando...' : 'Salvar'}
              </button>

              <button
                type="button"
                className="perfilLogoutButton"
                onClick={async () => {
                  await supabase.auth.signOut()
                  setUser(null)
                  setPerfilCliente(null)
                  setShowPerfilModal(false)
                  setShowChamado(false)
                  setSelectedService(null)
                  setServicoSelecionado('')
                }}
              >
                Sair da conta
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default AppHome
