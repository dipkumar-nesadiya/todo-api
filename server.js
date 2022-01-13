const express = require('express');
const bodyParser = require('body-parser');
const _ = require('underscore');
const db = require('./db.js');
const { todo } = require('./db.js');
const bcrypt = require('bcrypt');
const middleware = require('./middleware.js');

const app = express();
const PORT = process.env.PORT || 3000;
//let todoNextID = 1;

let todos = [];

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Todo API Root!');
});

// app.get('/todos', (req, res) => {
//     res.json(todos);
// });

app.get('/todos', middleware.requiredAuthentication, (req, res) => {
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
        where: where, limit: 2
    })
        .then((todo) => res.json(todo))
        .catch((err) => res.status(404).send(err));
});

app.get('/todos/:id', middleware.requiredAuthentication, (req, res) => {
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
app.post('/todos', middleware.requiredAuthentication, (req, res) => {
    let body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body)
        .then((todo) => {
            res.status(200).json(todo);
        })
        .catch((err) => {
            res.status(400).json(err);
        })
});

app.post('/users', (req, res) => {
    let body = _.pick(req.body, 'email', 'password');

    db.user.create(body)
        .then((user) => {
            res.status(200).json(user.toPublicJSON());
        })
        .catch((err) => {
            res.status(400).json(err);
        });
});

app.post('/users/login', (req, res) => {
    let body = _.pick(req.body, 'email', 'password');

    db.user.authenticate(body)
        .then((user) => {
            let token = user.generateToken('authentication');
            res.header('Auth', token).json(user.toPublicJSON());
        })
        .catch((err) => {
            res.status(401).send(err);
        })
});

//Here we are deleting perticular task using id

app.delete('/todos/:id', middleware.requiredAuthentication, (req, res) => {
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

app.put('/todos/:id', middleware.requiredAuthentication, (req, res) => {
    let todoID = parseInt(req.params.id);
    let body = _.pick(req.body, 'description', 'completed');
    let validAttribute = {};

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

    db.todo.update(validAttribute, {
        where: { id: todoID }
    })
        .then((todo) => {
            if (todo === 1) {
                res.status(200).json(todo);
            } else {
                res.status(404).send('No Data found for updation !!!');
            }
        })
        .catch((err) => {
            res.status(500).json(err);
        })
});

db.sequelize.sync().then(() => {
    app.listen(PORT, (req, res) => {
        console.log(`Express listening on PORT ${PORT}`);
    });
})