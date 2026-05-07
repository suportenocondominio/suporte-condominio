import { useState } from 'react'
import { supabase } from '../lib/supabase'

function ChamadoForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    condominio: '',
    apartamento: '',
    servico: '',
    urgencia: 'Normal',
    descricao: '',
  })

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const { error } = await supabase.from('chamados').insert([form])

    setLoading(false)

    if (error) {
      alert('Erro ao abrir chamado. Tente novamente.')
      console.error(error)
      return
    }

    setSuccess(true)

    setForm({
      nome: '',
      telefone: '',
      condominio: '',
      apartamento: '',
      servico: '',
      urgencia: 'Normal',
      descricao: '',
    })
  }

  return (
    <section className="chamadoBox" id="abrir-chamado">
      <div className="sectionHeader">
        <span>Novo chamado</span>
        <h2>Abrir atendimento</h2>
        <p>Preencha os dados abaixo para registrar sua solicitação.</p>
      </div>

      <form className="chamadoForm" onSubmit={handleSubmit}>
        <input name="nome" placeholder="Seu nome" value={form.nome} onChange={handleChange} required />

        <input name="telefone" placeholder="WhatsApp / telefone" value={form.telefone} onChange={handleChange} />

        <input name="condominio" placeholder="Condomínio" value={form.condominio} onChange={handleChange} />

        <input name="apartamento" placeholder="Apartamento / bloco" value={form.apartamento} onChange={handleChange} />

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
    </section>
  )
}

export default ChamadoForm