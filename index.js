const express= require("express");
const path= require("path");
const fs = require("fs");
const sharp = require("sharp");
const sass = require("sass");
const pg = require("pg");

const Client=pg.Client;
//folosim clasa Client din pachetul pg
//datele de logare
client=new Client({
    database:"cocktails",
    user:"utilizator",
    password:"1234",
    host:"localhost",
    port:5432
})

client.connect()
client.query("select * from cocktails", function(err, rezultat ){
    // console.log(err)    
    // console.log(rezultat)
})
client.query("select * from unnest(enum_range(null::categorie_cocktail))", function(err, rezultat ){
    console.log(err)
    console.log(rezultat)
})


app= express();

// console.log("Folderul proiectului: ", __dirname)
// console.log("Calea fisierului index.js: ", __filename)
// console.log("Folderul curent de lucru: ", process.cwd())

app.set("view engine", "ejs");

obGlobal={
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup"),
    optiuniMeniu: null,
    optiuniBazaAlcool: null,
    optiuniServire: null
}

client.query("select * from unnest(enum_range(null::categorie_cocktail))", function(err, rezultat){
    // console.log(err)
    // console.log(rezultat)

    ///daca eroare -> de oprit aplicatia

    // .rows -> vectorul cu inregistrari
    obGlobal.optiuniMeniu = rezultat.rows
})

client.query("select * from unnest(enum_range(null::baza_alcoolica))", function(err, rezultat){
    obGlobal.optiuniBazaAlcool = rezultat.rows
})

client.query("select * from unnest(enum_range(null::stil_servire))", function(err, rezultat){
    obGlobal.optiuniServire = rezultat.rows
})

vect_foldere=["temp", "backup", "temp1"]
//let -> variabile locale, vizibile strict in folder
for(let folder of vect_foldere){
    let caleFolder = path.join(__dirname, folder)
    if (!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder)
    }
}

function compileazaScss(caleScss, caleCss){
    // console.log("cale:",caleCss);
    if(!caleCss){

        let numeFisExt = path.basename(caleScss);
        let numeFis = numeFisExt.split(".")[0]
        caleCss = numeFis + ".css";
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss)
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss)
    

    let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})
    }
    
    let numeFisCss=path.basename(caleCss);
    let numeFisExt = numeFisCss.split(".")[0]; 
    let ext = path.extname(numeFisCss);        
    try{
        if (fs.existsSync(caleCss)){
            let timestamp = (new Date()).getTime();                 
            let numeFisBackup = `${numeFisExt}_${timestamp}${ext}`; ////
            fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css", numeFisCss))  ////
        }
    }catch(err){
        console.err("Eroare la copierea fisierului", err.message);
    }
    rez = sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss, rez.css)
}



vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)===".scss"){
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    // console.log(eveniment, numeFis);
    if (eveniment==="change" || eveniment==="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})



function initErori(){
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    // console.log(continut)
    obGlobal.obErori = JSON.parse(continut)
    console.log(obGlobal.obErori)
    
    obGlobal.obErori.eroare_default.imagine = path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)
    for (let eroare of obGlobal.obErori.info_erori){
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine)
    }
    // console.log(obGlobal.obErori)

}

initErori()


function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini = JSON.parse(continut);
    let vImagini = obGlobal.obImagini.imagini;

    let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
    let caleAbsMediu = path.join(__dirname, obGlobal.obImagini.cale_galerie, "mediu");
    let caleAbsMic = path.join(__dirname, obGlobal.obImagini.cale_galerie, "mic");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    if (!fs.existsSync(caleAbsMic))
        fs.mkdirSync(caleAbsMic);

    for (let imag of vImagini){
        [numeFis, ext] = imag.cale_fisier.split(".");
        let caleFisAbs = path.join(caleAbs, imag.cale_fisier);
        let caleFisMediuAbs = path.join(caleAbsMediu, numeFis+".webp");
        let caleFisMicAbs = path.join(caleAbsMic, numeFis+".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        sharp(caleFisAbs).resize(150).toFile(caleFisMicAbs);
        imag.fisier_mediu = path.join("/", obGlobal.obImagini.cale_galerie, "mediu", numeFis + ".webp" );
        imag.fisier_mic = path.join("/", obGlobal.obImagini.cale_galerie, "mic", numeFis + "webp");
        imag.fisier = path.join("/", obGlobal.obImagini.cale_galerie, imag.cale_fisier );
        
    }
    // console.log(obGlobal.obImagini)
}

