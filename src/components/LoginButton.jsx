import { supabase } from '../lib/supabase'

function LoginButton() {

  async function loginGoogle() {

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })

  }

  return (
    <button
      className="googleLoginButton"
      onClick={loginGoogle}
    >
      Entrar com Google
    </button>
  )
}

export default LoginButton