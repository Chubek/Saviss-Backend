process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const Listener = require("../Models/Listener");
const Pairing = require("../Models/Pairings");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../test-server");
const expect = require("chai").expect;
const jwt = require("jsonwebtoken");
const helpers = require("../Services/Helpers");
chai.use(chaiHttp);

describe("Session", function () {
  let idOne, tokenOne, idTwo, tokenTwo;
  let sessionId;
  let numberToken;
  before(function () {
    Pairing.deleteMany({});
    Listener.deleteMany({});
    const listenerOne = new Listener({
      "approvalStatus.approved": true,
      emailVerified: true,
      cellActivated: true,
      email: "test1@test.com",
      categories: ["TestCat1", "TestCat2"],
      userName: "Test1",
      "status.online": true,
    });
    const listenerTwo = new Listener({
      "approvalStatus.approved": true,
      emailVerified: true,
      cellActivated: true,
      email: "test2@test.com",
      categories: ["TestCat3", "TestCat2"],
      userName: "Test2",
      "status.currentEngagedSession": "None",
      "status.online": false,
    });

    listenerOne.save().then((listenerDocOne) => {
      listenerTwo.save().then((listenerDocTwo) => {
        idOne = listenerDocOne._id;
        idTwo = listenerDocTwo._id;
        tokenOne = jwt.sign({ id: idOne }, process.env.JWT_SECRET);
        tokenTwo = jwt.sign({ id: idTwo }, process.env.JWT_SECRET);
      });
    });
  });
  describe("Pairing Start", function () {
    it("it should pair between a listener and a seeker", function (done) {
      chai
        .request(server)
        .post("/session/pairup/randomly")
        .send({ seekerNumber: "+989385130604" })
        .end((err, res) => {
          if (err) done(err);
          console.log(res.body);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("presentedListeners");
          expect(res.body).to.have.property("sessionDoc");
          expect(res.body.presentedListeners).to.be.an("array");
          expect(res.body.presentedListeners).not.be.empty;
          expect(res.body.sessionDoc).to.be.an("object");
          expect(res.body.presentedListeners).to.include(idOne.toString());
          done();
        });
    });
    it("it should pair between a listener and a seeker based on categories", function (done) {
      chai
        .request(server)
        .post("/session/pairup/category")
        .send({ seekerNumber: "+989385130604", categories: ["TestCat2"] })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("presentedListeners");
          expect(res.body).to.have.property("sessionDoc");
          expect(res.body.presentedListeners).to.be.an("array");
          expect(res.body.presentedListeners).not.be.empty;
          expect(res.body.sessionDoc).to.be.an("object");
          expect(res.body.presentedListeners).to.include(idOne.toString());
          done();
        });
    });
  });
  describe("Pairing accept/disconnect", function () {
    before(async function () {
      const session = await Pairing.find({});
      sessionId = session[0]._id;
    });
    it("it should accept the session", function (done) {
      chai
        .request(server)
        .put(`/session/accept/${sessionId}`)
        .set("x-auth-token-listener", tokenOne)
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("tokens");
          expect(res.body).to.have.property("nicks");
          expect(res.body).to.have.property("listenerId");
          expect(res.body).to.have.property("sessionDoc");
          expect(res.body.tokens).to.be.an("object");
          expect(res.body.nicks).to.be.an("object");
          expect(res.body.listenerId).to.equal(idOne.toString());
          expect(res.body.sessionDoc._id).to.equal(sessionId.toString());
          expect(res.body.sessionDoc.listenerId).to.equal(idOne.toString());
          done();
        });
    });
    it("it should end the session", function (done) {
      chai
        .request(server)
        .put(`/session/disconnect/${sessionId}`)
        .set("x-auth-token-listener", tokenOne)
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("disconnected");
          expect(res.body.disconnected).to.be.an("boolean");
          expect(res.body.disconnected).to.be.true;
          done();
        });
    });
  });
  describe("Reports", function () {
    before(function (done) {
      numberToken = jwt.sign(
        { number: helpers.popNumber("+989385130604") },
        process.env.JWT_SECRET
      );
      done();
    });
    it("it should report the listener", function (done) {
      chai
        .request(server)
        .put(`/session/report/by/seeker/${sessionId}`)
        .set("x-auth-token-seeker", numberToken)
        .send({ listenerId: idOne })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("reported");
          expect(res.body.reported).to.be.an("boolean");
          expect(res.body.reported).to.be.true;
          done();
        });
    });
    it("it should report the seeker", function (done) {
      chai
        .request(server)
        .put(`/session/report/by/listener/${sessionId}`)
        .set("x-auth-token-listener", tokenOne)
        .send({ seekerNumber: "+989385130604" })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("reported");
          expect(res.body.reported).to.be.an("boolean");
          expect(res.body.reported).to.be.true;
          done();
        });
    });
  });
  describe("Gets", function () {
    it("it should get all the sessions", function (done) {
      chai
        .request(server)
        .get(`/session/get/all`)
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("sessionDocs");
          expect(res.body.sessionDocs).to.be.an("array");
          expect(res.body.sessionDocs).not.be.empty;
          done();
        });
    });
    it("it should get all the sessions", function (done) {
      chai
        .request(server)
        .get(`/session/get/single/${sessionId}`)
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("sessionDoc");
          expect(res.body.sessionDoc).to.be.an("object");
          done();
        });
    });
    describe("Gets 404", function () {
      before(async function () {
        await Pairing.deleteMany({});
      });
      it("it should get all the sessions 404", function (done) {
        chai
          .request(server)
          .get(`/session/get/all`)
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(404);
            expect(res.body).to.have.property("noSessionFound");
            expect(res.body.noSessionFound).to.be.true;
            done();
          });
      });
      it("it should get a single session 404", function (done) {
        chai
          .request(server)
          .get(`/session/get/single/${sessionId}`)
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(404);
            expect(res.body).to.have.property("noSessionFound");
            expect(res.body.noSessionFound).to.be.true;
            done();
          });
      });
    });
  });
});
