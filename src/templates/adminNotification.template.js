export const getAdminNotificationEmail = (contact) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
    <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px;">New Website Inquiry</h2>
    <p>You have received a new contact form submission from the NAM Landscaping website.</p>
    
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <tr>
        <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; width: 120px;">Name</td>
        <td style="padding: 10px; border: 1px solid #eee;">${contact.name}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Email</td>
        <td style="padding: 10px; border: 1px solid #eee;"><a href="mailto:${contact.email}">${contact.email}</a></td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Phone</td>
        <td style="padding: 10px; border: 1px solid #eee;"><a href="tel:${contact.phone}">${contact.phone}</a></td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Service</td>
        <td style="padding: 10px; border: 1px solid #eee;">${contact.serviceOfInterest || 'Not specified'}</td>
      </tr>
    </table>

    <h3 style="margin-top: 20px; color: #333;">Message:</h3>
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; font-style: italic;">
      ${contact.message.replace(/\n/g, '<br>')}
    </div>

    <div style="margin-top: 30px; text-align: center;">
      <a href="${process.env.ADMIN_PANEL_URL}/contacts" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View in Admin Panel</a>
    </div>
  </div>
`