function valideazaInputuri() {
    let valid = true;
    let mesaj = "";

    // Input text: nume - daca e completat, sa nu aiba cifre
    let inpNume = document.getElementById("inp-nume");
    if (inpNume.value.trim() !== "" && /\d/.test(inpNume.value)) { // problema daca textul contine cifre
        valid = false;
        mesaj += "Numele nu trebuie să conțină cifre.\n";
    }

    // Textarea - poate fi gol campul, dar dacă nu e, sa aiba cuvinte reale
    let inpTextarea = document.getElementById("inp-filtru-textarea");
    if (inpTextarea.value.trim() !== "" && !/[a-zA-Z]/.test(inpTextarea.value)) { // problema daca textul nu contine nicio litera
        valid = false;
        mesaj += "Câmpul de căutare trebuie să conțină text valid.\n";
    }

    // Validare baza alcoolica - daca e completat, permite numai litere (inclusiv diacritice) si spatii
    let inpBaza = document.getElementById("inp-baza");
    let bazaVal = inpBaza.value.trim().toLowerCase();
    if (bazaVal !== "" && !/^[a-zA-ZăîâșțĂÎÂȘȚ\s]+$/.test(bazaVal)) {
        valid = false;
        mesaj += `Câmpul "Baza alcoolică" trebuie să conțină doar litere și spații.\n`;
        inpBaza.classList.add("invalid");
    } else {
    inpBaza.classList.remove("invalid");
    }

    if (!valid) {
        alert(mesaj.trim());
    }

    return valid;
}

function eliminaDiacritice(text) {
    // Normalization Form Decomposition (altfel caracterele sunt descompuse in caracter de baza + diacritic special)
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();  // interval de coduri Unicode pentru semne diacritice combinatorii
}

// Generare dinamica checkbox
function genereazaAtributeInputuri(){
    //actualizare pentru checkbox vegan
    let labelVegan = document.querySelector('label[for="chk-vegan"]');
    if(labelVegan){
        let nrVegane = Array.from(retete).filter(ret =>
            ret.querySelector(".val-vegan")?.textContent.trim() === 'true'
        ).length;
        labelVegan.textContent = `Doar vegane (${nrVegane} rețete)`;
    }
}

// Cel mai mic timp pentru o categorie
function celMaiMicTimpCategorie(retete, categorie){
    const reteteCategorie = retete.filter(
        ret => ret.querySelector(".val-categorie").textContent.trim().toLowerCase() === categorie
    );
    if(reteteCategorie.length === 0) return null;
    return reteteCategorie.reduce((min, ret) => {
        const timpCurent = parseFloat(ret.querySelector(".val-timp_prep").textContent.trim());
        const timpMin = parseFloat(min.querySelector(".val-timp_prep").textContent.trim());
        return timpCurent < timpMin ? ret : min;
    })
}

let retete;
let reteteInitiale;

let reteteFixate = new Set(
    JSON.parse(localStorage.getItem("reteteFixate") || "[]")
);
let reteteAscunseTemporar = new Set();
let reteteStersePermanent = new Set(
    JSON.parse(sessionStorage.getItem("reteteStersePermanent") || "[]")
);

let paginaCurenta = 1;
let retetePePagina = 6;

