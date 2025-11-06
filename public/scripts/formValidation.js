function validateJMBAGInput() {
    const checkbox = document.getElementById("checkbox1");
    if (checkbox.checked) {
        return true; 
    }
    document.getElementById("jmbagError").innerText = "";
    const jmbag = document.forms["SQLinjectionForm"]["jmbag"].value;
    const regex = /[!@#$%^&*()\-+={}[\]:;"<>,.?\/|\\]/;
    if (regex.test(jmbag) || isNaN(jmbag)) {
        document.getElementById("jmbagError").innerText = "Invalid JMBAG";
        return false;
    }
    if (jmbag.toLowerCase().includes("or") || jmbag.toLowerCase().includes("union")) {
        document.getElementById("jmbagError").innerText = "Potential SQL injection detected";
        return false;
    }
    return true;
}



function setLoginAction(e) {
    const cb = document.getElementById("checkbox2");
    const form = document.getElementById("loginForm");
    form.action = cb.checked ? "/login" : "/securelogin";
    return true; // dopušta submit
}

