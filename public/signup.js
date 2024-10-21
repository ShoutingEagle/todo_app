document.getElementById('myForm').addEventListener('submit',handleSignup)

function handleSignup (event) {
    event.preventDefault()
    //creating FormData object
    const formData = new FormData(event.target)
    
    //converting FormData to an object
    const formObject = Object.fromEntries(formData.entries());

    //api calls
    axios
    .post('/signup',formObject)
    .then((response) => {
        const {message,username} = response.data
        if(message === 'success'){
            localStorage.setItem('username',username)
            window.location.href = '/login'
        }
    })
    .catch(error => alert(`Signup failed: ${error.message}`))
}
