'use strict';
module.exports = function(request, vantage, apiUrl) {
  function User() {}
  User.prototype = {
    login: function(user, cb) {
      request
        .post([apiUrl, '/users/login'].join(''))
        .send(user)
        .end(function(err, res) {
          if (res.ok) {
            cb(null, res.body);
          } else {
            cb(res.body.error, null);
          }
        });
    },
    logout: function(cb) {
      request
        .get([apiUrl, '/users/logout'].join(''))
        .set('X-Access-Token', vantage.authToken)
        .end(function(err, res) {
          if (res.ok) {
            cb(null, res.body);
          } else {
            cb(res.body.error, null);
          }
        });
    },
    session: function(cb) {
      request
        .get([apiUrl, '/users/session'].join(''))
        .set('X-Access-Token', vantage.authToken)
        .end(function(err, res) {
          if (res.ok) {
            cb(null, res.body);
          } else {
            cb(res.body.error, null);
          }
        });
    },
    create: function(user, cb) {
      request
        .post([apiUrl, '/users'].join(''))
        .send(user)
        .end(function(err, res) {
          if (res.ok) {
            cb(null, res.body);
          } else {
            cb(res.body.error, null);
          }
        });
    },
    update: function(userUpdates, cb) {
      request
        .put([apiUrl, '/users'].join(''))
        .set('X-Access-Token', vantage.authToken)
        .send(userUpdates)
        .end(function(err, res) {
          if (res.ok) {
            cb(null, res.body);
          } else {
            cb(res.body.error, null);
          }
        });
    },
    delete: function(userId, cb) {
      request
        .del([apiUrl, '/users'].join(''))
        .set('X-Access-Token', vantage.authToken)
        .send({
          userId: userId
        })
        .end(function(err, res) {
          if (res.ok) {
            cb(null, res.body);
          } else {
            cb(res.body.error, null);
          }
        });
    }
  };
  return new User();
};
