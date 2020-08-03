process.env.NODE_ENV = 'test';

const User = require('./../models/User');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const mocha = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./../index');
const should = chai.should();
const config = require('../config')
const auth = require('../auth');
const describe = mocha.describe;
const beforeEach = mocha.beforeEach;
const it = mocha.it;
const example_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const test_user = require('../constants/test_user');

chai.use(chaiHttp);

async function getRootUser() {
    return await User.find({}).exec();
}

const root_user = getRootUser();

beforeEach(async () => {
    await User.findById(test_user._id).deleteOne();
    const user = new User(test_user);
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
    await user.save();
});

describe('GET /_api/users', () => {
    it('it should GET all the users', (done) => {
    chai.request(server)
        .get('/_api/users')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body[0].should.not.have.property('password');
            res.body[0].should.not.have.property('login');
            done();
        });
    });

    it('it should GET user by id', (done) => {
        root_user.then(user => {
            chai.request(server)
                .get(`/_api/users/${user[0]._id}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.not.have.property('password');
                    res.body.should.not.have.property('login');
                    done();
                });
        });
    });

    it('it should return 404 error because wrong user id', (done) => {
        chai.request(server)
            .get('/_api/users/123')
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');
                done();
            });
        });

    it('it should return 404 error because wrong route', (done) => {
        chai.request(server)
            .get('/_api/user')
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    });
});

describe('sign in user /_api/users/sign-in', () => {
   it('it should return json web token', (done) => {
       const request_data = {
           password: config.ROOT_PASSWORD,
           login: config.ROOT_LOGIN,
       };

       chai.request(server)
           .post('/_api/users/sign-in')
           .send(request_data)
           .end((err, res) => {
               res.should.have.status(200);
               res.body.should.be.a('object');
               res.body.should.have.property('token');
               done();
           });
   });

   it('it should return 401 wrong login/password', (done) => {
       const request_data = {
           password: 1234567890,
           login: 'test_data',
       };

       chai.request(server)
           .post('/_api/users/sign-in')
           .send(request_data)
           .end((err, res) => {
               res.should.have.status(401);
               res.body.should.be.a('object');
               done();
           });
   });
});

describe('POST /_api/users', () => {
   it('it should create new user', (done) => {
       auth.authenticate(config.ROOT_LOGIN, config.ROOT_PASSWORD).then(user => {
           const test_password = "1234567y";
           const token = jwt.sign(user.toJSON(), config.JWT_SECRET, {
               expiresIn: '15m'
           });

           const request_data = {
               login: "alina123",
               password: test_password,
               name: "Alina",
               surname: "Pogrebnyak",
               instagram: "alina123_inst",
               description: test_user.description,
               owner_id: user._id,
           }

           chai.request(server)
               .post('/_api/users')
               .set( "Authorization", `Bearer ${token}`)
               .send(request_data)
               .end((err, res) => {
                   res.should.have.status(201);
               });
           done();
       });
   });

    it('it should return 403 owner not root user', (done) => {
        auth.authenticate(config.ROOT_LOGIN, config.ROOT_PASSWORD).then(user => {
            const test_password = "1234567y";
            const token = jwt.sign(user.toJSON(), config.JWT_SECRET, {
                expiresIn: '15m'
            });
            const request_data = {
                login: "alina123",
                password: test_password,
                name: "Alina",
                surname: "Pogrebnyak",
                instagram: "alina123_inst",
                description: test_user.description,
                owner_id: test_user._id,
            }

            chai.request(server)
                .post('/_api/users')
                .set( "Authorization", `Bearer ${token}`)
                .send(request_data)
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });
    });

    it('it should return 400 wrong owner id', (done) => {
        auth.authenticate(config.ROOT_LOGIN, config.ROOT_PASSWORD).then(user => {
            const test_password = "1234567y";
            const token = jwt.sign(user.toJSON(), config.JWT_SECRET, {
                expiresIn: '15m'
            });
            const request_data = {
                login: "alina123",
                password: test_password,
                name: "Alina",
                surname: "Pogrebnyak",
                instagram: "alina123_inst",
                description: test_user.description,
                owner_id: '2132145211212',
            }

            chai.request(server)
                .post('/_api/users')
                .set( "Authorization", `Bearer ${token}`)
                .send(request_data)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });
    });
});

describe('PATCH /_api/users/:id', () => {
    it('should patch user by id root user', (done) => {
        auth.authenticate(config.ROOT_LOGIN, config.ROOT_PASSWORD).then(user => {
            const token = jwt.sign(user.toJSON(), config.JWT_SECRET, {
                expiresIn: '15m'
            });
            const request_body = {
                name: 'Olena',
                surname: 'Hryshyna',
                owner_id: user._id,
            }
            chai.request(server)
                .patch(`/_api/users/${test_user._id}`)
                .set("Authorization", `Bearer ${token}`)
                .send(request_body)
                .end(async (err, res) => {
                    res.should.have.status(200);
                    const current_user = await User.findById(test_user._id)
                        .then(user => {
                            return user.toJSON();
                        });
                    current_user.name.should.be.equal(request_body.name);
                    current_user.surname.should.be.equal(request_body.surname);
                    current_user.description.should.be.equal(test_user.description);
                    done();
                });
        });
    });

    it('it should patch user by id current user', (done) => {
        User.findById(test_user._id).then((user) => {
            const token = jwt.sign(user.toJSON(), config.JWT_SECRET, {
                expiresIn: '15m'
            });
            const request_body = {
                name: 'Olena',
                surname: 'Hryshyna',
                owner_id: user._id,
            }

            chai.request(server)
                .patch(`/_api/users/${test_user._id}`)
                .set("Authorization", `Bearer ${token}`)
                .send(request_body)
                .end(async (err, res) => {
                    res.should.have.status(200);
                    const current_user = await User.findById(user._id)
                        .then(user => {
                            return user.toJSON();
                        });
                    current_user.name.should.be.equal(request_body.name);
                    current_user.surname.should.be.equal(request_body.surname);
                    current_user.description.should.be.equal(user.description);
                    done();
                });
            });
    });
});

describe('DELETE /_api/users/:id', () => {
    it('it should delete user by id', (done) => {
        auth.authenticate(config.ROOT_LOGIN, config.ROOT_PASSWORD).then(user => {
            const token = jwt.sign(user.toJSON(), config.JWT_SECRET, {
                expiresIn: '15m'
            });
            const request_data = {
                owner_id: user._id,
            }

            chai.request(server)
                .del(`/_api/users/${user._id}`)
                .set("Authorization", `Bearer ${token}`)
                .send(request_data)
                .end(async (err, res) => {
                    res.should.have.status(200);
                    const isDeleted = Boolean(await User.findById(user._id));
                    isDeleted.should.be.equal(false);
                    done();
                });
        });
    });

    it('it should delete user by himself', (done) => {
        User.findById(test_user._id).then((user) => {
            const token = jwt.sign(user.toJSON(), config.JWT_SECRET, {
                expiresIn: '15m'
            });
            const request_data = {
                owner_id: user._id,
            }

            chai.request(server)
                .del(`/_api/users/${user._id}`)
                .set("Authorization", `Bearer ${token}`)
                .send(request_data)
                .end(async (err, res) => {
                    res.should.have.status(200);
                    const isDeleted = !Boolean(await User.findById(user._id));
                    isDeleted.should.be.equal(true);
                    done();
                });
        });
    });

    it('it should return 400', (done) => {
        User.findById(test_user._id).then((user) => {
            const token = jwt.sign(user.toJSON(), config.JWT_SECRET, {
                expiresIn: '15m'
            });

            chai.request(server)
                .del(`/_api/users/${user._id}`)
                .set("Authorization", `Bearer ${token}`)
                .end(async (err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });
    });

    it('it should return 401 missing token', (done) => {
        User.findById(test_user._id).then((user) => {
            const request_data = {
                owner_id: user._id,
            }

            chai.request(server)
                .del(`/_api/users/${user._id}`)
                .send(request_data)
                .end(async (err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });

    it('it should return 401 wrong token', (done) => {
        User.findById(test_user._id).then((user) => {
            const request_data = {
                owner_id: user._id,
            }

            chai.request(server)
                .del(`/_api/users/${user._id}`)
                .set("Authorization", `Bearer ${example_token}`)
                .send(request_data)
                .end(async (err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });
});
