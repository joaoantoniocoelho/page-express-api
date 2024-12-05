const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendResetPasswordEmail(to, resetLink) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Page Express | Redefinição de senha',
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <div style="background-color: #2a4365; color: #ffffff; text-align: center; padding: 20px;">
                        <h1 style="margin: 0; font-size: 24px;">Redefinição de Senha</h1>
                    </div>
                <div style="padding: 20px; color: #2d3748; line-height: 1.6;">
                    <p>Olá,</p>
                    <p>Recebemos uma solicitação para redefinir a senha de sua conta no <strong>Page Express</strong>.</p>
                    <p>Para redefinir sua senha, clique no botão abaixo:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${resetLink}" style="background-color: #2a4365; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 4px; font-size: 16px;">Redefinir Senha</a>
                    </div>
                    <p>Ou copie e cole o link abaixo no seu navegador:</p>
                    <p style="word-break: break-word; color: #2a4365;">${resetLink}</p>
                    <p style="margin-top: 20px;">Se você não solicitou esta alteração, pode ignorar este e-mail. Sua senha permanecerá inalterada.</p>
                    <p>Atenciosamente,</p>
                    <p><strong>Equipe Page Express</strong></p>
                </div>
                <div style="background-color: #e2e8f0; text-align: center; padding: 10px; font-size: 12px; color: #718096;">
                    <p>Este é um e-mail automático. Por favor, não responda.</p>
                </div>
                </div>
            </div>
        `
    };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Email sent');
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Error sending email');            
        }
};

function anonymizeEmail(email) {
    const [localPart, domain] = email.split('@');
    const anonymizedLocal = localPart.slice(0, 2) + '***';
    return `${anonymizedLocal}@${domain}`;
}


module.exports = { sendResetPasswordEmail, anonymizeEmail };