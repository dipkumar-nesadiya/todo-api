const express = require('express');
const bodyParser = require('body-parser');
const _ = require('underscore');
const db = require('./db.js');
const { todo } = require('./db.js');
const { filter } = require('underscore');

const app = express();
const PORT = process.env.PORT || 3000;
let todoNextID = 1;

let todos = [];

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Todo API Root!');
});

// app.get('/todos', (req, res) => {
//     res.json(todos);
// });

app.get('/todos', (req, res) => {
    let query = req.query;
    let where = {};

    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q + '%'
        };
    }

    db.todo.findAll({
        where: where
    })
        .then((todo) => res.json(todo))
        .catch((err) => res.status(404).send(err));
});

app.get('/todos/:id', (req, res) => {
    let todoID = parseInt(req.params.id, 10);

    db.todo.findAll({
        where: {
            id: todoID
        }
    })
        .then((todo) => {
            if (todo) {
                res.json(todo)
            } else {
                res.status(404).send();
            }
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

//Here we are adding todo task dynamically
//Post contains data so we can pass todo data to it. It contains JSON data and server takes this data
// and stores in array
app.post('/todos', (req, res) => {
    let body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body)
        .then((todo) => {
            res.status(200).json(todo);
        })
        .catch((err) => {
            res.status(400).json(err);
        })
});

//Here we are deleting perticular task using id

app.delete('/todos/:id', (req, res) => {
    let todoID = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {
            id: todoID
        }
    })
        .then((rowDeleted) => {
            if (rowDeleted === 0) {
                res.status(404).send();
                //return res.status(400).send('Error! No data found with this id ..... ');
            } else {
                res.json(todo)
            }
        })
        .catch((err) => {
            res.status(500).json(err);
        })
});

//Here we are updating particular task by id

app.put('/todos/:id', (req, res) => {
    let todoID = parseInt(req.params.id);
    let matchedData = _.findWhere(todos, { id: todoID });
    let body = _.pick(req.body, 'description', 'completed');
    let validAttribute = {};

    if (!matchedData) {
        return res.status(404).send();
    }

    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttribute.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).send();
    }

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttribute.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    }

    res.json(_.extend(matchedData, validAttribute));
});

db.sequelize.sync().then(() => {
    app.listen(PORT, (req, res) => {
        console.log(`Express listening on PORT ${PORT}`);
    });
})