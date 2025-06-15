function creareContainerComparare(){
    let container = document.createElement("div");
    container.id = "container-comparare";
    container.style.position = "fixed";
    container.style.bottom = "20px";
    container.style.right = "20px";
    container.style.background = "var(--color9)";
    container.style.padding = "16px";
    container.style.borderRadius = "12px";
    container.style.boxShadow = "0 4px 12px var(--color10)";
    container.style.zIndex = "1000";
    container.style.fontSize = "14px";
    container.style.maxWidth = "240px";

    container.innerHTML = "<h4>Comparare produse</h4><ul id='lista-comparare'></ul>";
    document.body.appendChild(container);
}

function stergeReteteComparare(index){
    let comparate = JSON.parse(localStorage.getItem("reteteComparate") || "[]");
    comparate.splice(index, 1);
    if(comparate.length === 0){
        localStorage.removeItem("reteteComparate");
        let container = document.getElementById("container-comparare");
        if(container) container.remove();
    }
    else {
        localStorage.setItem("reteteComparate", JSON.stringify(comparate));
        afiseazaComparare();
    }
    updateStatusButoane();
}

function afiseazaComparare(){
    ///doar pe anumite pagini
    if(!document.querySelector("#art-reteta") && !document.querySelector(".grid-retete"))
        return;

    let container = document.getElementById("container-comparare");
    if(!container){
        creareContainerComparare();
        console.log("Creare container");
        container = document.getElementById("container-comparare");
    }

    let lista = document.getElementById("lista-comparare");
    lista.innerHTML = "";

    let comparate = JSON.parse(localStorage.getItem("reteteComparate") || "[]");
    console.log("Retete comparate:", comparate);

    comparate.forEach((reteta, index) => {
        let li = document.createElement("li");
        li.innerText = reteta.nume;
        let btnSterge = document.createElement("button");
        btnSterge.innerText = "Șterge";
        btnSterge.onclick = () => stergeReteteComparare(index);
        li.appendChild(btnSterge);
        lista.appendChild(li);
    })

    if(comparate.length === 2){
        if(!document.getElementById("btn-afiseaza-comparare")){
            let btnAfiseaza = document.createElement("button");
            btnAfiseaza.id = "btn-afiseaza-comparare";
            btnAfiseaza.innerText = 'Afișează';
            btnAfiseaza.onclick = () => {
                const idsParam = comparate.map(r => r.id).join(",");
                window.open(`/comparare?ids=${idsParam}`, "_self");
            }
            container.appendChild(btnAfiseaza);
        }
    }
    else {
        // daca sunt mai putin de 2
        let btnAfiseaza = document.getElementById("btn-afiseaza-comparare");
        if(btnAfiseaza) btnAfiseaza.remove();
    }
}

function adaugaRetetaLaComparare(id, nume){
    let comparate = JSON.parse(localStorage.getItem("reteteComparate") || "[]");

    if(comparate.length === 0)
        creareContainerComparare();

    if(comparate.length < 2){
        comparate.push({id, nume, timestamp: Date.now()});
        localStorage.setItem("reteteComparate", JSON.stringify(comparate));
        afiseazaComparare();
    }
    updateStatusButoane();
}

function updateStatusButoane(){
    let comparate = JSON.parse(localStorage.getItem("reteteComparate") || "[]");
    let disable = comparate.length >= 2;
    document.querySelectorAll(".btn-compara").forEach(btn => {
        btn.disabled = disable;
        if(disable){
            btn.title = "Ștergeti un produs din lista de comparare";
        }
        else {
            btn.removeAttribute("title");
        }
    })
}

window.addEventListener("load", () => {
    afiseazaComparare();
    updateStatusButoane();
})