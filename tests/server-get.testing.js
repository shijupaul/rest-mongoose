const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todos} = require('./../model/todos');

var todos = [
  {text: 'todo 1'},
  {text: 'todo 2'},
  {text: 'todo 3'},
  {text: 'todo 4'}
];
beforeEach((done) => {
  Todos.remove({})
    .then(() => {
      return Todos.insertMany(todos);
    })
    .then(() => done());
  // Todos.insertMany(todos)
  //   .then(() => done());
  // todos.forEach((element) => {
  //   var todosNew = new Todos({
  //     text: element.text
  //   });
  //   todosNew.save()
  //   .then( (doc) => {
  //     console.log(doc);
  //   })
  //   .catch ((err) => {
  //     console.log(err);
  //   })
  // });


});

describe('testing server.js GET', () => {
  describe('/todos', () => {
    it('should retrieve all the objects', (done) => {
      request(app)
        .get('/todos')
        .expect(200)
        .end(done);
    });
  })
});

// describe('testing server.js', () => {
//   describe('/todos', () => {
//     it('should create a new Todo', (done) => {
//       var text = 'Test /todos';
//       request(app)
//         .post('/todos')
//         .send({text})
//         .expect(200)
//         .expect((res) => {
//           expect(res.body.text).toBe(text)
//         })
//         .end((err,res) => {
//           if (err) {
//             return done(err);
//           }
//           Todos.find()
//             .then((todos) => {
//               expect(todos.length).toBe(1);
//               expect(todos[0].text).toBe(text);
//               done();
//             })
//             .catch((e) => done(e));
//         })
//     });
//
//     it('should not create todo with invalid input', (done) => {
//       request(app)
//         .post('/todos')
//         .send({})
//         .expect(400)
//         .end( (err, res) => {
//           if (err) {
//             return done(err);
//           }
//           Todos.find()
//             .then((todos) => {
//               expect(todos.length).toBe(0);
//               done();
//             })
//             .catch((e) => done(e));
//         });
//
//     });
//
//   })
// })
