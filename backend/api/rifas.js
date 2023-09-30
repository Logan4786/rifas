const config = require('../knexfile')
const knex = require('knex')(config)
const axios = require('axios')
const fs = require('fs');
const path = require('path');

//const aws = require('aws-sdk')
//const s3 = new aws.S3()

const qs = require('qs')

const token = process.env.TOKEN_PG
const email = process.env.EMAIL_PG





// Adicionando dias a mais
// const dateconfig = require('date-fns/add')

// let dayOfPagament = dateconfig(new Date, {
//    days: 7
// })
// const datepayment = JSON.stringify(dayOfPagament).slice(1,11)



module.exports = app => {
    const saverifa = async (req,res) => {
        if(!req.body) {
            return res.status(400).send('error nos inputs')
        }
        //req.body.userId = req.user.id//o passport coloca dentro da req o usuario, e o id e do passaport
        const userId = req.user.id;

        app.db('rifas')
        .insert({
            description: req.body.description, 
            premio: req.body.premio, 
            datasorteio:req.body.datasorteio, 
            valor: req.body.valor,
            maxNumeros: req.body.maxNumeros,
            userID: userId
        })
        .returning(['id'])//retorno de id para adicionar a imagem no front
        .then(data => res.status(200).json(data))
        .catch(err => res.status(400).send(err))
        
    }
    //logica para deletar as imagens
	const deleterifa = async function (req, res) {
	  try {
		const imageInfo = await knex.select('key').from('images').where({ imagesID: req.params.id });

		if (imageInfo.length === 0) {
		  return res.status(404).send('Imagem não encontrada.');
		}

		const key = imageInfo[0].key;

		const tmpFolderPath = path.resolve(__dirname, '..', 'tmp'); // Substitua pelo caminho correto
		const localFilePath = path.join(tmpFolderPath, key); // O arquivo a ser excluído

		fs.unlink(localFilePath, (fsErr) => {
		  if (fsErr) {
			return res.status(500).send('Erro ao excluir arquivo local: ' + fsErr);
		  }

		  knex.from('images').where({ imagesID: req.params.id }).delete()
			.then(() => {
			  knex.from('rifas').where({ id: req.params.id }).delete()
				.then(() => res.status(200).send('Ok deletado'))
				.catch((dbErr) => res.status(500).send('Erro ao excluir entradas do banco de dados: ' + dbErr));
			})
			.catch((dbErr) => res.status(500).send('Erro ao excluir entradas do banco de dados: ' + dbErr));
		});
	  } catch (err) {
		res.status(500).send('Erro: ' + err.message);
	  }
	};

	module.exports = {
	  deleterifa,
	};
   


    const getRifa = (req, res) => {

      const {data } = knex.from('rifas').innerJoin('images', 'rifas.id', 'images.imagesID')
    
        .then(data => res.status(200).json(data))
        .catch(err => res.status(500).send(err))

    }

    const updateDatasorteio = (req, res) => {
        const newDatesorteio = req.body.newDatesorteio
        app.db('rifas')
        .where({id: req.params.id, userID: req.user.id})
        .update({datasorteio: newDatesorteio})
        .then(_ => res.status(200).send('alterado data do sorteio'))
        .catch(err => res.status(500).send(err))
        
    }
    
    const updateDesc = (req, res) => {
        const newDesc = req.body.description
        app.db('rifas')
        .where({id: req.params.id, userID: req.user.id})
        .update({description: newDesc})
        .then(_ => res.status(200).send('Desc alterada'))
        .catch(err => res.status(500).send(err))
    }

     async function buyCheckOut (req, res) {

        const idRifa = req.params.id
        app.db('rifas')
        .where({id: idRifa})
        .then(async data => {

            const { id, description, valor} = data[0]
            let { maxNumeros } = data[0]
            const amount = valor.toFixed(2)

            async function generateNumber () {
                maxNumeros += 1 // adicionando +1 para que sorteio o numero Maximo.
                //pegando todos numeros gerados pelo ID da rifa
                let data = await knex.select('numero_rifa').from('numeros_rifa').where({rifa_id: id})
                //adicionando em um array para conferencia 
                const numeros = percorre => percorre.numero_rifa
                const arrayzinho = data.map(numeros)

                let numberRifa = JSON.stringify(Math.floor(Math.random() * (maxNumeros - 1) + 1))
                console.log(`numero gerado => ${numberRifa}`)


                if (arrayzinho.length === maxNumeros - 1) {
                    console.log('ja foi adicionado o total de numeros para esta rifa')
                } else if (arrayzinho.length === 0) {
                    app.db('numeros_rifa')
                    .insert({
                        numero_rifa: numberRifa,
                        rifa_id: id,
                        user: '1'
                    })
                    .then(console.log('primeiro numero da rifa foi adicionado...'))
                    .catch(err => console.log(err))
                } else {
                   
                    let ajudante = 0 
                    while(ajudante === 0) {
                        let result = arrayzinho.indexOf(numberRifa)
                        console.log(`resultttt ${result}`)
                        if (result === -1) {
                            app.db('numeros_rifa')
                            .insert({
                                numero_rifa: numberRifa,
                                rifa_id: id,
                                user: '1'
                            })
                            .then(console.log(`o numero ${numberRifa} foi adicionado com sucesso..`))
                            .catch(err => console.log(err))
                            ajudante += 1
                
                        }
                        else {
                            numberRifa = JSON.stringify(Math.floor(Math.random() * (maxNumeros - 1) + 1))
                            console.log('else|| caiu no numero com result diferente de -1')
                        }
                    }
                }
                return numberRifa
                             
            }
            const number = await generateNumber() // numero gerado
            const reference = number + '/' + req.user.id

            const params = qs.stringify({
                currency:"BRL",
                itemId1:id,
                itemDescription1:description,
                itemAmount1:amount,
                itemQuantity1:"1",
                itemWeight1:"0",
                reference:reference,
                senderName:req.body.name,
                senderAreaCode:req.body.areacode,
                senderPhone:req.body.phone,
                senderCPF:req.body.cpf,
                senderEmail:req.body.email,
                redirectURL:"http://sitedocliente.com",
                notificationURL:"https://url_de_notificacao.com",
                maxUses:"1",
                maxAge: '3000'
          })

            async function sendData (req,res) {
                try {
                const {data} = await axios.post(`https://ws.sandbox.pagseguro.uol.com.br/v2/checkout?email=${email}&token=${token}`,params)
                const code = data.slice(76, 108)
                console.log(code)
                }
                catch(err) {
                    console.log(err)
                }
                
             }sendData()
            
            
        })
        .catch(err => res.send(err))

        return res.status(200).send(data)
    }   

    return {saverifa, deleterifa, getRifa, updateDatasorteio, updateDesc, buyCheckOut}
}