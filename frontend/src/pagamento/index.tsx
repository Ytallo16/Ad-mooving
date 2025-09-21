import { loadStripe } from '@stripe/stripe-js'
import React from 'react'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!)

const IndexPage = () => {
  const handleCheckout = async () => {
    const res = await fetch('http://localhost:8000/pagamento/criar-sessao/', {
      method: 'POST',
    })

    const data = await res.json()

    const stripe = await stripePromise

    if (data.id) {
      const result = await stripe?.redirectToCheckout({
        sessionId: data.id,
        successUrl: `${window.location.origin}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/pagamento/cancelado`,
      })

      if (result?.error) {
        alert(result.error.message)
      }
    } else {
      alert('Erro ao iniciar sessão de pagamento.')
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Inscrição para Corrida</h1>
      <p>R$ 75,00</p>
      <button onClick={handleCheckout} style={{ padding: '10px 20px', fontSize: 18 }}>
        Pagar com Stripe
      </button>
    </div>
  )
}

export default IndexPage
