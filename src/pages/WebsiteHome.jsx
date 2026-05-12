import { useEffect, useState } from 'react'
import '../App.css'

import logo from '../assets/logo.png'
import heroImage from '../assets/hero-condominio.png'

import ChamadoForm from '../components/ChamadoForm'
import LoginButton from '../components/LoginButton'

import { supabase } from '../lib/supabase'

import {
  ShieldCheck,
  Wifi,
  Camera,
  Plug,
  Laptop,
  HardDrive,
  MessageCircle,
  ChevronRight,
  CheckCircle2,
  Clock3,
  Star,
  MapPin,
  Sparkles,
  Zap,
  HelpCircle,
  Wrench,
  Quote,
  User,
} from 'lucide-react'

function WebsiteHome({ user, setUser }) {
  const [showChamado, setShowChamado] = useState(false)
  const [chamadoMode, setChamadoMode] = useState('abrir')
  const [perfilCliente, setPerfilCliente] = useState(null)
  const [showPerfilModal, setShowPerfilModal] = useState(false)
  const [salvandoPerfil, setSalvandoPerfil] = useState(false)

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

  const abrirChamado = () => {
    if (!user) return

    if (!perfilEstaCompleto()) {
      setShowPerfilModal(true)
      return
    }

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
      alert('Erro ao salvar cadastro. Tente novamente.')
      console.error(error)
      return
    }

    setPerfilCliente(data)
    setShowPerfilModal(false)
    setChamadoMode('abrir')
    setShowChamado(true)
  }

  const whatsappBase = 'https://wa.me/5511952491217'

  const whatsapp = `${whatsappBase}?text=${encodeURIComponent(
    'Olá! Vim pelo site/app Suporte no Condomínio e gostaria de solicitar um atendimento.'
  )}`

  const services = [
    {
      icon: <Laptop size={30} />,
      title: 'Suporte para computadores',
      desc: 'Notebook lento, travando ou precisando de manutenção.',
      message: 'Olá! Gostaria de solicitar suporte para computador/notebook.',
    },
    {
      icon: <Wifi size={30} />,
      title: 'Wi-Fi e internet',
      desc: 'Configuração de roteadores, mesh e melhoria de sinal.',
      message: 'Olá! Gostaria de ajuda com Wi-Fi, internet ou roteador.',
    },
    {
      icon: <Camera size={30} />,
      title: 'Câmeras de segurança',
      desc: 'Instalação e configuração com acesso pelo celular.',
      message: 'Olá! Gostaria de atendimento para câmeras de segurança.',
    },
    {
      icon: <Plug size={30} />,
      title: 'Elétrica residencial',
      desc: 'Tomadas, iluminação e pequenos reparos.',
      message: 'Olá! Gostaria de atendimento para elétrica residencial.',
    },
    {
      icon: <ShieldCheck size={30} />,
      title: 'Segurança digital',
      desc: 'Proteção contra golpes, vírus e perda de dados.',
      message: 'Olá! Gostaria de ajuda com segurança digital.',
    },
    {
      icon: <HardDrive size={30} />,
      title: 'Backup e upgrade',
      desc: 'SSD, memória e proteção dos seus arquivos.',
      message: 'Olá! Gostaria de atendimento para backup ou upgrade.',
    },
  ]

  const steps = [
    {
      title: 'Chame no WhatsApp',
      desc: 'Você fala direto com nossa equipe, sem burocracia.',
    },
    {
      title: 'Explique o problema',
      desc: 'Avaliamos o cenário e indicamos o melhor caminho.',
    },
    {
      title: 'Agende o atendimento',
      desc: 'Combinamos o melhor horário para resolver no local.',
    },
  ]

  const testimonials = [
    {
      name: 'Marcos Oliveira — Parque Renato Maia',
      text: 'Atendimento rápido, organizado e com explicação simples. Resolveram o problema sem enrolação.',
    },
    {
      name: 'Renata Almeida — Vila Galvão',
      text: 'Meu Wi-Fi vivia caindo. Depois da visita, o sinal melhorou muito no apartamento todo.',
    },
    {
      name: 'Felipe Guimarães — Centro de Guarulhos',
      text: 'Gostei porque o atendimento foi claro, pontual e passou confiança desde o primeiro contato.',
    },
  ]

  const faqs = [
    {
      question: 'Vocês atendem dentro de condomínios?',
      answer: 'Sim. O atendimento é pensado para moradores de condomínios, apartamentos e residências.',
    },
    {
      question: 'Atendem quais regiões?',
      answer: 'Atendemos Guarulhos e região, conforme disponibilidade de agenda.',
    },
    {
      question: 'O orçamento é feito pelo WhatsApp?',
      answer: 'Sim. Primeiro entendemos o problema e, quando necessário, alinhamos a visita técnica.',
    },
    {
      question: 'Vocês configuram câmeras e acesso pelo celular?',
      answer: 'Sim. Fazemos instalação, configuração e orientação de uso no aplicativo.',
    },
  ]

  const serviceWhatsapp = (message) =>
    `${whatsappBase}?text=${encodeURIComponent(message)}`

  return (
    <main>
      <section className="premiumHero">
        <header className="premiumTopbar">
          <div className="premiumBrand">
            <img src={logo} alt="Logo" />
          </div>

          <nav className="premiumMenu">
            <a href="#">Início</a>
            <a href="#servicos">Serviços</a>
            <a href="#sobre">Sobre</a>
            <a href="#contato">Contato</a>
          </nav>

          {user ? (
            <button className="premiumWhatsapp" onClick={() => setShowPerfilModal(true)}>
              <User size={20} />
              Área do cliente
            </button>
          ) : (
            <LoginButton />
          )}
        </header>

        <div className="premiumHeroContent">
          <div className="premiumHeroText">
            <h1>
              Tecnologia e suporte
              residencial sem
              <span> complicação.</span>
            </h1>

            <p>
              Suporte técnico para informática, Wi-Fi, câmeras, elétrica e segurança digital,
              com atendimento próximo, confiável e fácil de acionar.
            </p>

            <p>Abra seu chamado para maior agilidade.</p>

            {user && (
              <div className="premiumHeroButtons">
                <button className="premiumPrimaryButton" onClick={abrirChamado}>
                  <MessageCircle size={22} />
                  Abrir chamado
                </button>

                <button className="premiumSecondaryButton" onClick={acompanharChamados}>
                  <CheckCircle2 size={22} />
                  Acompanhar chamados
                </button>
              </div>
            )}
          </div>

          <div className="premiumHeroImage">
            <img src={heroImage} alt="Suporte no Condomínio" />
          </div>
        </div>

        <div className="premiumStats">
          <div>
            <Zap size={22} />
            <strong>Atendimento rápido</strong>
            <span>Resposta ágil via WhatsApp</span>
          </div>

          <div>
            <ShieldCheck size={22} />
            <strong>Serviços completos</strong>
            <span>Soluções para o seu dia a dia</span>
          </div>

          <div>
            <CheckCircle2 size={22} />
            <strong>Profissional confiável</strong>
            <span>Qualidade e transparência</span>
          </div>
        </div>
      </section>

      <section className="featureStrip fadeUp delayTwo">
        <div>
          <Sparkles size={22} />
          <strong>Atendimento humanizado</strong>
          <span>Sem termos técnicos complicados.</span>
        </div>

        <div>
          <Wrench size={22} />
          <strong>Serviços práticos</strong>
          <span>Do computador ao Wi-Fi da casa.</span>
        </div>

        <div>
          <MapPin size={22} />
          <strong>Guarulhos e região</strong>
          <span>Agenda pensada para atendimento local.</span>
        </div>
      </section>

      <section className="services" id="servicos">
        <div className="sectionHeader fadeUp">
          <span>Nossos serviços</span>
          <h2>Soluções técnicas especializadas</h2>
          <p>Atendimento residencial com foco em praticidade, rapidez e confiança.</p>
        </div>

        <div className="servicesGrid">
          {services.map((service, index) => (
            <a
              className="serviceCard fadeUp"
              style={{ animationDelay: `${index * 0.08}s` }}
              key={service.title}
              href={serviceWhatsapp(service.message)}
              target="_blank"
              rel="noreferrer"
            >
              <div className="serviceIcon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>

              <div className="serviceFooter">
                <span>Solicitar serviço</span>
                <ChevronRight size={18} />
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="how" id="como-funciona">
        <div className="howText fadeUp">
          <span>Como funciona</span>
          <h2>Atendimento simples, rápido e sem burocracia</h2>
          <p>
            Você chama no WhatsApp, explica o problema e nossa equipe agenda o melhor horário para atendimento técnico.
          </p>
        </div>

        <div className="steps">
          {steps.map((step, index) => (
            <div
              className="step fadeUp"
              style={{ animationDelay: `${index * 0.1}s` }}
              key={step.title}
            >
              <div className="stepNumber">0{index + 1}</div>
              <strong>{step.title}</strong>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="trust" id="sobre">
        <div className="trustImage fadeUp">
          <img
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&auto=format&fit=crop"
            alt="Equipe técnica"
          />
        </div>

        <div className="trustContent fadeUp delayOne">
          <span>Por que escolher a gente?</span>
          <h2>Equipe qualificada e atendimento confiável</h2>
          <p>
            Trabalhamos com foco em qualidade, transparência e experiência do cliente.
            O objetivo é resolver o problema e explicar tudo de forma simples.
          </p>

          <div className="trustItems">
            <div>
              <Star size={22} />
              <strong>Experiência</strong>
              <small>Atendimento técnico prático.</small>
            </div>

            <div>
              <ShieldCheck size={22} />
              <strong>Segurança</strong>
              <small>Cuidado com dados e equipamentos.</small>
            </div>

            <div>
              <Clock3 size={22} />
              <strong>Rapidez</strong>
              <small>Contato direto pelo WhatsApp.</small>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials" id="depoimentos">
        <div className="sectionHeader fadeUp">
          <span>Clientes</span>
          <h2>Quem já utilizou recomenda</h2>
          <p>Depoimentos que reforçam confiança, proximidade e qualidade no atendimento.</p>
        </div>

        <div className="testimonialGrid">
          {testimonials.map((item, index) => (
            <div
              className="testimonialCard fadeUp"
              style={{ animationDelay: `${index * 0.1}s` }}
              key={item.name}
            >
              <Quote size={28} />
              <p>{item.text}</p>
              <strong>{item.name}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="appDownload">
        <div className="fadeUp">
          <span>Aplicativo</span>
          <h2>Baixe o app Suporte no Condomínio</h2>
          <p>Solicite atendimento, acompanhe chamados e fale com nossa equipe direto pelo aplicativo.</p>
        </div>

        <div className="storeButtons fadeUp delayOne">
          <a href="#" className="storeButton" aria-label="Baixar na App Store">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
              alt="Apple"
              className="storeRealIcon appleIcon"
            />
            <div>
              <small>Baixar na</small>
              <strong>App Store</strong>
            </div>
          </a>

          <a href="#" className="storeButton googleButton" aria-label="Baixar no Google Play">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Google Play"
              className="googlePlayBadge"
            />
          </a>
        </div>
      </section>

      <section className="faq" id="duvidas">
        <div className="sectionHeader fadeUp">
          <span>Dúvidas frequentes</span>
          <h2>Antes de chamar o suporte</h2>
          <p>Algumas respostas rápidas para facilitar seu primeiro contato.</p>
        </div>

        <div className="faqGrid">
          {faqs.map((faq, index) => (
            <details
              className="faqItem fadeUp"
              style={{ animationDelay: `${index * 0.08}s` }}
              key={faq.question}
            >
              <summary>
                <HelpCircle size={20} />
                {faq.question}
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="cta" id="contato">
        <div className="fadeUp">
          <span>Precisa de ajuda?</span>
          <h2>Solicite um atendimento agora mesmo</h2>
          <p>Fale com nossa equipe pelo WhatsApp e receba um atendimento rápido.</p>
        </div>

        {user ? (
          <div className="ctaButtons fadeUp delayOne">
            <button className="button buttonLarge" onClick={abrirChamado}>
              <MessageCircle size={22} />
              Abrir chamado
            </button>

            <button className="premiumSecondaryButton" onClick={acompanharChamados}>
              <CheckCircle2 size={22} />
              Acompanhar chamados
            </button>
          </div>
        ) : (
          <div className="fadeUp delayOne">
            <LoginButton />
          </div>
        )}
      </section>

      <footer className="footer">
        <img src={logo} alt="Logo" className="footerLogo" />
        <p>© 2025 Suporte no Condomínio · Atendimento residencial em Guarulhos e região.</p>
      
      <div className="footerLegalLinks">
  <a href="/politica-privacidade">
    Política de Privacidade
  </a>

  <a href="/termos-de-uso">
    Termos de Uso
  </a>


</div>
      </footer>

      <a
        className="whatsappFloat"
        href={whatsapp}
        target="_blank"
        rel="noreferrer"
        aria-label="Chamar no WhatsApp"
      >
        <MessageCircle size={30} />
      </a>

      {showChamado && (
        <div className="modalOverlay">
          <div className="modalContent">
            <button className="closeModal" onClick={() => setShowChamado(false)}>
              ×
            </button>

            <ChamadoForm initialView={chamadoMode} perfilCliente={perfilCliente} />
          </div>
        </div>
      )}

      {showPerfilModal && (
        <div className="modalOverlay">
          <div className="modalContent perfilModalContent">
            <button className="closeModal" onClick={() => setShowPerfilModal(false)}>
              ×
            </button>

            <h2>Complete seu cadastro</h2>

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
                Telefone / WhatsApp
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

              <div className="perfilFormRow">
                <label>
                  Bloco
                  <input
                    type="text"
                    value={perfilForm.bloco}
                    onChange={(e) => setPerfilForm({ ...perfilForm, bloco: e.target.value })}
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
              </div>

              <label>
                Endereço
                <input
                  type="text"
                  value={perfilForm.endereco}
                  onChange={(e) => setPerfilForm({ ...perfilForm, endereco: e.target.value })}
                />
              </label>

              <button type="submit" className="premiumPrimaryButton" disabled={salvandoPerfil}>
                {salvandoPerfil ? 'Salvando...' : 'Salvar cadastro'}
              </button>

<div className="accountLinks">
  <a
    href="/politica-privacidade"
    target="_blank"
    rel="noreferrer"
  >
    Política de Privacidade
  </a>

  <a
    href="/termos-de-uso"
    target="_blank"
    rel="noreferrer"
  >
    Termos de Uso
  </a>

  <a
    href="/excluir-conta"
    target="_blank"
    rel="noreferrer"
    className="dangerLink"
  >
    Excluir minha conta
  </a>
</div>

              <button
                type="button"
                className="perfilLogoutButton"
                onClick={async () => {
                  await supabase.auth.signOut()
                  setUser(null)
                  setPerfilCliente(null)
                  setShowPerfilModal(false)
                  setShowChamado(false)
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

export default WebsiteHome