const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

//model de usuario
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")


//aqui configuramos toda a parte de altenticação
module.exports = function(passport){

    //aqui informamnos qual campo deverá ser analizado
passport.use(new localStrategy({usernameField: 'email', passwordField: "senha"}, (email, senha, done) => {

 Usuario.findOne({email: email}).then((usuario) => {
     if(!usuario){
         return done(null, false, {message: "Esta conta não existe"})
     }

 bcrypt.compare(senha, usuario.senha, (erro, batem) => {
     if(batem){
         return done(null, usuario)
     }else{
         return done(null, false, {message: "Senha incorreta"})
     }
 })


 })


}))
 

//salva o usuario na sessão
passport.serializeUser((usuario, done) => {

    done(null, usuario.id)

})
 
//busca pelo id so usuario
passport.deserializeUser((id,done) => {

    Usuario.findById(id,(err,usuario) => {
        done(err, usuario)
    })
})






}