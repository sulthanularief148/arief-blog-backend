import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send subscription confirmation email
const sendSubscriptionEmail = async (email) => {
    const mailOptions = {
        from: `"Sulthanul Arief" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "🎉 Subscription Confirmed!",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 2px 2px 10px rgba(0,0,0,0.1); text-align: center;">
                <h2 style="color: #2C3E50;">✅ Subscription Confirmed!</h2>
                <p style="font-size: 16px; color: #555;">
                    Thank you for subscribing to our blog! You will now receive updates on our latest posts. 🎉
                </p>
                <div style="margin-top: 20px;">
                    <a href="https://arief.pro/blogs" target="_blank"
                        style="background-color: #007BFF; color: #ffffff; padding: 12px 20px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px; display: inline-block;">
                        📰 View Latest Blogs
                    </a>
                </div>
                <p style="font-size: 14px; color: #888; margin-top: 15px;">
                    You can unsubscribe anytime using the link below.
                </p>
                <a href="https://arief.pro/unsubscribe" style="color: #FF3B30; font-size: 14px; text-decoration: none;">🔕 Unsubscribe</a>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Subscription email sent successfully:", info.response);
    } catch (err) {
        console.error("❌ Subscription email error:", err);
    }
};

// Function to send blog notification email
const sendBlogNotification = async (emails, title, description, slug, images) => {
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
                    <a href="https://arief.pro/blogs/slug/${slug}" target="_blank"
                        style="background-color: #007BFF; color: #ffffff; padding: 12px 20px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px; display: inline-block;">
                        📖 Read Full Blog
                    </a>
                </div>
    
                <hr style="margin: 25px 0; border: none; border-top: 1px solid #ddd;">
    
                <p style="font-size: 14px; color: #888; text-align: center;">
                    You are receiving this email because you subscribed to our newsletter.
                </p>
    
                <div style="text-align: center; margin-top: 10px;">
                    <a href="https://arief.pro/unsubscribe" style="color: #FF3B30; font-size: 14px; text-decoration: none;">🔕 Unsubscribe</a>
                </div>
    
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Blog notification email sent successfully:", info.response);

        // Congratulatory email to yourself
        const congratsMailOptions = {
            from: `"Sulthanul Arief" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: "🎉 Congrats on Your New Blog Post!",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 2px 2px 10px rgba(0,0,0,0.1); text-align: center;">
                    <h2 style="color: #2C3E50;">🎊 Congratulations! 🎊</h2>
                    <p style="font-size: 16px; color: #555; line-height: 1.5;">
                        Your new blog post <strong>"${title}"</strong> has been successfully sent to all subscribers! 🎉
                    </p>
                    <p style="font-size: 16px; color: #555;">
                        Keep up the great work, and continue sharing amazing content! 🚀
                    </p>
                    <div style="margin-top: 20px;">
                        <a href="https://arief.pro/blogs/slug/${slug}" target="_blank"
                            style="background-color: #28A745; color: #ffffff; padding: 12px 20px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px; display: inline-block;">
                            🎯 View Blog Post
                        </a>
                    </div>
                </div>
            `
        };

        const congratsInfo = await transporter.sendMail(congratsMailOptions);
        console.log("✅ Congratulatory email sent successfully:", congratsInfo.response);
    } catch (err) {
        console.error("❌ Blog email send error:", err);
    }
};
export { sendSubscriptionEmail, sendBlogNotification };