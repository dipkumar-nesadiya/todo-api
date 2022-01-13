const bcrypt = require('bcrypt');
const _ = require('underscore');
const jwt = require('jsonwebtoken');
const crypto = require('crypto-js');

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
            },
            generateToken: function (type) {
                if (!_.isString(type)) {
                    return undefined;
                }

                try {
                    let stringData = {
                        id: this.get('id'),
                        type: type
                    };
                    let encryptedData = crypto.AES.encrypt(JSON.stringify(stringData), 'abc123');
                    let token = jwt.sign({
                        token: encryptedData
                    }, 'qwerty098');

                    return token;
                } catch (err) {
                    console.log(err);
                    return undefined;
                }
            }
        }
    });

    return user;
}