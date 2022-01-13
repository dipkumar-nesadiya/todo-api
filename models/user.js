const bcrypt = require('bcrypt');
const { reject } = require('underscore');
const _ = require('underscore');

module.exports = (sequelize, DataTypes) => {
    let user = sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        salt: {
            type: DataTypes.STRING
        },
        password_hash: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.VIRTUAL,
            allowNull: false,
            validate: {
                len: [8, 16]
            },
            set: function (value) {
                let salt = bcrypt.genSaltSync(10);
                let hashedPassword = bcrypt.hashSync(value, salt);

                this.setDataValue('password', value);
                this.setDataValue('salt', salt);
                this.setDataValue('password_hash', hashedPassword);
            }
        }
    }, {
        freezeTableName: true,
        hooks: {
            beforeValidate: function (user, options) {
                if (typeof user.email === 'string') {
                    user.email = user.email.toLowerCase();
                }
            }
        },
        classMethods: {
            authenticate: function (body) {
                return new Promise((resolve, reject) => {
                    if (typeof body.email !== 'string' || typeof body.password !== 'string') {
                        return reject('Invalid type of email or password !!!');
                    }

                    user.findOne({
                        where: {
                            email: body.email
                        }
                    })
                        .then((user) => {
                            if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
                                return reject('Invalid Password');
                            }
                            resolve(user);
                        })
                        .catch((err) => {
                            reject(err);
                        })
                });
            }
        },
        instanceMethods: {
            toPublicJSON: function () {
                let json = this.toJSON();
                return _.pick(json, 'id', 'email');
            }
        }
    });

    return user;
}