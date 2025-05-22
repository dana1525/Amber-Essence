let retete;
let reteteInitiale;

window.onload = function(){
    // Colectare elemente cu clasa reteta
    retete = document.getElementsByClassName("reteta");
    reteteInitiale = Array.from(retete);

    // Buton de filtrare
    btn = document.getElementById("filtrare");

    btn.onclick = function(){

        // Preluare valori din inputuri
        let inpNume = document.getElementById("inp-nume").value.trim().toLowerCase();
        let inpAlcoolic = document.querySelector('input[name="gr_rad"]:checked').value;
        let inpTimp = document.getElementById("inp-timp_prep").value;
        let inpCategorie = document.getElementById("inp-categorie").value.trim().toLowerCase();
        let inpTextarea = document.getElementById("inp-filtru-textarea").value.toLowerCase().trim();
        let termeni_cautare = inpTextarea.split(/[\s,\n]+/).filter(termen => termen.length > 0); //orice combinatie de spatii, virgule sau linii noi
        let inpBaza = document.getElementById("inp-baza").value.trim().toLowerCase();
        let arrServire = Array.from(document.querySelectorAll("#inp-servire option:checked")).map(opt => opt.value.trim().toLowerCase());
        let inpVegan = document.getElementById('chk-vegan').checked;

        // Aplicare filtre
        for(let ret of retete){
            ret.style.display = "none";

            let nume = ret.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase(); //numele fiecarei retete (un vector cu un sg element)
            let cond1 = inpNume == "" || nume.includes(inpNume)

            let areAlcool = ret.querySelector(".val-contine_alcool").textContent.trim().toLowerCase();
            let cond2 = (inpAlcoolic == "toate") || (inpAlcoolic == areAlcool);

            let timp_prep = parseFloat(ret.getElementsByClassName("val-timp_prep")[0].innerHTML.trim()); //din string in float
            let cond3 = (timp_prep <= inpTimp || inpTimp == 0)

            let categorie = ret.getElementsByClassName("val-categorie")[0].innerHTML.trim().toLowerCase();
            let cond4 = (inpCategorie == "toate" || inpCategorie == categorie)

            let cond5 = true;
            if(termeni_cautare.length > 0){
                let nume = ret.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase();
                let categorie = ret.getElementsByClassName("val-categorie")[0].innerHTML.trim().toLowerCase();

                //dataset - proprietate care dă acces la toate atributele data-* ale elementului
                let ingrediente = ret.dataset.ingrediente ? ret.dataset.ingrediente.toLowerCase() : "";
                let baza = ret.dataset.baza ? ret.dataset.baza.toLowerCase() : "";
                let stil = ret.dataset.stil ? ret.dataset.stil.toLowerCase() : "";
                let descriere = ret.dataset.descriere ? ret.dataset.descriere.toLowerCase() : "";
                
                let continut_complet = `${nume} ${categorie} ${ingrediente} ${baza} ${stil} ${descriere}`;
                
                cond5 = termeni_cautare.every(termen => continut_complet.includes(termen)); //verificare ca sunt inclusi toti termenii
            }

            let baza = ret.getElementsByClassName("val-baza")[0].innerHTML.trim().toLowerCase();
            let cond6 = (inpBaza == "toate" || inpBaza == baza)

            let cond7 = true;
            if(arrServire.length > 0){
                let stil = ret.getElementsByClassName("val-stil")[0].innerHTML.trim().toLowerCase();
                cond7 = arrServire.some(s => s == stil);
            }

            let isVegan = ret.getElementsByClassName("val-vegan")[0].textContent.trim().toLowerCase() === 'true';
            let cond8 = !inpVegan || (inpVegan && isVegan);

            // Afisare reteta daca toate conditiile sunt indeplinite
            if(cond1 && cond2 && cond3 && cond4 && cond5 && cond6  && cond7 && cond8){
                ret.style.display = "block";
            }
        }

    }

    // Actualizare in timp real a valorii slider-ului pentru timp
    document.getElementById("inp-timp_prep").onmousemove = function(){
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
    }

    // Buton de resetare + confirmare
    document.getElementById("resetare").onclick = function(){
        if(!confirm("Sigur vrei sa resetezi toate filtrele?")) return;

        document.getElementById("inp-nume").value = ""
        document.getElementById("i_rad3").checked = true;
        document.getElementById("inp-timp_prep").value = 0;
        document.getElementById("infoRange").innerHTML = "0";
        document.getElementById("inp-categorie").value = "toate";
        document.getElementById("inp-filtru-textarea").value = "";
        document.getElementById("inp-baza").value = "toate";   ////???? "toate"
        document.getElementById("chk-vegan").checked = false;
        Array.from(document.querySelectorAll("#inp-servire option:checked")).forEach(opt => opt.selected = false);

        // Resetare ordine initiala retete + afisare toate
        let container = reteteInitiale[0].parentNode;
        for(let ret of reteteInitiale){
            container.appendChild(ret);
            ret.style.display = "block";
        }
    }

    // Butoane de sortare: crescator / descrescator
    document.getElementById("sortCresc").onclick = function(){
        sorteaza(1);
    }

    document.getElementById("sortDescresc").onclick=function(){
        sorteaza(-1);
    }

    // Functie pentru calcularea raportului de alcool (tarie / volum * 100)
    function calcAlcoolTotal(elem){
        let tarie = parseFloat(elem.dataset.tarie);
        let volum = parseFloat(elem.dataset.volum);
        return (tarie / volum) * 100.0;
    }

    // Functie de sortare: intai dupa raportul de alcool, apoi dupa categorie
    function sorteaza(semn){
        let retete = document.getElementsByClassName("reteta");
        let vRetete = Array.from(retete);
        vRetete.sort(function(a,b){
            let alcoolA = calcAlcoolTotal(a);
            let alcoolB = calcAlcoolTotal(b);
            // console.log(a, b);
            if(alcoolA != alcoolB){
                return semn*(alcoolA-alcoolB);
            }

            let categA = a.getElementsByClassName("val-categorie")[0].innerHTML.trim().toLowerCase();
            let categB = b.getElementsByClassName("val-categorie")[0].innerHTML.trim().toLowerCase();
            return semn*(categA.localeCompare(categB));
        })
        
        for(let ret of vRetete){
            ret.parentNode.appendChild(ret); // repozitionare DOM
        }
    }

    // Afisare timp minim la combinatia ALT + C (pentru retetele vizibile)
    window.onkeydown=function(e){
        // console.log(e)
        if (e.key=="c" && e.altKey){
            let retete= document.getElementsByClassName("reteta")
            timpMinim = 10000
            for (let ret of retete){
                if(ret.style.display!="none"){
                    let timp = parseFloat(ret.getElementsByClassName("val-timp_prep")[0].innerHTML.trim())
                    if(timpMinim > timp) timpMinim = timp;
                }
            }
            if(!document.getElementById("timp-minim")){
                let pRezultat = document.createElement("p") //<p></p>
                pRezultat.innerHTML = timpMinim + " minute"
                pRezultat.id ="timp-minim"
                let p = document.getElementById("r-minim")
                p.parentNode.insertBefore(pRezultat, p.nextElementSibling)
                setTimeout(function(){
                    let p1 = document.getElementById("timp-minim")
                    if(p1){
                        p1.remove()
                    }
                }, 2000)
            }
        }
    }
 }