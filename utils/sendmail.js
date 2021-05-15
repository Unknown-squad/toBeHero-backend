// module requirement
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

module.exports = (mail) => {
    // username + password
    const options = {
        auth: {
            api_key:  process.env.SENDMAILER_AUTH_KEY
        }
    };

    const mailer = nodemailer.createTransport(sgTransport(options));
    mailer.sendMail(mail, function(err, res) {
        if (err) { 
            console.log(err);
        }
        console.log(res);
    });
};