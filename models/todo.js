module.exports = (sequelize, DataTypes) => {
    return sequelize.define('todo', {
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 255]
            }
        },
        completed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        freezeTableName: true
    });
}