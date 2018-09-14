const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');

const {app} = require('./../server');
const {Todos} = require('./../model/todos');


var todos = [
  {_id: new ObjectId(), text: 'todo 1'},
  {_id: new ObjectId(), text: 'todo 2'},
  {_id: new ObjectId(), text: 'todo 3'},
  {_id: new ObjectId(), text: 'todo 4'}
];

beforeEach((done) => {
  Todos.remove({})
    .then(() => {
      return Todos.insertMany(todos);
    })
    .then(() => done());
});

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
