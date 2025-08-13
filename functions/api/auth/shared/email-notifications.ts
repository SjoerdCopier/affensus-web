async function sendNewUserNotification(userEmail: string, loginMethod: string, resendApiKey: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@email.morsexpress.com',
      to: 's.copier@gmail.com',
      subject: '🎉 New User Registered - MorseXpress',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin-bottom: 10px;">🎉 MorseXpress</h1>
            <h2 style="color: #4b5563; font-weight: normal; margin-top: 0;">New User Registration</h2>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-top: 0;">User Details:</h3>
            <p style="color: #374151; margin: 8px 0;"><strong>Email:</strong> ${userEmail}</p>
            <p style="color: #374151; margin: 8px 0;"><strong>Login Method:</strong> ${loginMethod}</p>
            <p style="color: #374151; margin: 8px 0;"><strong>Registration Time:</strong> ${new Date().toISOString()}</p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">
            A new user has successfully registered for MorseXpress! 🚀
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            This is an automated notification from MorseXpress.
          </p>
        </div>
      `,
      text: `
New User Registration - MorseXpress

User Details:
- Email: ${userEmail}
- Login Method: ${loginMethod}
- Registration Time: ${new Date().toISOString()}

A new user has successfully registered for MorseXpress!

This is an automated notification from MorseXpress.
      `.trim()
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Failed to send new user notification:', errorText)
    // Don't throw error - we don't want to break user registration if email fails
    return false
  }

  const result = await response.json()
  console.log('New user notification sent successfully:', result)
  return true
}

export { sendNewUserNotification } 