function signinpage(){
    var element = document.getElementById("sign-up");
    var element2 = document.getElementById("sign-in");
    element.classList.remove('active');
    element2.classList.add('active');
    element.style.display = "none";
    element2.style.display = "inline";
}

function signuppage(){
    var element = document.getElementById("sign-in");
    var element2 = document.getElementById("sign-up");
    element.classList.remove('active');
    element2.classList.add('active');
    element.style.display = "none";
    element2.style.display = "inline";
}