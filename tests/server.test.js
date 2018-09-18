const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');

const {app} = require('./../server');
const {Todos} = require('./../model/todos');
const {User} = require('./../model/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('testing server.js', () => {
  describe('/todos', () => {
    it('should create a new Todo', (done) => {
      var text = 'Test /todos';
      request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res) => {
          expect(res.body.text).toBe(text)
        })
        .end((err,res) => {
          if (err) {
            return done(err);
          }
          Todos.find({text})
            .then((todos) => {
              expect(todos.length).toBe(1);
              expect(todos[0].text).toBe(text);
              done();
            })
            .catch((e) => done(e));
        })
    });

    it('should not create todo with invalid input', (done) => {
      request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end( (err, res) => {
          if (err) {
            return done(err);
          }
          Todos.find()
            .then((todos) => {
              expect(todos.length).toBe(4);
              done();
            })
            .catch((e) => done(e));
        });

    });

  })
})

describe('testing server.js GET', () => {
  describe('/todos', () => {
    it('should retrieve all the objects', (done) => {
      request(app)
        .get('/todos')
        .expect(200)
        .expect((res) => {
          expect(res.body.todos.length).toBe(4);
        })
        .end(done);
    });
  })
});

describe('testing server.js GET', () => {
  describe('/todos/:id', () => {
    it('should get matching todo', (done) => {
      request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.text).toBe(todos[0].text)
        })
        .end(done)
    })

    it('should fail for invalid id', (done) => {
      request(app)
        .get('/todos/123')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Invalid ObjectId 123');
        })
        .end(done)
    })

    it('should fail for tampered id', (done) => {
      var objectId = new ObjectId().toHexString();
      request(app)
        .get(`/todos/${objectId}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe(`Object not found matching Id ${objectId}`);
        })
        .end(done)
    })

  })
})


describe('testing server.js DELETE', () => {
  describe('/todos/:id', () => {
    it('should DELETE matching todo', (done) => {
      request(app)
        .delete(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.text).toBe(todos[0].text)
        })
        .end((err, res) => {
          if (err) {
            return done(err)
          }
          Todos.findById(todos[0]._id.toHexString())
            .then((doc) => {
              expect(doc).toBeNull();
              done();
            })
            .catch((e) => done(e))
        })
    })

    it('should fail for invalid id', (done) => {
      request(app)
        .delete('/todos/123')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Invalid ObjectId 123');
        })
        .end(done)
    })

    it('should fail for tampered id', (done) => {
      var objectId = new ObjectId().toHexString();
      request(app)
        .delete(`/todos/${objectId}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe(`Object not found matching Id ${objectId}`);
        })
        .end(done)
    })

  })
})

describe('PUT /todos/:id', () => {
  it('should update the todo', (done) => {
    var body = {text: 'updating for test', completed: true};
    request(app)
      .put(`/todos/${todos[0]._id.toHexString()}`)
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(body.text);
        expect(res.body.todo.completed).toBe(body.completed);
        expect(res.body.todo.completedAt).toBeDefined();
      })
      .end(done);
  })
  it('should clear properties when not completed', (done) => {
    var body = {completed: false};
    request(app)
      .put(`/todos/${todos[3]._id.toHexString()}`)
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.completed).toBe(body.completed);
        expect(res.body.todo.completedAt).toBeNull();
      })
      .end(done);
  })
})

describe('GET /users/me', () => {
  it('should return user when authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString())
        expect(res.body.email).toBe(users[0].email)
      })
      .end(done)
  })
  it('should return 401 when not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({})
      })
      .end(done)
  })
})

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'shijuppaul1974@gmail.com';
    var password = 'Joel2004';
    request(app)
      .post('/users')
      .send({email,password})
      .expect(200)
      .expect((res) => {
        console.log(res.body);
        expect(res.header['x-auth']).toBeTruthy(); // has hyphon in it. res.header['x-auth']
        expect(res.body.email).toBe(email);
        expect(res.body._id).toBeTruthy();
      })
      .end((err,res) => {
        if (err) {
          return done(err);
        }
        User.findOne({email})
          .then((user) => {
            expect(user).toBeTruthy();
            expect(user.password).not.toBe(password);
            done();
          })
          .catch((err) => done(err));
      });
  })
  it('should return validation errors if request is invalid', (done) => {
    var email = 'shijuppaul1974';
    var password = 'Joel2004';
    request(app)
      .post('/users')
      .send({email,password})
      .expect(400)
      .expect((res) => {
        expect(res.body.errors.email.message).toBe(`${email} is not a valid email`);
      })
      .end(done);
  })
  it('should not create user if email is in use', (done) => {
    var email = users[0].email;
    var password = 'Joel2004';
    request(app)
      .post('/users')
      .send({email,password})
      .expect(400)
      .expect((res) => {
        expect(res.body).toBeTruthy()
      })
      .end(done);
  })
})

describe('POST /users/login', () => {
  it('should return a valid user when credentials match', (done) => {
    var email = users[1].email
    var password = users[1].password
    request(app)
      .post('/users/login')
      .send({email,password})
      .expect(200)
      .expect((res) => {
        expect(res.header['x-auth']).toBeTruthy()
        expect(res.body.email).toBe(email);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[1]._id)
          .then((user) => {
            expect(user.tokens[0]).toHaveProperty('token',res.header['x-auth'])
            done()
          })
          .catch( (e) => done(e))
      })
  })

  it('should error 400 when password don\'t match', (done) => {
    var email = users[1].email
    var password = users[1]. password + '123'
    request(app)
      .post('/users/login')
      .send({email,password})
      .expect(400)
      .expect((res) => {
        expect(res.header['x-auth']).toBeFalsy()
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        User.findById(users[1]._id)
          .then((user) => {
            expect(user.tokens.length).toBe(0)
            done()
          })
          .catch( (e) => done(e))
      })
  })
})

describe('DELETE /users/me/token', () => {
  it('should remove the token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        User.findById(users[0]._id)
          .then((user) => {
            expect(user.tokens.length).toBe(0)
            done()
          })
          .catch( (e) => done(e))
      })
  })
})
