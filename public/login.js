document.getElementById('formLogin').addEventListener('submit',handleLogin)

function handleLogin (event) {
    event.preventDefault()
    const formData = new FormData(event.target)
    const formObject = Object.fromEntries(formData.entries());
    
    axios.post('/login',formObject)
    .then(response => {   
        if(response.data.message === 'login-success'){
            localStorage.setItem("userData", JSON.stringify(response.data.userData));
            window.location.href = '/dashboard'
        }
    })
    .catch((error) => {
        console.log(error);
    })
}