window.onload = function(){
    document.querySelectorAll(".btn-fixeaza").forEach(btn => {
        btn.addEventListener("click", function(){
            let reteta = btn.closest(".reteta");
            let id = reteta.querySelector("a").getAttribute("href").split("/").pop();

            if(reteteFixate.has(id)){
                reteteFixate.delete(id);
                btn.classList.remove("active");
                reteta.classList.remove("fixa");
            } else {
                reteteFixate.add(id);
                btn.classList.add("active");
                reteta.classList.add("fixa");
            }
            localStorage.setItem("reteteFixate", JSON.stringify(Array.from(reteteFixate)));
            afiseazaPagina(paginaCurenta);
        })
    });

    // Ascundere temporara reteta
    let btnAscundeTemporar = document.querySelectorAll(".btn-ascunde-temporar");
    btnAscundeTemporar.forEach(btn => {
        btn.addEventListener("click", function(){
            let reteta = btn.closest(".reteta");
            let id = reteta.querySelector("a").getAttribute("href").split("/").pop();
            reteteAscunseTemporar.add(id);
            afiseazaPagina(paginaCurenta);
        })
    });

    // Stergere permanenta din sesiune
    document.querySelectorAll(".btn-sterge-permanent").forEach(btn => {
        btn.addEventListener("click", function() {
            let reteta = btn.closest(".reteta");
            let id = reteta.querySelector("a").getAttribute("href").split("/").pop();

            // Adaugare in set si in sessionStorage
            reteteStersePermanent.add(id);
            sessionStorage.setItem("reteteStersePermanent", JSON.stringify([...reteteStersePermanent]));

            reteta.style.display = "none";
        });
    });


    // Colectare elemente cu clasa reteta
    retete = document.getElementsByClassName("reteta");
    reteteInitiale = Array.from(retete);

    genereazaAtributeInputuri();

    // Buton de filtrare
    let reteteFiltrate = [];

    function filtreazaRetete(){
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

        if(!valideazaInputuri()) return[];

        let rezultate = [];

        // Aplicare filtre
        for(let ret of retete){
            let id = ret.querySelector("a").getAttribute("href").split("/").pop();
            if(reteteFixate.has(id)){
                // ret.style.display = "block";
                ret.classList.add("fixa");
                continue;
            }
            if (reteteAscunseTemporar.has(id)) {
                continue;
            }
            if (reteteStersePermanent.has(id)) {
                ret.style.display = "none";
                continue;
            }

            let nume = ret.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase(); //numele fiecarei retete (un vector cu un sg element)
            let cond1 = inpNume == "" || eliminaDiacritice(nume).includes(eliminaDiacritice(inpNume));

            let areAlcool = ret.querySelector(".val-contine_alcool").textContent.trim().toLowerCase();        
            let cond2 = (inpAlcoolic === "toate") || (inpAlcoolic === areAlcool.trim().toLowerCase());

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
                
                let continut_complet = eliminaDiacritice(`${nume} ${categorie} ${ingrediente} ${baza} ${stil} ${descriere}`);
                
                cond5 = termeni_cautare.every(termen => continut_complet.includes(eliminaDiacritice(termen))); //verificare ca sunt inclusi toti termenii
            }

            let baza = ret.getElementsByClassName("val-baza")[0].innerHTML.trim().toLowerCase();
            let cond6 = (inpBaza == "" || inpBaza == "toate" || inpBaza == baza)

            let cond7 = true;
            if(arrServire.length > 0){
                let stil = ret.getElementsByClassName("val-stil")[0].innerHTML.trim().toLowerCase();
                cond7 = arrServire.some(s => s == stil);
            }

            let isVegan = ret.getElementsByClassName("val-vegan")[0].textContent.trim().toLowerCase() === 'true';
            let cond8 = !inpVegan || (inpVegan && isVegan);

            // Afisare reteta daca toate conditiile sunt indeplinite
            if(cond1 && cond2 && cond3 && cond4 && cond5 && cond6  && cond7 && cond8){
                rezultate.push(ret);
            }
        }

        // Retetele fixate întotdeauna afisate, se adauga in lista finala
        let fixateArr = [];
        for(let ret of retete){
            let id = ret.querySelector("a").getAttribute("href").split("/").pop();
            if(reteteFixate.has(id)){
                fixateArr.push(ret);
            }
        }

        // Combinare fixate + filtrate (fara duplicate)
        let toateRetetele = [...new Set([...fixateArr, ...rezultate])];

        // Daca nu exista retete
        if(toateRetetele.length === 0){
            document.getElementById("mesaj-nu-exista").style.display = "block";
        } else {
            document.getElementById("mesaj-nu-exista").style.display = "none";
        }

        return toateRetetele;
    }

    function afiseazaPagina(numarPagina){
        paginaCurenta = numarPagina;

        document.getElementById("paginaCurenta").textContent = paginaCurenta;

        // Stergere markeri existenti 
        document.querySelectorAll(".marker-timp").forEach(marker => marker.remove());
        document.querySelectorAll(".cel-mai-mic-timp").forEach(ret => {
            ret.classList.remove("cel-mai-mic-timp");
        });

        for(let ret of reteteInitiale){
            ret.style.display = "none";
        }

        // Filtrare retete actuale
        reteteFiltrate = filtreazaRetete();

        // Cocktail cu cel mai scurt timp din fiecare categorie
        const categoriiUnice = new Set(
            Array.from(reteteFiltrate).map(ret => 
                ret.querySelector(".val-categorie").textContent.trim().toLowerCase()
            )
        );

        categoriiUnice.forEach(categorie => {
            const celMaiMicTimp = celMaiMicTimpCategorie(reteteFiltrate, categorie);
            if(celMaiMicTimp){
                celMaiMicTimp.classList.add("cel-mai-mic-timp");
            }
        })

        // Numar total de pagini
        let nrPagini = Math.ceil(reteteFiltrate.length / retetePePagina);
        if (nrPagini === 0) nrPagini = 1;
        if(paginaCurenta > nrPagini) paginaCurenta = nrPagini;
        if(paginaCurenta < 1) paginaCurenta = 1;

        // Determinare indecsi pentru afisare
        let startIdx = (paginaCurenta-1) * retetePePagina;
        let endIdx = startIdx + retetePePagina;

        // Afisare doar retete din pagina curenta
        for(let i = 0; i < reteteFiltrate.length; i++){
            if(i >= startIdx && i < endIdx){
                reteteFiltrate[i].style.display = "block";
            } else {
                reteteFiltrate[i].style.display = "none";
            }
        }

        // Retetele fixate afisate mereu (ignorand paginatia)
        for(let ret of retete){
            let id = ret.querySelector("a").getAttribute("href").split("/").pop();
            if(reteteFixate.has(id)){
                ret.style.display = "block";
            }
        }
    }

    // Buton filtrare
    document.getElementById("filtrare").onclick = function(){
        paginaCurenta = 1; // Resetare la pagina 1 la fiecare filtrare
        afiseazaPagina(paginaCurenta);
    }

    document.getElementById("btnPrev").onclick = function(){
        if(paginaCurenta > 1){
            paginaCurenta--;
            afiseazaPagina(paginaCurenta);
        }
    }

    document.getElementById("btnNext").onclick = function(){
        // recalculare nrPagini
        reteteFiltrate = filtreazaRetete();
        let nrPagini = Math.ceil(reteteFiltrate.length / retetePePagina);
        if(paginaCurenta < nrPagini){
            paginaCurenta++;
            afiseazaPagina(paginaCurenta);
        }
    }

    // La încărcare, afisare pagina 1
    afiseazaPagina(1);


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
        document.getElementById("inp-baza").value = "";
        document.getElementById("chk-vegan").checked = false;
        Array.from(document.querySelectorAll("#inp-servire option:checked")).forEach(opt => opt.selected = false);

        // Resetare ordine initiala retete + afisare toate
        let container = reteteInitiale[0].parentNode;
        for(let ret of reteteInitiale){
            container.appendChild(ret);
        }
        reteteFixate.clear();
        localStorage.removeItem("reteteFixate");
        reteteAscunseTemporar.clear();

        document.querySelectorAll(".reteta").forEach(reteta => {
            reteta.classList.remove("fixa");
        });
        document.querySelectorAll(".btn-fixeaza").forEach(btn => {
            btn.classList.remove("active");
        });

        document.getElementById("mesaj-nu-exista").style.display = "none";

        paginaCurenta = 1;
        afiseazaPagina(paginaCurenta);
    }

    // Butoane de sortare: crescator / descrescator
    document.getElementById("sortCresc").onclick = function(){
        if(!valideazaInputuri()) return;
        sorteaza(1);
    }

    document.getElementById("sortDescresc").onclick=function(){
        if(!valideazaInputuri()) return;
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

    let textarea = document.getElementById("inp-filtru-textarea");
    textarea.addEventListener("input", () => {
        let valoare = textarea.value.trim();
        if(valoare !== "" && (valoare.length < 3 || !/[a-zA-ZăîâșțĂÎÂȘȚ]/.test(valoare)))
            textarea.classList.add("is-invalid");
        else
            textarea.classList.remove("is-invalid");
    })

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
                let pRezultat = document.createElement("div")
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

    // Trigger automat la schimbarea oricarui filtru (onchange)
    document.getElementById("inp-nume").addEventListener("input", () => {paginaCurenta = 1; afiseazaPagina(paginaCurenta)});
    document.querySelectorAll('input[name="gr_rad"]').forEach(radio => {
        radio.addEventListener("change", () => {paginaCurenta = 1; afiseazaPagina(paginaCurenta)});
    })
    document.getElementById("inp-timp_prep").addEventListener("input", () => {paginaCurenta = 1; afiseazaPagina(paginaCurenta)});
    document.getElementById("inp-categorie").addEventListener("change", () => {paginaCurenta = 1; afiseazaPagina(paginaCurenta)});
    document.getElementById("inp-filtru-textarea").addEventListener("input", () => {paginaCurenta = 1; afiseazaPagina(paginaCurenta)});
    document.getElementById("inp-baza").addEventListener("input", () => {paginaCurenta = 1; afiseazaPagina(paginaCurenta)});
    document.getElementById("inp-servire").addEventListener("change", () => {paginaCurenta = 1; afiseazaPagina(paginaCurenta)});
    document.getElementById("chk-vegan").addEventListener("change", () => {paginaCurenta = 1; afiseazaPagina(paginaCurenta)});

 }