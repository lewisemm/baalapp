// load the applications environment
require('dotenv').load();

var request = require('superagent'),
  faker = require('faker'),
  _expect = require('expect.js'),
  resourceApiUrl = 'http://localhost:3000/api/documents',
  underscore = require('underscore'),
  bcrypt = require('bcrypt'),
  mongoose = require('../../server/config/database'),
  Schema = mongoose.Schema,
  Users = require('../../server/models/users')(mongoose, Schema);


describe('doc RESTful API tests', function() {
  var user = {
      username: (faker.internet.userName()).toLowerCase(),
      password: faker.internet.password()
    },
    userInfoUpdates = {
      email: faker.internet.email(),
      name: {
        first: faker.name.firstName(),
        last: faker.name.lastName()
      }
    },
    newDoc = {
      content: faker.lorem.sentence(),
      private: false
    },
    doc,
    authToken = null;

  before('create user', function(done) {
    // 1st encrypt the user's password and then add them to the DB
    bcrypt.hash(user.password, 10, function(err, hashedPassword) {
      if (err) {
        throw err;
      }
      var newUser = new Users(user);
      newUser.password = hashedPassword;
      // save user
      newUser.save(function(err) {
        if (err) {
          throw err;
        }
        done();
      });
    });
  });

  /**
   * Display a listing of the resource.
   * GET /users
   *
   * @return Response
   */
  it('should not return any documents. Let document know he/she is unauthorised', function(done) {
    request
      .get(resourceApiUrl)
      .accept('application/json')
      .end(function(err, res) {
        _expect(res.status).to.be(401);
        _expect(res.body.error).to.a('string');
        done();
      });
  });

  /**
   * Store a newly created resource in storage.
   * POST /users/login
   *
   * @return Response
   */
  it('should login the user and return API authorisation token.', function(done) {
    request
      .post('http://localhost:3000/api/users/login')
      .send(user)
      .accept('application/json')
      .end(function(err, res) {
        if (res.ok) {
          var data = res.body.user;
          _expect(res.body.message).to.be.a('string');
          _expect(data.username).to.be(user.username);
          _expect(data._id).to.be.a('string');

          // check if the token has been issued out
          _expect(data.token).to.be.a('string');
          _expect(data.token.length).to.be.greaterThan(100);
          authToken = data.token;
        } else {
          throw err;
        }
        done();
      });
  });

  /**
   * Display a listing of the resource.
   * GET /users
   *
   * @return Response
   */
  it('should return all documents and if none, an empty array', function(done) {
    request
      .get(resourceApiUrl)
      .set('X-Access-Token', authToken)
      .accept('application/json')
      .end(function(err, res) {
        if (res.ok) {
          // if no documents were found
          if (res.body.documents.length === 0) {
            _expect(res.body.documents).to.be.ok();
            _expect(res.body.documents).to.be.an(Array);
            _expect(res.body.message).to.be.a('string');
          } else {
            _expect(res.body.documents[0]._id).to.be.a('string');
            _expect(res.body.documents[0].content).to.be.a('string');
          }
          done();
        } else {
          throw err;
        }
      });
  });

  /**
   * Store a newly created resource in storage.
   * POST /users (sign up)
   *
   * @return Response
   */
  it('should store a newly created resource in storage.', function(done) {
    request
      .post(resourceApiUrl)
      .set('X-Access-Token', authToken)
      .send(newDoc)
      .accept('application/json')
      .end(function(err, res) {
        if (res.ok) {
          var data = res.body.document;
          _expect(data.content).to.be(newDoc.content);
          _expect(data._id).to.be.a('string');
          doc = data;
        } else {
          throw err;
        }
        done();
      });
  });

  /**
   * Show the form for creating the specified resource.
   * GET /users/{id}/create
   *
   * @param  int  $id
   * @return Response
   */
  it('should show the form for creating a new resource', function() {
    // Not used in an angular application
    // since the angular application will route to the edit form
    // and display it
    _expect(true).to.be(true);
  });

  /**
   * Display the specified resource.
   * GET /users/{id}
   *
   * @param  int  $id
   * @return Response
   */
  it('should display the specified resource.', function(done) {
    request
      .get(resourceApiUrl + '/' + doc._id)
      .set('X-Access-Token', authToken)
      .accept('application/json')
      .end(function(err, res) {
        if (res.ok) {
          _expect(res.body.document._id).to.be.a('string');
          _expect(res.body.document.content).to.be(newDoc.content);
        } else {
          throw err;
        }
        done();
      });
  });

  /**
   * Show the form for editing the specified resource.
   * GET /users/{id}/edit
   *
   * @param  int  $id
   * @return Response
   */
  it('should show the form for editing the specified resource', function() {
    // Not used in an angular application
    // since the angular application will route to the edit form
    // and display it
    _expect(true).to.be(true);
  });

  /**
   * Update the specified resource in storage.
   * PUT /users/{id}
   *
   * @param  int  $id
   * @return Response
   */
  it('should update the specified resource in storage.', function(done) {
    request
      .put(resourceApiUrl + '/' + doc._id)
      .set('X-Access-Token', authToken)
      .send({
        content: faker.lorem.sentence()
      })
      .accept('application/json')
      .end(function(err, res) {
        if (res.ok) {
          _expect(res.body.message).to.be.a('string');
          _expect(res.body.message).to.match(/(updated)/);
        } else {
          throw err;
        }
        done();
      });
  });

  /**
   * Remove the specified resource from storage.
   * DELETE /users/{id}
   *
   * @param  int  $id
   * @return Response
   */
  it('should remove the specified resource from storage.', function(done) {
    request
      .del(resourceApiUrl + '/' + doc._id)
      .set('X-Access-Token', authToken)
      .accept('application/json')
      .end(function(err, res) {
        if (res.ok) {
          _expect(res.body.message).to.be.a('string');
          _expect(res.body.message).to.match(/(deleted)/g);
        } else {
          throw err;
        }
        done();
      });
  });

  /**
   * Logout the user
   * GET /users/logout
   *
   * @return Response
   */
  it('should log out the user', function(done) {
    request
      .get('http://localhost:3000/api/users/logout')
      .set('X-Access-Token', authToken)
      .accept('application/json')
      .end(function(err, res) {
        if (res.ok) {
          _expect(res.body.message).to.be.a('string');
          authToken = null;
        } else {
          throw err;
        }
        done();
      });
  });

  /**
   * Display the specified resource.
   * GET /users/{id}
   *
   * @param  int  $id
   * @return Response
   */
  it('should NOT display the specified resource to unauthorised user', function(done) {
    request
      .get(resourceApiUrl + '/' + doc._id)
      .set('X-Access-Token', authToken)
      .accept('application/json')
      .end(function(err, res) {
        _expect(res.status).to.be(401);
        _expect(res.body.error).to.a('string');
        done();
      });
  });

  /**
   * Update the specified resource in storage.
   * PUT /users/{id}
   *
   * @param  int  $id
   * @return Response
   */
  it('should NOT update the specified resource to unauthorised user.', function(done) {
    request
      .put(resourceApiUrl + '/' + doc._id)
      .set('X-Access-Token', authToken)
      .send({
        content: faker.lorem.sentence()
      })
      .accept('application/json')
      .end(function(err, res) {
        _expect(res.status).to.be(401);
        _expect(res.body.error).to.a('string');
        done();
      });
  });

  /**
   * Remove the specified resource from storage.
   * DELETE /users/{id}
   *
   * @param  int  $id
   * @return Response
   */
  it('should not remove the specified resource because user is unauthorised.', function(done) {
    request
      .del(resourceApiUrl + '/' + doc._id)
      .set('X-Access-Token', authToken)
      .accept('application/json')
      .end(function(err, res) {
        _expect(res.status).to.be(401);
        _expect(res.body.error).to.a('string');
        done();
      });
  });
});
