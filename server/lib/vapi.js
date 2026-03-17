// Vapi API client for SRINI voice agent
export async function createOutboundCall({ phoneNumber, assistantId, assistantOverrides }) {
  console.log('Creating outbound call to:', phoneNumber)
  console.log('Using Phone Number ID:', process.env.VAPI_PHONE_NUMBER_ID)
  
  const response = await fetch('https://api.vapi.ai/call/phone', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VAPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
      customer: { number: phoneNumber },
      assistantId: assistantId,
      assistantOverrides: assistantOverrides
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Vapi API error response:', error)
    throw new Error(`Vapi API error: ${error}`)
  }

  const data = await response.json()
  console.log('Outbound call created successfully:', data.id)
  return data
}
