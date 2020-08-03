process.env.NODE_ENV = 'test';

const Certificate = require('./../models/Certificate');
const User = require('./../models/User');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const test_description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin et arcu vulputate, finibus est ut, sodales orci. Etiam in justo lacinia enim posuere hendrerit ut sit amet sem. Suspendisse enim orci, laoreet eu eros non, tincidunt consectetur nulla. Aenean at imperdiet neque. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi aliquam massa in lacinia feugiat. Nullam varius scelerisque ligula, ac aliquet mauris ornare eget. Nulla facilisi. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce neque orci, lobortis et felis eu, vulputate sollicitudin metus. Nunc vel turpis euismod, sodales elit a, commodo diam. Nunc convallis porttitor iaculis. Donec lectus ex, varius eu leo a, iaculis tempus lectus.";
const mocha = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./../index');
const should = chai.should();
const config = require('../config')
const describe = mocha.describe;
const beforeEach = mocha.beforeEach;
const before = mocha.before;
const bcrypt = require('bcryptjs');
const it = mocha.it;
const test_user = require('../constants/test_user');
const example_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const test_certificate = {
    _id: new ObjectId(),
    title: "Test certificate",
    description: test_description,
    photo: 'lkdsfjlksdljkfsjlkdgklsdfjksdlkfjsjlkdgfjlksljkfdljskdflkjsdkfjskldfjslkdfjslkdfjslkdfjsdflksd',
    date_receiving: new Date('2010-12-17T03:24:00'),
    teacher: 'Hryshyna Elena',
};

chai.use(chaiHttp);

before(async () => {
    await User.findById(test_user._id).deleteOne();
    const user = new User(test_user);
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
    await user.save();
});

beforeEach(async () => {
    await Certificate.find({}).deleteMany();
    const user = await User.find(test_user._id).exec();
    if (user.length !== 0) {
        const certificate = new Certificate(Object.assign({owner_id: user[0]._id}, test_certificate));
        await certificate.save();
    }
});


describe('GET /_api/certificates', () => {
    it('it should GET all the certificates', (done) => {
        chai.request(server)
            .get('/_api/certificates')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.equal(1);
                done();
            });
    });

    it('it should GET certificate by id', (done) => {
        chai.request(server)
            .get(`/_api/certificates/${test_certificate._id}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });

    it('it should return 404 error because wrong certificate id', (done) => {
        chai.request(server)
            .get('/_api/certificate/13252112')
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');
                done();
            });
    });

    it('it should return 404 error because wrong route', (done) => {
        chai.request(server)
            .get('/_api/certificate')
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    });
});

describe('POST /_api/certificates', () => {
    it('it should create new certificate', (done) => {
        User.findById(test_user._id).then(user => {
            const user_json = user.toJSON();
            const token = jwt.sign(user_json, config.JWT_SECRET, {
                expiresIn: '15m'
            });

            const request_data = {
                title: "Test1 certificate",
                description: test_description,
                photo: 'asdgas',
                owner_id: String(user_json._id),
                teacher: 'test teacher',
                date_receiving: new Date('2014-11-17T03:24:00'),
            }

            chai.request(server)
                .post('/_api/certificates')
                .set( "Authorization", `Bearer ${token}`)
                .send(request_data)
                .end((err, res) => {
                    res.should.have.status(201);
                    done();
                });
        });
    });

    it('it should return 400 wrong owner id', (done) => {
        User.findById(test_user._id).then(user => {
            const user_json = user.toJSON();
            const token = jwt.sign(user_json, config.JWT_SECRET, {
                expiresIn: '15m'
            });
            const request_data = {
                title: "Test1 certificate",
                description: test_description,
                photo: 'asdgas',
                owner_id: 'asfgsa123',
            }

            chai.request(server)
                .post('/_api/certificates')
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
        User.findById(test_user._id).then(user => {
            const user_json = user.toJSON();
            const token = jwt.sign(user_json, config.JWT_SECRET, {
                expiresIn: '15m'
            });
            const request_body = {
                photo: 'asdasgasgg',
                owner_id: user_json._id,
            }

            chai.request(server)
                .patch(`/_api/certificates/${test_certificate._id}`)
                .set("Authorization", `Bearer ${token}`)
                .send(request_body)
                .end(async (err, res) => {
                    res.should.have.status(200);
                    const current_certificate = await Certificate.findById(test_certificate._id)
                        .then(certificate => {
                            return certificate.toJSON();
                        });
                    current_certificate.photo.should.be.equal(request_body.photo);
                    done();
                });
        });
    });

    it('should return 400 invalid owner_id', (done) => {
        User.findById(test_user._id).then(user => {
            const user_json = user.toJSON();
            const token = jwt.sign(user_json, config.JWT_SECRET, {
                expiresIn: '15m'
            });
            const request_body = {
                photo: 'asdasgasgg',
                owner_id: 'asddasljasdljk',
            }

            chai.request(server)
                .patch(`/_api/certificates/${test_certificate._id}`)
                .set("Authorization", `Bearer ${token}`)
                .send(request_body)
                .end(async (err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });
    });

    it('should return 400 invalid certificate id', (done) => {
        User.findById(test_user._id).then(user => {
            const user_json = user.toJSON();
            const token = jwt.sign(user_json, config.JWT_SECRET, {
                expiresIn: '15m'
            });
            const request_body = {
                photo: 'asdasgasgg',
                owner_id: test_user._id,
            }

            chai.request(server)
                .patch('/_api/certificates/saddsa')
                .set("Authorization", `Bearer ${token}`)
                .send(request_body)
                .end(async (err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });
    });
});

describe('DELETE /_api/certificates/:id', () => {
    it('it should delete certificate by id', (done) => {
        User.findById(test_user._id).then(user => {
            const token = jwt.sign(user.toJSON(), config.JWT_SECRET, {
                expiresIn: '15m'
            });
            const request_data = {
                owner_id: user._id,
            }

            chai.request(server)
                .del(`/_api/certificates/${test_certificate._id}`)
                .set("Authorization", `Bearer ${token}`)
                .send(request_data)
                .end(async (err, res) => {
                    res.should.have.status(200);
                    const isDeleted = !Boolean(await Certificate.findById(test_certificate._id));
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
                .del(`/_api/certificates/${test_certificate._id}`)
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
                .del(`/_api/certificates/${test_certificate._id}`)
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
                .del(`/_api/certificates/${test_certificate._id}`)
                .set("Authorization", `Bearer ${example_token}`)
                .send(request_data)
                .end(async (err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });
});
