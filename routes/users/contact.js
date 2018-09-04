const nodeMailer = require("nodemailer");
const config = require('../../secret');



  // =====================================
  // Contact support ========
  // =====================================

  transporter = nodeMailer.createTransport({
    host: config.host,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: config.email, // generated ethereal user
      pass: config.emailPassword // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false
    }
  });


module.exports = {


  contactSupport : function(req, res, next) {
    let mailOptions = {
      from: req.body.sender,
      to: config.email,
      subject: req.body.subject,
      text: req.body.message,
      html: '<b>' + req.body.message + '</b>',
    };
    transporter.sendMail(mailOptions, function(error, info) {
      console.log(error, info);
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: ' + info.response);
    });
    transporter.close();
    return res.redirect('back');
  },

}
