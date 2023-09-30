const multer = require('multer')
const multerConfig = require('./multer')

const axios =  require('axios')

const config = require('../knexfile')
const knex = require('knex')(config)

const qs = require('qs')

const express = require('express');
const router = express.Router();
const pagamentoController = require('../api/pagamentoController');
const passport = require('passport'); // Importe o Passport.js


const token = process.env.TOKEN_PG
const email = process.env.EMAIL_PG

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const sandbox = process.env.SANDBOX === 'true'; // Converte a string 'true' para um valor booleano true




module.exports = app => {
    app.post('/signup', app.api.users.save)
    app.post('/signin', app.api.auth.signin)
   // app.get('/allrifas', app.api.rifas.getRifa)
    
    // Rota para buscar todas as rifas associadas a um usuário autenticado
    app.get('/allrifas', passport.authenticate('jwt', { session: false }), async (req, res) => {
      try {
          // A partir deste ponto, você pode ter certeza de que o usuário está autenticado
          const userID = req.user.id; // Obtém o ID do usuário autenticado

          // Consulte o banco de dados para buscar as rifas associadas ao usuário
          const rifas = await app.db('rifas').where({ userID });
         // const rifas = await app.db('rifas').where({ userID: req.user.id });

          // Retorna as rifas encontradas como resposta
          return res.status(200).json(rifas);
      } catch (err) {
          // Em caso de erro, retorne um status de erro
          console.error(err);
          return res.status(500).json({ error: 'Erro ao buscar rifas' });
      }
  });


    app.route('/rifas') 
       .all(app.config.passport.authenticate())
       .post(app.api.rifas.saverifa)

   app.route('/images/:id')
      // .all(app.config.passport.authenticate())
      .post( multer(multerConfig).single("file"), async (req,res) => {
         
      const {originalname: name, size, key, location: url = ''} = req.file
      await app.db('images')
      .insert({
         name,
         size,
         key,
         url,
         imagesID: req.params.id
      })
      .then(res.status(200).send('Imagem enviada'))
      .catch(err => res.status(400).send(err))
      return res.status(200).send(console.log("FILE UPLOAD 100%"))
   })

    app.route('/rifas/:id')
       .all(app.config.passport.authenticate())   
       .delete(app.api.rifas.deleterifa)
       .put(app.api.rifas.updateDatasorteio)

    app.route('/rifas/updatedesc/:id')
       .all(app.config.passport.authenticate())
       .put(app.api.rifas.updateDesc)

    app.route('/user/updatepass')
       .all(app.config.passport.authenticate())
       .put(app.api.users.updatePass)

   app.route('/compra/:id')
      .all(app.config.passport.authenticate())
      .post(app.api.rifas.buyCheckOut)


   app.post('/notif', async function (req,res) {
  
      return console.log(JSON.stringify(req.body))
   })

   // Rota para processar o pagamento PIX usando a Gerencianet
   //app.post('/pagamento/pix', pagamentoController.processarPagamentoPIX);


   app.post('/teste/:id', app.api.rifas.buyCheckOut)
   app.get('/tester', async function (req,res) {
    try {                         
      const {response } = await axios.get(`https://sandbox.pagseguro.uol.com.br/v2/checkout/payment.html?code=816797CA2F2F1B5CC489AF9547566F35`)
      return res.status(200).send(response)
    }
     catch(err) {
        return res.status(500).send(err)
     }
   })

}
