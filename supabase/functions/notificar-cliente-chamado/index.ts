import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { ticketId, clienteNome, clienteEmail, mensagem } = await req.json()

    if (!clienteEmail) {
      return new Response(JSON.stringify({ error: "Cliente sem e-mail" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const resendApiKey = Deno.env.get("RESEND_API_KEY")

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Suporte no Condomínio <atendimento@suportenocondominio.com.br>",
        to: clienteEmail,
        subject: `Atualização no chamado #${ticketId}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #071b3a;">
            <h2>Seu chamado recebeu uma nova atualização</h2>
            <p>Olá, ${clienteNome || "cliente"}.</p>
            <p>O suporte adicionou uma nova resposta ao seu chamado <strong>#${ticketId}</strong>.</p>
            <div style="background:#f4f7fb;padding:16px;border-radius:12px;margin:20px 0;">
              ${mensagem || "Nova atualização disponível no chamado."}
            </div>
            <p>Acesse o portal ou aplicativo para acompanhar a conversa.</p>
            <p>Atenciosamente,<br/>Suporte no Condomínio</p>
          </div>
        `,
      }),
    })

    const emailData = await emailResponse.json()

    const { data: pushTokens, error: pushTokenError } = await supabase
      .from("push_tokens")
      .select("expo_push_token,email,platform,updated_at")
      .eq("email", clienteEmail)

    const pushResponses = []

    if (pushTokens?.length) {
      for (const item of pushTokens) {
        const pushResponse = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: item.expo_push_token,
            sound: "default",
            title: `Chamado #${ticketId}`,
            body: mensagem || "Você recebeu uma nova atualização.",
            data: { ticketId },
          }),
        })

        const pushData = await pushResponse.json()

        pushResponses.push({
          token: item.expo_push_token,
          status: pushResponse.status,
          data: pushData,
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        clienteEmail,
        emailStatus: emailResponse.status,
        email: emailData,
        pushTokenError,
        pushTokensEncontrados: pushTokens?.length || 0,
        pushTokens,
        pushResponses,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})