initImagini();



function afisareEroare(res, identificator, titlu, text, imagine){
    let eroare = obGlobal.obErori.info_erori.find(function(elem){ 
                        return elem.identificator === identificator
                    });
    if(eroare){
        if(eroare.status)
            res.status(identificator)
        var titluCustom = titlu || eroare.titlu;
        var textCustom = text || eroare.text;
        var imagineCustom = imagine || eroare.imagine;


    }
    else{
        var err = obGlobal.obErori.eroare_default
        var titluCustom = titlu || err.titlu;
        var textCustom = text || err.text;
        var imagineCustom = imagine || err.imagine;


    }
    res.render("pagini/eroare", {
        titlu: titluCustom,
        text: textCustom,
        imagine: imagineCustom
})

}

app.use(/^.*$/, function(req, res, next){
    try {
    res.locals.optiuniMeniu = obGlobal.optiuniMeniu
    res.locals.optiuniBazaAlcool = obGlobal.optiuniBazaAlcool
    res.locals.optiuniServire = obGlobal.optiuniServire
    }catch(err)
    {
        console.log("Eroare la extragerea optiunilor:", err); ///EROARE DIN JSON
        res.locals.optiuniMeniu = []; // fallback gol
        res.locals.optiuniBazaAlcool = [];
        res.locals.optiuniServire = [];
    }
    next(); //ruta urmatoare
}) //trimite la toate rutele

app.use("/resurse", express.static(path.join(__dirname,"resurse")))
app.use("/node_modules", express.static(path.join(__dirname,"node_modules")))


app.get("/favicon.ico", function(req, res){
    res.sendfile(path.join(__dirname, "/resurse/imagini/favicon/favicon.ico"))
})

app.get(["/","/index","/home"], function(req, res){
    res.render("pagini/index", {ip: req.ip, imagini: obGlobal.obImagini.imagini});
})

// app.get("/despre", function(req, res){
//     res.render("pagini/despre");
// })

app.get("/tips-n-tricks", function(req, res){
    res.render("pagini/tips-n-tricks");
})

app.get("/galerie", function(req, res){
    res.render("pagini/galerie", {imagini: obGlobal.obImagini.imagini});
})

app.get("/index/a", function(req, res){
    res.render("pagini/index");
})

app.get("/fisier", function(req, res, next){
    res.sendfile(path.join(__dirname,"package.json"));
})

app.get("/retete", function(req, res){
    // console.log(req.query)
    var conditieQuery=""; 

    if(req.query.categ){
        conditieQuery = ` where categorie='${req.query.categ}'`
    }

    queryOptiuni="select * from unnest(enum_range(null::categorie_cocktail))";
    client.query(queryOptiuni, function(err, rezOptiuni){
        // console.log(rezOptiuni)


        queryRetete="select * from cocktails" + conditieQuery;
        client.query(queryRetete, function(err, rez){
            if (err){
                console.log(err);
                afisareEroare(res, 2);
            }
            else{
                res.render("pagini/retete", {retete: rez.rows, optiuni:rezOptiuni.rows, categ: req.query.categ})
            }
        })
    });
})

app.get("/reteta/:id", function(req, res){
    console.log(req.params);
    client.query(`select * from cocktails where id=${req.params.id} `, function(err, rez){
        if (err){
            // console.log(err);
            afisareEroare(res, 2);
        }
        else{
            if (rez.rowCount==0){
                afisareEroare(res, 404);
            }
            else{
                res.render("pagini/reteta", {ret: rez.rows[0]})
            }
        }
    })
})



app.get(/^\/resurse\/[a-zA-Z0-9_\/]*$/, function(req, res, next){
    afisareEroare(res, 403);
})

app.get(/^.*\.ejs$/, function(req, res, next){
    afisareEroare(res, 400);
})

app.get(/^.*$/, function(req, res, next){
    try{
    res.render("pagini" + req.url, function(err, rezultatRandare){
        if(err){
            console.log(err);
            if(err.message.startsWith("Failed to lookup view")){
                afisareEroare(res, 404);
            }
            else{
                afisareEroare(res);
            }
        }
        else{
            // console.log(rezultatRandare);
            res.send(rezultatRandare);
        }
        })
    }
    catch (errRandare){
        if(errRandare.message.startsWith("Cannot find module ")){
            afisareEroare(res, 404);
        }
        else{
            afisareEroare(res);
        }
    }
})


app.listen(8080);
console.log("Serverul a pornit")
