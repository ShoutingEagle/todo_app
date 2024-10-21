let SKIP = 0;
window.onload = function () {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
        document.getElementById('welcome-text').innerHTML = `Welcome "${userData.username}" to your dashboard!`;
        render()
    } else {
        window.location.href = '/login';  // If userData is not found, redirect to login
    }
    
    document.getElementById('logout').addEventListener('click', logout);
    document.getElementById('logoutAll').addEventListener('click', logoutAll);
    document.getElementById('add-todo').addEventListener('click', addTodo);
    document.getElementById('paginated-data').addEventListener('click', paginatedData);
    
};

function paginatedData () {
    axios.get(`/getTodo?skip=${SKIP}`)
    .then(response => {
        const {data} = response
        if(data.length === 0){
            alert('no more data found')
        }
        document.getElementById('todo-list').innerHTML += data.map((item) => {
            return (`<li data-id='${item._id}'>
                        <p>${item.inputTodo}</p>
                        <div>
                            <button class="edit-button">Edit</button>
                            <button class="delete-button">Delete</button>
                        </div>
                     </li>`)}).join('')
                     attachEventListener()
                     SKIP+=data.length
    })
    .catch(error => console.log(error))
}

function render() {
    axios.get(`/getTodo?skip=${SKIP}`)
    .then(response => {
        
        
        const {data} = response
        document.getElementById('todo-list').innerHTML = data.map((item) => {
            return (`<li data-id='${item._id}'>
                        <p>${item.inputTodo}</p>
                        <div>
                            <button class="edit-button">Edit</button>
                            <button class="delete-button">Delete</button>
                        </div>
                     </li>`)}).join('')
                     attachEventListener()
                     SKIP+=data.length
    })
    .catch(error => console.log(error))
}   

function logout() {
    axios.get('/logout')
    .then(response => {
        localStorage.removeItem('userData');  // Clear localStorage data on logout
        window.location.href = '/login';
    })
    .catch(error => console.log(error));
}

function logoutAll() {
    axios.get('/logoutAll')
    .then(response => {
        localStorage.removeItem('userData');  // Clear localStorage data on logout
        window.location.href = '/login';
    })
    .catch(error => console.log(error));
}

function addTodo () {
    const inputTodo = document.getElementById('todo-input').value
    
    axios.post('/createTodo',{inputTodo})
    .then((response) => {
        console.log(response);
        
        if(response.data.status === 'failed'){
            alert(response.data.message)
        }else{
            document.getElementById('todo-list').innerHTML += ` 
                <li data-id='${response.data._id}'>
                    <p>${response.data.inputTodo}</p>
                    <div>
                        <button class="edit-button">Edit</button>
                        <button class="delete-button">Delete</button>
                    </div>
                </li>`
                document.getElementById('todo-input').value = ''
            attachEventListener()
        }
        
    })
    .catch((error) => console.log(error))
    
}

function attachEventListener () {
    document.querySelectorAll('.edit-button').forEach((button) => button.addEventListener('click',handleEdit))
    document.querySelectorAll('.delete-button').forEach((button) => button.addEventListener('click',handleDelete))
}

function handleEdit (event) {
    const userInput = prompt()
    const targetElement = event.target.closest('li').dataset.id
    axios.post('/updateTodo',{'inputTodo': userInput,'_id': targetElement})
    .then(response => {
        render()
    })
    .catch(error => {
        console.log(error); 
    }) 
}

function handleDelete (event) {
    const targetElement = event.target.closest('li').dataset.id
    axios.post('/deleteTodo',{_id:targetElement})
    .then(response => {
        if(response.data.acknowledged){ 
            render()
        }else{
            console.log(response);   
        }
    })
    .catch(error => console.log(error))
}


