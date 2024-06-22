const nodemailer = require('nodemailer')
const dotenv = require('dotenv').config()

async function sendEmail(userEmail, verificationCode) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASSWORD,
    }
  });

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: userEmail,
    subject: "Floody e-mail verification",
    html: `<h1>Verificação de e-mail inundado</h1>
           <p>Seu código de verificação é:</p>
           <h2 style="color: blue">${verificationCode}<h2>
           <p>Insira este código na página de verificação para concluir seu processo de registro</p>
           <p>Se você não solicitou isso, ignore este e-mail.</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent");
  } catch (error) {
    console.log("Email sending failed with error: ", error);
  }
}

module.exports = sendEmail;