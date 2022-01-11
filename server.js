const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
let todoNextID = 1;

const todos = [];

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Todo API Root!');
});

app.get('/todos', (req, res) => {
    res.json(todos);
});

app.get('/todos/:id', (req, res) => {
    let todoID = parseInt(req.params.id,10);
    let matched = false;

    todos.forEach((element) => {
        if (element.id === todoID) {
            matched = true;
            res.json(element);
        }
    })

    if (matched === false) {
        res.status(404).send();
    }
});

//Here we are adding todo task dynamically
//Post contains data so we can pass todo data to it. It contains JSON data and server takes this data
// and stores in array
app.post('/todos', (req,res) => {
    let body = req.body;

    body.id = todoNextID++;
    todos.push(body);

    res.json(body);
});

app.listen(PORT, (req, res) => {
    console.log(`Express listening on PORT ${PORT}`);
})