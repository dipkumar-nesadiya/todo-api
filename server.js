const express = require('express');
const bodyParser = require('body-parser');
const _ = require('underscore');

const app = express();
const PORT = process.env.PORT || 3000;
let todoNextID = 1;

let todos = [];

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Todo API Root!');
});

app.get('/todos', (req, res) => {
    res.json(todos);
});

app.get('/todos/:id', (req, res) => {
    let todoID = parseInt(req.params.id,10);
    // let matched = false;

    // todos.forEach((element) => {
    //     if (element.id === todoID) {
    //         matched = true;
    //         res.json(element);
    //     }
    // })

    let matchedData = _.findWhere(todos,{id:todoID});
    
    if (matchedData === undefined) {
        res.status(404).send();
    } else {
        res.json(matchedData);
    }
});

//Here we are adding todo task dynamically
//Post contains data so we can pass todo data to it. It contains JSON data and server takes this data
// and stores in array
app.post('/todos', (req,res) => {
    let body = req.body;
    
    if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
        return res.status(400).send();
    }

    body.id = todoNextID++;
    body.description = body.description.trim();

    todos.push(_.pick(body,'id','description','completed'));

    res.json(body);
});

//Here we are deleting perticular task using id

app.delete('/todos/:id', (req,res) => {
    let todoID = parseInt(req.params.id,10);
    let matchedData = _.findWhere(todos,{id:todoID});

    if(!matchedData) {
        return res.status(400).send('Error! No data found with this id ..... ');
    }

    todos = _.without(todos,matchedData);

    res.json(todos);
});

app.listen(PORT, (req, res) => {
    console.log(`Express listening on PORT ${PORT}`);
})