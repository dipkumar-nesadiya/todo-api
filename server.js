const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const todos = [{
    id: 1,
    description: 'Go to movie',
    completed: false
}, {
    id: 2,
    description: 'Complete section 7 in node js course',
    completed: false
}, {
    id: 3,
    description: 'Learn basics of Express',
    completed: true
}];

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

app.listen(PORT, (req, res) => {
    console.log(`Express listening on PORT ${PORT}`);
})