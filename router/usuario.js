const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Usuario")
const Usuario =  mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")



//rotas

//rota que da acesso ao form de cadastro de usuarios
router.get("/registro", (req,res) => {
    res.render("usuarios/registro")
})

//rota que recebe os dados do form de cadastro e verifica os dados
//para projeter a senha instale o modulo npm install --save bcryptjs
router.post("/registro", (req,res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome invalido"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "Email invalido"})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha invalida"})
    }

    if(req.body.senha.length < 6){
        erros.push({texto: "Senha muito curta"})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "Senhas são diferentes, tente novamente!"})
    }

    if(erros.length > 0){
        
        res.render("usuarios/registro", {erros: erros})
    
    }else{

       Usuario.findOne({email: req.body.email}).then((usuario) => {

        if(usuario){
            req.flash("error_msg","Já existem uma conta vinculada a esse endereço de email, inicie o cadastro com uma conta diferente")
            res.redirect("/usuarios/registro")
        
        }else{

         const novoUsuario = new Usuario({
             nome: req.body.nome,
             email: req.body.email,
             senha: req.body.senha//,
             //eAdmin: 1
         })

         bcrypt.genSalt(10,(erro, salt) => {
             bcrypt.hash(novoUsuario.senha,salt,(erro,hash) => {
                  if(erro){
                      req.flash("error_msg","Houve um erro durante o salvamento do usuario")
                      res.redirect("/")
                  
                    }

                    novoUsuario.senha = hash

                    novoUsuario.save().then(() => {
                        req.flash("success_msg","Usuario cadastrado com sucesso!")
                        res.redirect("/")
                    }).catch((err) =>{
                        req.flash("error_msg","Houve um erro ao cadastrar usuario, por favor tente novamente!")
                        res.redirect("/usuarios/registro")
                    })

             })
         }) 

        }
       }).catch((err) => {
           req.flash("error_msg","Houve um erro interno")
           res.redirect("/")
       })

    }

})

//rota que da acesso ao form de login
router.get("/login",(req,res) => {
    
    res.render("usuarios/login")

})

//rota que recebe os dados do form de login
router.post("/login",(req,res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureflash: true

    })(req,res,next)
})

//rota que destroi a sessão
router.get("/logout",(req,res) => {
    req.logout()
    req.flash("success_msg","Deslogado com sucesso")
    res.redirect("/")
})


 
module.exports = router



























