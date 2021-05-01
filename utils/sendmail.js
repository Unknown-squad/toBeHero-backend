// module requirement
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

module.exports = (email) => {
    // username + password
    const options = {
        auth: {
            api_key:  process.env.SENDMAILER_AUTH_KEY
        }
    };
    console.log(process.env.SENDMAILER_AUTH_KEY)
    const mailer = nodemailer.createTransport(sgTransport(options));
    mailer.sendMail(email, function(err, res) {
        if (err) { 
            console.log(err);
        }
        console.log(res);
    });
};