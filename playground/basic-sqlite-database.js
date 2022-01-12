const Sequelize = require('sequelize');
const sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': `${__dirname}/basic-sqlite-database.sqlite`
});

let Todo = sequelize.define('todo', {
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 255]
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    freezeTableName: true
});

sequelize.sync({ force: true }).then(() => {
    console.log('Everything is synced !');

    Todo.create({
        description: 'Go for walk',
        completed: true
    })
        .then((todo) => {
            return Todo.create({
                description: 'Swimming',
                completed: true
            })
        })
        .then(() => {
            return Todo.findAll({
                where: {
                    description : {
                        $like : '%Go%'
                    }
                }
            });
        })
        .then((todos) => {
            if (todos) {
                todos.forEach(element => {
                    console.log(element);                    
                });
            } else {
                console.log("No data found");
            }
        })
        .catch((err) => {
            console.log(`Error : ${err}`);
        });
});