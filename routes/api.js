/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function(app) {
  app
    .route("/api/books")
    .get(function(req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(
        MONGODB_CONNECTION_STRING,
        { useUnifiedTopology: true },
        (err, client) => {
          if (err) return console.error(err);
          let db = client.db("personallibrary");
          let collection = db.collection("books");
          collection.find().toArray((err, result) => {
            if (err) return console.error(err);
            if (result.length == 0) return res.send("Error - no books");
            for (let i = 0; i < result.length; i++) {
              result[i].commentcount = result[i].comments.length;
              delete result[i].comments;
            }
            res.json(result);
          });
        }
      );
    })

    .post(function(req, res) {
      const title = req.body.title;
      if (!title) return res.send("Error - missing title");
      MongoClient.connect(
        MONGODB_CONNECTION_STRING,
        { useUnifiedTopology: true },
        (err, client) => {
          if (err) return console.error(err);
          let db = client.db("personallibrary");
          let collection = db.collection("books");
          const book = { title: title, comments: [] };
          collection.findOne({ title: title }, (err, result) => {
            if (err) return console.error(err);
            if (result) return res.send("Error - title exists");
            collection.insertOne(book, (err, docs) => {
              //console.log(docs.ops[0]);
              //console.log(docs);
              res.json(docs.ops[0]);
            });
          });
        }
      );
      //response will contain new book object including atleast _id and title
    })

    .delete(function(req, res) {
      //if successful response will be 'complete delete successful'
      MongoClient.connect(
        MONGODB_CONNECTION_STRING,
        { useUnifiedTopology: true },
        (err, client) => {
          if (err) return console.error(err);
          let db = client.db("personallibrary");
          let collection = db.collection("books");
          collection.deleteMany({});
          res.send("complete delete successful");
        }
      );
    });

  app
    .route("/api/books/:id")
    .get(function(req, res) {
      const bookid = req.params.id;
      let id;
      try {
        id = new ObjectId(bookid);
      } catch (err) {
        return res.send("Error - invalid ID");
      }
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(
        MONGODB_CONNECTION_STRING,
        { useUnifiedTopology: true },
        (err, client) => {
          if (err) return console.error(err);
          let db = client.db("personallibrary");
          let collection = db.collection("books");
          collection.find({ _id: id }).toArray(function(err, result) {
            if (err) return console.error(err);
            if (result.length == 0) {
              res.send("Error - no book exists");
            } else {
              res.json(result[0]);
            }
          });
        }
      );
    })

    .post(function(req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;
      //json res format same as .get
      let id;
      try {
        id = new ObjectId(bookid);
      } catch (err) {
        return res.send("Error - invalid ID");
      }
      if (!comment) return res.send("Error - missing comment");
      MongoClient.connect(
        MONGODB_CONNECTION_STRING,
        { useUnifiedTopology: true },
        (err, client) => {
          if (err) return console.error(err);
          let db = client.db("personallibrary");
          let collection = db.collection("books");
          collection.findOneAndUpdate(
            { _id: id },
            { $push: { comments: comment } },
            { returnOriginal: false },
            function(err, result) {
              if (err) return console.error(err);
              res.json(result.value);
            }
          );
        }
      );
    })

    .delete(function(req, res) {
      const bookid = req.params.id;
      //if successful response will be 'delete successful'
      let id;
      try {
        id = new ObjectId(bookid);
      } catch (err) {
        return res.send("Error - invalid ID");
      }
      MongoClient.connect(
        MONGODB_CONNECTION_STRING,
        { useUnifiedTopology: true },
        (err, client) => {
          if (err) return console.error(err);
          let db = client.db("personallibrary");
          let collection = db.collection("books");
          collection.findOneAndDelete({ _id: id }, function(err, result) {
            if (err) return console.error(err);
            res.send("delete successful");
          });
        }
      );
    });
};
