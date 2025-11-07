function validateJMBAGInput(e) {
    const checkbox = document.getElementById("checkbox1");
    const form = document.getElementById("studentInfoForm");

    if (checkbox.checked) {
        form.action = "/student-info";
        return true; 
    }
    document.getElementById("jmbagError").innerText = "";
    const jmbag = form.jmbag.value;
    const regex = /[!@#$%^&*()\-+={}[\]:;"<>,.?\/|\\]/;
    if (regex.test(jmbag) || isNaN(jmbag)) {
        document.getElementById("jmbagError").innerText = "Invalid JMBAG";
        return false;
    }
    if (jmbag.toLowerCase().includes("or") || jmbag.toLowerCase().includes("union") || jmbag.toLowerCase().includes("order by")) {
        document.getElementById("jmbagError").innerText = "Invalid JMBAG";
        return false;
    }
    form.action = "/secure-student-info";
    return true;
}

function setLoginAction(e) {
    const cb = document.getElementById("checkbox2");
    const form = document.getElementById("loginForm");  
    form.action = cb.checked ? "/login" : "/securelogin";
    return true;
}


