'use strict';
module.exports = function(request, apiUrl) {
  function Documents() {}
  Documents.prototype = {
    // Get all documents, and list them
    all: function(cb) {
      request
        .get([apiUrl, '/documents'].join(''))
        .end(function(err, res) {
          if (err) {
            cb(err, null);
          }
          if (res.status === 200) {
            cb(null, res.body);
          } else {
            cb(res.body.error, null);
          }
        });
    },

    // FIND and SELECT document
    // Selecting a document, persisted in session
    // Provide the document Id to be persisted
    find: function(documentId, cb) {
      request
        .get([apiUrl, '/documents/', documentId].join(''))
        .end(function(err, res) {
          if (err) {
            cb(err, null);
          }
          if (res.status === 200) {
            cb(null, res.body);
          } else {
            cb(res.body.error, null);
          }
        });
    },

    // Create a new document
    add: function(content, cb) {
      request
        .post([apiUrl, '/documents'].join(''))
        .send({
          content: content
        })
        .end(function(err, res) {
          if (err) {
            cb(err, null);
          }
          if (res.status === 200) {
            cb(null, res.body);
          } else {
            cb(res.body.error, null);
          }
        });
    },

    // Update the document in session or doc with DocumentId provided
    update: function(content, extend, documentId, cb) {
      request
        .put([apiUrl, '/documents/', documentId].join(''))
        .send({
          content: content
        })
        .end(function(err, res) {
          if (err) {
            cb(err, null);
          }
          if (res.status === 200) {
            cb(null, res.body);
          } else {
            cb(res.body.error, null);
          }
        });
    },

    // Delete document in session or the [one] with the id provided
    delete: function(documentId, cb) {
      request
        .delete([apiUrl, '/documents/', documentId].join(''))
        .end(function(err, res) {
          if (err) {
            cb(err, null);
          }
          if (res.status === 200) {
            cb(null, res.body);
          } else {
            cb(res.body.error, null);
          }
        });
    },

    // Searching for a document
    search: function(term, cb) {
      request
        .get([apiUrl, '/documents/search/', term].join(''))
        .end(function(err, res) {
          if (err) {
            cb(err, null);
          }
          if (res.status === 200) {
            cb(null, res.body);
          } else {
            cb(res.body.error, null);
          }
        });
    }
  };

  return new Documents();
};