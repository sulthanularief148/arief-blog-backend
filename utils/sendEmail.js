import nodemailer from 'nodemailer'

const sendEmailNotification = async (emails, title, description, slug, images) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,  // Hostinger SMTP Server
        port: process.env.EMAIL_PORT,  // Port 465 for SSL
        secure: true, // Use SSL (true for 465, false for other ports)
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"Sulthanul Arief" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        bcc: emails.join(","), // Sends to all subscribers privately
        subject: `📝 New Blog Post: ${title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 2px 2px 10px rgba(0,0,0,0.1);">
                
                <h2 style="color: #2C3E50; text-align: center;">🆕 ${title}</h2>
    
                <div style="text-align: center;">
                    <img src="${images?.[0] || 'https://via.placeholder.com/600x300'}" alt="Blog Image" style="max-width: 100%; border-radius: 8px; margin-bottom: 15px;">
                </div>
    
                <p style="font-size: 16px; color: #555; line-height: 1.5; text-align: justify;">
                    ${description}
                </p>
    
                <div style="text-align: center; margin-top: 20px;">
                    <a href="https://arief.info/blogs/slug/${slug}" target="_blank"
                        style="background-color: #007BFF; color: #ffffff; padding: 12px 20px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px; display: inline-block;">
                        📖 Read Full Blog
                    </a>
                </div>
    
                <hr style="margin: 25px 0; border: none; border-top: 1px solid #ddd;">
    
                <p style="font-size: 14px; color: #888; text-align: center;">
                    You are receiving this email because you subscribed to our newsletter.
                </p>
    
                <div style="text-align: center; margin-top: 10px;">
                    <a href="https://arief.info/unsubscribe" style="color: #FF3B30; font-size: 14px; text-decoration: none;">🔕 Unsubscribe</a>
                </div>
    
            </div>
        `
    };



    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully:", info.response);
    } catch (err) {
        console.error("❌ Email send error:", err);
    }
};

export default sendEmailNotification