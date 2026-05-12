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
    }
  }, [user])

  const carregarPerfil = async (userId) => {
    const { data, error } = await supabase
      .from('perfis_clientes')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error(error)
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

    if (!perfilEstaCompleto()) {
      setShowPerfilModal(true)
      return
    }

    setServicoSelecionado(servico)
    setChamadoMode('abrir')
    setShowChamado(true)
  }

  const acompanharChamados = () => {
    if (!user) return

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
      return
    }

    setPerfilCliente(data)
    setShowPerfilModal(false)
  }

  const services = [
    {
      icon: <Laptop size={24} />,
      title: 'Computadores',
      desc: 'Notebook lento e manutenção.',
      details: [
        'Formatação',
        'Troca de SSD',
        'Upgrade de memória',
        'Limpeza interna',
        'Notebook lento',
        'Instalação de programas',
      ],
    },
    {
      icon: <Wifi size={24} />,
      title: 'Wi-Fi',
      desc: 'Internet e roteadores.',
      details: [
        'Configuração de roteador',
        'Rede mesh',
        'Melhoria de sinal',
        'Internet caindo',
      ],
    },
    {
      icon: <Camera size={24} />,
      title: 'Câmeras',
      desc: 'Instalação e configuração.',
      details: [
        'Instalação',
        'Configuração no celular',
        'Acesso remoto',
        'DVR/NVR',
      ],
    },
    {
      icon: <Plug size={24} />,
      title: 'Elétrica',
      desc: 'Pequenos reparos.',
      details: [
        'Tomadas',
        'Disjuntores',
        'Iluminação',
        'Ventiladores',
      ],
    },
    {
      icon: <ShieldCheck size={24} />,
      title: 'Segurança',
      desc: 'Proteção digital.',
      details: [
        'Remoção de vírus',
        'Proteção contra golpes',
        'Segurança de contas',
        'Backup seguro',
      ],
    },
    {
      icon: <HardDrive size={24} />,
      title: 'Backup',
      desc: 'SSD e upgrades.',
      details: [
        'Backup de arquivos',
        'Troca para SSD',
        'Upgrade',
        'Migração de dados',
      ],
    },
  ]

  if (showChamado) {
    return (
      <ChamadoForm
        initialView={chamadoMode}
        perfilCliente={perfilCliente}
        servicoInicial={servicoSelecionado}
      />
    )
  }

  if (selectedService) {
    return (
      <main className="serviceDetailsPage">
        <div className="serviceDetailsHeader">
          <button
            className="serviceBackButton"
            onClick={() => setSelectedService(null)}
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
        </div>

        <section className="serviceDetailsCard">
          <div className="serviceDetailsIcon">
            {selectedService.icon}
          </div>

          <h1>{selectedService.title}</h1>

          <p>{selectedService.desc}</p>

          <div className="serviceDetailsList">
            {selectedService.details.map((item, index) => (
              <div key={index} className="serviceDetailsItem">
                <CheckCircle2 size={18} />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <button
            className="serviceOpenButton"
            onClick={() => abrirChamado(selectedService.title)}
          >
            Abrir chamado
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="appMode">
      <header className="appHeader">
        <img src={logo} alt="Logo" className="appLogo" />

        <div className="appHeaderButtons">
          <a
            href="https://wa.me/5511952491217"
            target="_blank"
            rel="noreferrer"
            className="miniButton"
          >
            <MessageCircle size={18} />
            WhatsApp
          </a>

          <button
            className="miniButton"
            onClick={() => setShowPerfilModal(true)}
          >
            <User size={18} />
            Conta
          </button>
        </div>
      </header>

      <section className="appServices">
        <span className="appSectionLabel">SERVIÇOS</span>

        <h2>Atendimento residencial</h2>

        <div className="appServicesGrid">
          {services.map((service) => (
            <button
              key={service.title}
              className="appServiceCard"
              onClick={() => setSelectedService(service)}
            >
              <div className="appServiceIcon">
                {service.icon}
              </div>

              <div className="appServiceContent">
                <strong>{service.title}</strong>
                <span>{service.desc}</span>
              </div>

              <ChevronRight size={22} />
            </button>
          ))}
        </div>
      </section>

      <nav className="bottomNav">
        <button className="bottomNavItem active">
          <Home size={22} />
          <span>Início</span>
        </button>

        <button
          className="bottomNavItem"
          onClick={acompanharChamados}
        >
          <CheckCircle2 size={22} />
          <span>Chamados</span>
        </button>

        <button
          className="bottomNavItem"
          onClick={() => setShowPerfilModal(true)}
        >
          <User size={22} />
          <span>Conta</span>
        </button>
      </nav>
    </main>
  )
}

export default AppHome