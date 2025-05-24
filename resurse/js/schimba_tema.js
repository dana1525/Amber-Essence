window.addEventListener("DOMContentLoaded", function() {
    const themeSwitch = document.getElementById("schimba_tema");
    const themeIcon = themeSwitch.querySelector("i");
    
    // Verificare tema salvata
    if (localStorage.getItem("tema") === "dark") {
        document.body.classList.add("dark");
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
    else
    {
        // Asigurare tema deschisă (default)
        document.body.classList.remove("dark");
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
    
    // Gestionare click
    themeSwitch.onclick = function() {
        const isDark = document.body.classList.toggle("dark");
        
        // Actualizare iconita
        if (isDark) {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem("tema", "dark");
        } else {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.removeItem("tema");
        }
    };
});