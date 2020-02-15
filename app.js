//Carregando módulos
  const express = require("express");
  const handlebars = require("express-handlebars");
  const bodyparser = require("body-parser");
  const app = express();
  const admin = require("./router/admin")//para chamar o \rquivo e as rotas
  const path = require("path")
  const mongoose = require("mongoose");
  const session = require("express-session")
  const flash = require("connect-flash")
  require("./models/Postagem")
  const Postagem = mongoose.model("postagens")
  require("./models/Categoria") 
  const Categoria = mongoose.model("categorias")
  const usuarios = require("./router/usuario")
  const passport = require("passport")
  require("./config/auth")(passport)




//Configurações

  //sessão
    app.use(session({
     secret: "mgbs2020123",
     resave: true,
     saveUninitialized: true
    }))

    //configurando o passort para o processo de autenticação de usuario
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

  //midleware
    app.use((req,res,next) => {
      res.locals.success_msg = req.flash("success_msg")//variavel global de msg de sucesso
      res.locals.error_msg = req.flash("error_msg")//variavel global de msg de erro
      res.locals.error = req.flash("error")
      res.locals.user = req.user || null;//armazena os dados do usuario na sessão em uma varieavel global
      next()
    })

  //body parser
    app.use(bodyparser.urlencoded({extended: true}))
    app.use(bodyparser.json())

  //handlebars
   app.engine("handlebars",handlebars({defaultLayout: 'main'}))
   app.set("view engine",'handlebars');

  //mongoose
   mongoose.Promise = global.Promise;
   mongoose.connect("mongodb://localhost/blogAPP").then(() =>{
     console.log("conctado ao mongoDB com sucesso!!")
   }).catch((err) => {
     console.log("Houve um erro: " + err)
   })


   //publlic 
    app.use(express.static(path.join(__dirname,"public")))

    //Rotas
    //rota para a pagina inicial onde são listados as postagens
   app.get("/",(req,res) => {
     Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) =>{
       res.render("index",{postagens: postagens})
     }).catch((err) => {
       req.flash("error_msg","Houve um erro interno")
       res.redirect("/404")
     })
   })

//rota que da acesso quando o usuario clika ela vai para o conteudo todo
   app.get("/postagem/:slug",(req,res) =>{
     Postagem.findOne({slug: req.params.slug}).then((postagem) => {
       if(postagem){
         res.render("postagem/index",{postagem: postagem})
       }else{
         req.flash("error_msg","Esta postagem não existe")
         res.redirect("/")
       }
     }).catch((err) => {
       req.flash("error_msg", "Houve um erro interno")
       res.redirect("/")
     })
   })

//rota que lista as categorias
 app.get("/categorias",(req,res) => {
   Categoria.find().then((categorias) => {
     res.render("categorias/index",{categorias: categorias})
   }).catch((err) => {
     req.flash("error_msg", "Houve um erro ao listar as categorias")
     res.redirect("/")
   })
 })

 ///rota que procura e lista categorias relacionadas ao link clicado pelo usuario
 app.get("/categorias/:slug",(req,res) => {
   Categoria.findOne({slug: req.params.slug}).then((categoria) => {
     if(categoria){

      Postagem.find({categoria: categoria._id}).then((postagens) => {
        res.render("categorias/postagens",{postagens: postagens,categoria: categoria})
      }).catch((err) => {
        req.flash("error_msg","Houve um erro ao listar ps posts")
        res.redirect("/")
      })
     
    }else{
      req.flash("error_msg","Esta categoria não existe")
      res.redirect("/")
    }
   }).catch((err) => {
     req.flash("error_msg","Houve um erro interno ao carregar a pagina da categoria desejada")
     res.redirect("/")
   })
 })


   //rota quando acontece um erro
   app.get("/404",(req,res) => {
     res.send("Erro 404")
   })


   //importam as rotas para este arquivo principal
    app.use("/admin", admin);
    app.use("/usuarios",usuarios);

  //Outros
    const PORT = 8000;
    app.listen(PORT,() => {

      console.log("Servidor iniciado com sucesso");
      console.log("Para derrubar servidor aperte CTRL + C  ");
      console.log("mgbs@discente.ifpe.edu.br");
      console.log("Cristo vem!!!");
      
      //configurando para o heroku
      /*
      const PORT = process.env.PORT || 8000;
      app.listen(PORT,() => {
  
        console.log("Servidor iniciado com sucesso");
        console.log("Para derrubar servidor aperte CTRL + C  ");
        console.log("mgbs@discente.ifpe.edu.br");
        console.log("Cristo vem!!!");*/
});