# toBeHero-backend
ToBeHero is a mentorship platform for kids.

## API Documentation
[here](https://tobehero.docs.apiary.io/)

## Local Setup

1. Install [Node.js](https://nodejs.org/en/download/)

2. Install [MongoDB](mongodb.com/try/download/community)

3. Install [git](https://git-scm.com/downloads)

4. Clone the repository
```
$ git clone https://github.com/Unknown-squad/toBeHero-backend.git
```
5. `cd` to the repository directory
```
$ cd toBeHero-backend
```
6. Install dependencies

```
$ npm install
```
7. Create `.env` file, and add [Environment Variables](#environment-variables) to it using `nano`:
```
$ nano config/config.env
```
8. Run the server
```
$ npm start
```
## Environment Variables

1. `MONGO_URI` = mongodb connection url, example: `mongodb://localhost:27020/tobehero`
2. `SESSION_SECRET` = any string secret, example: `my secret`
3. `SENDMAILER_AUTH_KEY` = authentication key of your nodemailer account
4. `SENDER_MAIL` = the email that you record it on your nodemailer account as sender, example: `info@email.com`
5. `CLIENT_DOMAIN` = ${the domain of client side}, example: `http://localhost:5000`
6. `PORT` = ${port number that server will running on}, example: `3000`
