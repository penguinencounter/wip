let mode = "login";
function toggleMode() {
    mode = mode === "login" ? "register" : "login";
    let form = document.getElementById('login_register');
    let submit = document.getElementById('submit_btn');
    submit.value = mode[0].toUpperCase()+mode.slice(1).toLowerCase()
    form.classList.remove(mode === "login" ? 'theme_orange' : 'theme_blue');
    form.classList.add(mode === "login" ? 'theme_blue' : 'theme_orange');
}
function loadHandlerYadaYada() {
    let form = document.getElementById('login_register');
    form.addEventListener('submit', function() {
        
    })
    toggleMode();
    toggleMode();
    document.getElementById('login_register_switch_decor').addEventListener('click', toggleMode);
    document.getElementById('submit_btn').disabled = false;
}

window.addEventListener("load", loadHandlerYadaYada)