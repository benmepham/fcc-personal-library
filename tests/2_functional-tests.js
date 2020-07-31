/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function() {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  // test("#example Test GET /api/books", function(done) {
  //   chai
  //     .request(server)
  //     .get("/api/books")
  //     .end(function(err, res) {
  //       assert.equal(res.status, 200);
  //       assert.isArray(res.body, "response should be an array");
  //       assert.property(
  //         res.body[0],
  //         "commentcount",
  //         "Books in array should contain commentcount"
  //       );
  //       assert.property(
  //         res.body[0],
  //         "title",
  //         "Books in array should contain title"
  //       );
  //       assert.property(
  //         res.body[0],
  //         "_id",
  //         "Books in array should contain _id"
  //       );
  //       done();
  //     });
  // });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite("Routing tests", function() {
    this.timeout(5000);
    let bookID;
    
    suite(
      "POST /api/books with title => create book object/expect book object",
      function() {
        test("Test POST /api/books with title", function(done) {
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "Testerino" })
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.body.title, "Testerino");
              assert.isArray(
                res.body.comments,
                "Comments property is an array"
              );
              assert.property(res.body, "_id", "Book should contain _id");
              bookID = res.body._id;
              done();
            });
        });
        
        test("Test POST /api/books with no title given", function(done) {
          chai
            .request(server)
            .post("/api/books")
            .end(function(err, res) {
              assert.equal(res.status, 200);

              assert.equal(res.text, "Error - missing title");
              done();
            });
          //done();
        });
      }
    );

    suite("GET /api/books => array of books", function() {
      test("Test GET /api/books", function(done) {
        chai
          .request(server)
          .get("/api/books")
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, "response should be an array");
            assert.property(
              res.body[0],
              "commentcount",
              "Books in array should contain commentcount"
            );
            assert.property(
              res.body[0],
              "title",
              "Books in array should contain title"
            );
            assert.property(
              res.body[0],
              "_id",
              "Books in array should contain _id"
            );
            assert.isNumber(
              res.body[0].commentcount,
              "commentcount should be a number"
            );
            done();
          });
        //done();
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function() {
      test("Test GET /api/books/[id] with id not in db", function(done) {
        chai
          .request(server)
          .get("/api/books/507f1f77bcf86cd799439011")
          .end(function(err, res) {
            assert.equal(res.text, "Error - no book exists");
            done();
          });
        //done();
      });

      test("Test GET /api/books/[id] with valid id in db", function(done) {
        chai
          .request(server)
          .get("/api/books/" + bookID)
          .end(function(err, res) {
            assert.property(
              res.body,
              "comments",
              "Book should contain comments"
            );
            assert.isArray(res.body.comments, "Comments should be an array");
            assert.property(res.body, "title", "Book should contain a title");
            assert.property(res.body, "_id", "Book should contain an _id");
            assert.equal(res.body._id, bookID);
            done();
          });
        //done();
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function() {
        test("Test POST /api/books/[id] with comment", function(done) {
          chai
            .request(server)
            .post("/api/books/" + bookID)
            .send({ comment: "test comment" })
            .end(function(err, res) {
              assert.property(
                res.body,
                "comments",
                "Book should contain comments"
              );
              assert.isArray(res.body.comments, "Comments should be an array");
              assert.equal(
                res.body.comments[0],
                "test comment",
                "Should include test comment"
              );
              assert.property(res.body, "title", "Book should contain a title");
              assert.property(res.body, "_id", "Book should contain an _id");
              assert.equal(res.body._id, bookID);
              done();
            });
          //done();
        });
      }
    );

    suite("DELETE /api/books/[id] => Success message", function() {
      test("Remove a book from the collection", function(done) {
        chai
          .request(server)
          .delete("/api/books/" + bookID)
          .end((err, res) => {
            assert.strictEqual(res.text, "delete successful");
            done();
          });
      });
    });
  });
});
