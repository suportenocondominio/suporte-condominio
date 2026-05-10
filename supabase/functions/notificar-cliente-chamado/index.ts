import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const {
      ticketId,
      clienteNome,
      clienteEmail,
      mensagem,
    } = await req.json()

    if (!clienteEmail) {
      return new Response(
        JSON.stringify({ error: "Cliente sem e-mail" }),
        { status: 400 }
      )
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY")

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Suporte no Condomínio <onboarding@resend.dev>",
        to: clienteEmail,
        subject: `Atualização no chamado #${ticketId}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #071b3a;">
            <h2>Seu chamado recebeu uma nova atualização</h2>

            <p>Olá, ${clienteNome || "cliente"}.</p>

            <p>O suporte adicionou uma nova resposta ao seu chamado <strong>#${ticketId}</strong>.</p>

            <div style="
              background: #f4f7fb;
              padding: 16px;
              border-radius: 12px;
              margin: 20px 0;
            ">
              ${mensagem || "Nova atualização disponível no chamado."}
            </div>

            <p>
              Acesse o portal para acompanhar a conversa.
            </p>

            <p>
              Atenciosamente,<br/>
              Suporte no Condomínio
            </p>
          </div>
        `,
      }),
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: String(error),
      }),
      {
        status: 500,
      }
    )
  }
})