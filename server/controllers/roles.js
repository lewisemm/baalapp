'use strict';
var Roles = function() {};
Roles.prototype = {
  all: function(req, res, next) {
    var Roles = req.app.get('models').Roles;
    Roles.find({})
      .exec(function(err, role) {
        if (err) {
          return next(err);
        }
        if (role.length > 0) {
          res.status(200).json({
            roles: role
          });
        } else {
          res.status(200).json({
            roles: role,
            message: 'No roles currently added.'
          });
        }
      });
  },
  find: function(req, res, next) {
    var Roles = req.app.get('models').Roles;
    Roles.findOne({
        title: req.params.title
      })
      // .populate('_creator', '_id username name')
      .exec(function(err, role) {
        if (err) {
          err = new Error('Such a role does not exist.');
          err.status = 404;
          return next(err);
        }
        // is the document public?
        if (role) {
          res.status(200).json({
            role: role
          });
        }
      });
  },
  create: function(req, res, next) {
    if (req.body.title && !(/(\s){1,}/.test(req.body.title.trim()))) {
      var Roles = req.app.get('models').Roles;

      // must be a prefined role that does not exists
      if (!/(viewer|admin|user)/.test(req.body.title)) {
        var err = new Error('Role should be either viewer, user or admin.');
        err.status = 403;
        return next(err);
      }

      Roles.findOne({
        title: req.body.title
      }).exec(function(err, roleFound) {
        if (!err && roleFound) {
          err = new Error('Conflict emerged. The role exists.');
          err.status = 409;
          return next(err);
        }

        // if no role was found but an error occured
        if (err && !roleFound) {
          return next(err);
        }

        var newRole = new Roles();
        newRole.title = req.body.title;
        // save the document
        newRole.save(function(err) {
          if (err) {
            err = new Error('Oops! An error occured. Role not created.');
            err.status = 403;
            return next(err);
          }

          // all went well
          res.status(200).json({
            message: 'Role created successfully.',
            role: newRole
          });
        });
      });
    } else {
      // 416 - Requested Range Not Satisfiable
      var err = new Error('No role title provided. Role should be defined by a single word.');
      err.status = 416;
      return next(err);
    }
  },
  update: function(req, res, next) {
    var Users = req.app.get('models').Users,
      Roles = req.app.get('models').Roles;

    // role title must be viewer, admin, user
    if (!/(viewer|admin|user)/.test(req.body.title)) {
      var err = new Error('Role should be either viewer, user or admin.');
      err.status = 403;
      return next(err);
    }

    // ensure the role exists
    Roles.findOne({
        title: req.body.title
      })
      .exec(function(err, role) {
        if (err) {
          err = new Error('Role exists.');
          return next(err);
        }

        if (role) {
          Users.findByIdAndUpdate(req.decoded._id, {
              role: role._id
            })
            .exec(function(err, user) {
              if (err) {
                err = new Error('An error occured. Did not update your role.');
                return next(err);
              }
              if (user) {
                // show the updated content
                res.status(200).json({
                  user: user,
                  message: 'User\'s role updated successfully.'
                });
              }
            });
        }
      });
  },
  delete: function(req, res, next) {
    var Roles = req.app.get('models').Roles;
    Roles.findOne({
        title: req.params.title
      })
      .exec(function(err, role) {
        if (err) {
          err = new Error('Such a role does not exist.');
          return next(err);
        }

        if (role) {
          role.remove(function(err) {
            if (err) {
              err = new Error('Failed to delete. Please try again.');
              return next(err);
            } else {
              res.status(200).json({
                message: 'Poof! And the role has been deleted.'
              });
            }
          });
        }
      });
  }
};

module.exports = new Roles();
