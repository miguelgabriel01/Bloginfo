//Carregar modulos
const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helprs/eAdmin")



//configurando rotas


//rota que da acesso a pagina inicial
router.get('/',eAdmin,(req,res) => {
    res.render("admin/index")
})



//rota que da acesso a pagina de post do usuario
router.get("/post",eAdmin,(req,res) =>{
   res.send("pagina de post")
})

//rota que da acesso a pagina onde são listado as categorias
router.get("/categorias",eAdmin,(req,res) =>{
   
    Categoria.find().sort({date: "desc"}).then((categorias) => {
        res.render("admin/categorias",{categorias: categorias})
   }).catch((err) => {
        req.flash("error_msg","Houver um erro ao listar as categorias")
        res.redirect("/admin")
   });

});

//rota que da cesso ao formulario de cadastro de categorias
router.get("/categorias/add",eAdmin,(req,res) => {
    res.render("admin/addcategorias")
});

//rota que recebe os dados do formulario e armazena no BD
router.post("/categorias/nova",eAdmin,(req,res) => {
    
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome invalido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug invalido"})
    }
 
    if(req.body.nome.length < 2){
       erros.push({texto: "Nome da categoria muito pequeno"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria salva com sucesso!!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg","Houve um erro ao cadastrar categoria, tente novamente!")
            res.redirect("/admin")
        })
    }  
})

//rota que da acesso ao formulario de ediçãode categoria
router.get("/categorias/edit/:id",eAdmin,(req,res) =>{
  
    Categoria.findOne({_id:req.params.id}).then((categoria) => {
    res.render("admin/editcategorias", {categoria: categoria})

  }).catch((err) => {
      req.flash("error_msg", "Esta categoria não existe")
      res.redirect("/admin/categorias")
    })
  
});

//rota que recebe os dados do formulario de edição de categorias 
router.post("/categorias/edit",eAdmin,(req,res) => {
  
        Categoria.findOne({_id: req.body.id}).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash("success_msg","Categoria salva com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno na edição da postagem")
            req.redirect("/admin/categorias")
        })
    }).catch((err) => {
        req.flash("error_msg","Houve um erro ao editar categoria")
        res.redirect("/admin/categorias")
    })
})

//rota que recebe o id da categoria e deleta a mesma
 router.post("/categorias/deletar",eAdmin, (req,res) => {
     Categoria.remove({_id: req.body.id}).then(() => {
         req.flash("success_msg","Categoria deletada com sucesso")
         res.redirect("/admin/categorias")
     }).catch((err) => {
         req.flash("error_msg","Houve um erro ao deletar categoria")
         res.redirect("/admin/categorias")
     })
 }) 


//rotas relacionadas as ostagens do usuario


 //rota que vai listar as postagens do usuarios
 //O POPULATE serve para lista as categorias que o usuario já cadastrou
//populate("nome do campo")
 router.get("/postagens",eAdmin,(req,res) => {
  
    Postagem.find().populate("categoria").sort({date: "desc"}).then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })

 })

 //rota que vai levar ate o form de cadastro
 router.get("/postagens/add",eAdmin,(req,res) => {
  Categoria.find().then((categorias) => {
    res.render("admin/addpostagem",{categorias: categorias})

  }).catch((err) => {
      req.flash("error_msg","Houve um erro ao carregar formulario")
      res.redirect("/admin")
  })

})

//rota que vai fazer a validação dos dados recebidos e vai salvar no BD
router.post("/postagens/nova",eAdmin,(req,res) => {
    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria ivalida, registre uma categoria"})
    }

    if(erros.length > 0){
        res.render("admin/addpostagens", {erros: erros})
    }else{
        const novapostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novapostagem).save().then(() => {
            req.flash("success_msg","Postagem criada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg","Houve um erro ao cadastrar postagem. POR FAVOR tente novamente")
            res.redirect("/admin/postagens")
        })
    }
})


//rota que levara ao form de edição de postagens
router.get("/postagens/edit/:id",eAdmin,(req,res) => {
   
    Postagem.findOne({_id: req.params.id}).then((postagem) => {

      Categoria.find().then((categorias) => {
        res.render("admin/editpostagens", {categorias: categorias, postagem:postagem})

      }).catch((err) => {
          req.flash("error_msg","Houve um erro ao carregar categorias")
          res.redirect("/admin/postagens")
      })


    }).catch((err) => {
        req.flash("error_msg","Houve um erro ao carregar o form de edição")
        res.redirect("/admin/postagens")
    })
   
   
})

//rota que recebe os dados do form de edição e guarda no bd
 router.post("/postagem/edit",eAdmin,(req,res) => {

    Postagem.findOne({_id: req.body.id}).then((postagem) => {
      
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

          postagem.save().then(() => {
              req.flash("success_msg","Postagem editada com sucesso")
            res.redirect("/admin/postagens")
          }).catch((err) => {
              req.flash("error_msg", "Erro interno")
              res.redirect("/admin/postagens")
          })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar edição")
        res.redirect("/admin/postagens")
    })

 })


//rota que apaga de uma outra forma os post. mas n é tão segura
router.get("/postagens/deletar/:id",eAdmin, (req,res) => {
    Postagem.remove({_id: req.params.id}).then(() => {
        req.flash("success_msg","Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((err) => { 
        req.flash("error_msg","Houve um erro ao deletar postagem")
        res.redirect("/admin/postagens")
    })
})








module.exports = router