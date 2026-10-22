export const getAutoReplyEmail = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #059669; margin: 0;">NAM Landscaping</h1>
    </div>
    
    <p>Dear ${name},</p>
    <p>Thank you for reaching out to NAM Landscaping. We have successfully received your message.</p>
    <p>One of our landscaping experts will review your inquiry and get back to you within 24 hours to discuss your vision.</p>
    <p>If you need immediate assistance, please don't hesitate to reach out to us via WhatsApp or call us directly at <strong>+971 50 123 4567</strong>.</p>
    
    <p style="margin-top: 30px;">Best Regards,<br><strong>The NAM Landscaping Team</strong></p>
  </div>
`