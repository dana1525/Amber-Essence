window.onload = function(){
    btn = document.getElementById("filtrare");

    btn.onclick = function(){

        let inpNume = document.getElementById("inp-nume").value.trim().toLowerCase();
        
        // let inpConcentratie = null;
        // let minConcentratie = null;
        // let maxConcentratie = null;
        // let vectRadio = document.getElementsByName("gr_rad");
        // for(let rad of vectRadio){
        //     if(rad.checked){
        //         inpConcentratie = rad.value;
        //         if(inpConcentratie != "toate"){
        //             [minConcentratie, maxConcentratie] = inpConcentratie.split(":")
        //             minConcentratie = parseInt(minConcentratie);
        //             maxConcentratie = parseInt(maxConcentratie);
        //         }
        //         break;
        //     }
        // }

        let inpAlcoolic = document.querySelector('input[name="gr_rad"]:checked').value;

        let inpTimp = document.getElementById("inp-timp_prep_min").value;

        let inpCategorie = document.getElementById("inp-categorie").value.trim().toLowerCase();
        
        let inpTextarea = document.getElementById("inp-filtru-textarea").value.toLowerCase().trim();
        let termeni_cautare = inpTextarea.split(/[\s,\n]+/).filter(termen => termen.length > 0); //orice combinatie de spatii, virgule sau linii noi
                                                                                                 //+ se elimina termenii goli care ar putea aparea din splitare        
        
        let inpBaza = document.getElementById("inp-baza").value.trim().toLowerCase();

        let inpServire = document.getElementById("inp-servire");
        let arrServire = Array.from(document.querySelectorAll("#inp-servire option:checked")).map(opt => opt.value.trim().toLowerCase());
        console.log(arrServire)
        let inpVegan = document.getElementById('chk-vegan').checked;

        let retete = document.getElementsByClassName("reteta");
        for(let ret of retete){
            ret.style.display = "none";

            let nume = ret.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase(); //numele fiecarei retete (un vector cu un sg element)
            let cond1 = inpNume == "" || nume.includes(inpNume)

            // let concentratie = parseInt(ret.getElementsByClassName("val-tarie_alcoolica")[0].innerHTML.trim());
            // let cond = (inpConcentratie == "toate" || (minConcentratie <= concentratie && concentratie < maxConcentratie))

            let areAlcool = ret.querySelector(".val-contine_alcool").textContent.trim().toLowerCase();
            let cond2 = (inpAlcoolic == "toate") || (inpAlcoolic == areAlcool);

            let timp_prep_min = parseFloat(ret.getElementsByClassName("val-timp_prep_min")[0].innerHTML.trim()); //din string in float
            let cond3 = (inpTimp <= timp_prep_min)

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

            if(cond1 && cond2 && cond3 && cond4 && cond5 && cond6  && cond7 && cond8){
                ret.style.display = "block";
            }
        }

    }

    document.getElementById("inp-timp_prep_min").onmousemove = function(){
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
    }

    document.getElementById("resetare").onclick = function(){
        if(!confirm("Sigur vrei sa resetezi toate filtrele?")) return;

        document.getElementById("inp-nume").value = ""
        document.getElementById("i_rad3").checked = true;
        document.getElementById("inp-timp_prep_min").value = 0;
        document.getElementById("infoRange").innerHTML = "0";
        document.getElementById("inp-categorie").value = "toate";
        document.getElementById("inp-filtru-textarea").value = "";
        document.getElementById("inp-baza").value = "toate";   ////???? "toate"
        document.getElementById("chk-vegan").checked = false;
        Array.from(document.querySelectorAll("#inp-servire option:checked")).forEach(opt => opt.selected = false);

        let produse = document.getElementsByClassName("reteta");
        for(let prod of produse){
            prod.style.display = "block";
        }   
    }

    document.getElementById("sortCrescTimpNume").onclick = function(){
        sorteaza(1);
    }

    document.getElementById("sortDescrescTimpNume").onclick=function(){
        sorteaza(-1);
    }

    function sorteaza(semn){
        let retete = document.getElementsByClassName("reteta");
        let vRetete = Array.from(retete);
        vRetete.sort(function(a,b){
            let timpA = parseFloat(a.getElementsByClassName("val-timp_prep_min")[0].innerHTML.trim());
            let timpB = parseFloat(b.getElementsByClassName("val-timp_prep_min")[0].innerHTML.trim());
            if(timpA != timpB){
                return semn*(timpA-timpB);
            }

            let numeA = a.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase();
            let numeB = b.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase();
            return semn*(numeA.localeCompare(numeB));
        })
        
        for(let ret of vRetete){
            ret.parentNode.appendChild(ret);
        }
    }
 }