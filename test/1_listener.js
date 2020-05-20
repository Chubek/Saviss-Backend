process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const Listener = require("../Models/Listener");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../test-server");
const expect = require("chai").expect;
const jwt = require("jsonwebtoken");

chai.use(chaiHttp);
describe("Listener", function () {
  let id;
  let token;
  before(async function () {
    await Listener.deleteMany({});
  });

  describe("Register/Login", function () {
    it("it should register a listener", function (done) {
      chai
        .request(server)
        .post("/listener/register")
        .send({
          userName: "Test",
          email: "mamadklashinkov@gmail.com",
          categories: ["11", "1123"],
          number: "+917428730894",
          test: "true",
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("listenerDoc");
          done();
        });
    });
    it("it should login the listener", function (done) {
      chai
        .request(server)
        .post("/listener/auth")
        .send({
          password: "0000",
          number: "+917428730894",
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("listenerDoc");
          expect(res.body).to.have.property("token");
          done();
        });
    });
    it("it should request the OTP", function (done) {
      chai
        .request(server)
        .put("/listener/request/otp")
        .send({
          number: "+917428730894",
          test: "true",
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("otpUpdated");
          expect(res.body).to.have.property("otpSent");
          expect(res.body.otpUpdated).to.equal(true);
          expect(res.body.otpSent).to.equal(true);
          done();
        });
    });
  });
  describe("Gets", function () {
    before(async function () {
      const doc = await Listener.findOne({ cell: "917428730894" });
      id = doc._id;
      token = jwt.sign({ id: doc._id }, process.env.JWT_SECRET);
    });

    it("it should get multiple listeners", function (done) {
      chai
        .request(server)
        .get("/listener/get/all")
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("listenerDocs");
          expect(res.body.listenerDocs).to.be.an("array");
          expect(res.body.listenerDocs).not.be.empty;
          done();
        });
    });
    it("it should get a single listener", function (done) {
      chai
        .request(server)
        .get(`/listener/get/single/${id}`)
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("listenerDoc");
          expect(res.body.listenerDoc).to.be.an("object");
          done();
        });
    });
    it("it should get a single username", function (done) {
      chai
        .request(server)
        .get(`/listener/get/username`)
        .set("x-auth-token-listener", token)
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("userName");
          expect(res.body.userName).to.be.a("String");
          done();
        });
    });
  });
  describe("Set status", function () {
    it("it should set listener status", function (done) {
      chai
        .request(server)
        .put("/listener/set/status")
        .set("x-auth-token-listener", token)
        .send({ status: "true" })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("isOnline");
          expect(res.body.isOnline).to.equal(true);
          done();
        });
    });
  });
  describe("401 test", function () {
    it("it should get a 401 for username", function (done) {
      chai
        .request(server)
        .post("/listener/register")
        .send({
          userName: "Test",
          email: "madsdsdmadklashinkov@gmail.com",
          categories: ["1sds1", "1123"],
          number: "+918555254822",
          test: "true",
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(401);
          expect(res.body).to.have.property("isSame");
          expect(res.body.isSame).to.equal("userName");
          done();
        });
    });
    it("it should get a 401 for email", function (done) {
      chai
        .request(server)
        .post("/listener/register")
        .send({
          userName: "Tefsfst",
          email: "mamadklashinkov@gmail.com",
          categories: ["1sds1", "1123"],
          number: "+918555254822",
          test: "true",
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(401);
          expect(res.body).to.have.property("isSame");
          expect(res.body.isSame).to.equal("email");
          done();
        });
    });
    it("it should get a 401 for number", function (done) {
      chai
        .request(server)
        .post("/listener/register")
        .send({
          userName: "Tefst",
          email: "mamadklashinkhhov@gmail.com",
          categories: ["1sds1", "1123"],
          number: "+917428730894",
          test: "true",
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(401);
          expect(res.body).to.have.property("isSame");
          expect(res.body.isSame).to.equal("number");
          done();
        });
    });
  });
  describe("404s", function () {
    before(async function () {
      await Listener.deleteMany({});
    });
    it("it should get 404 for getting all the listeners", function (done) {
      chai
        .request(server)
        .get("/listener/get/all")
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(404);
          expect(res.body).to.have.property("noListenerFound");
          expect(res.body.noListenerFound).to.be.true;
          done();
        });
    });
    it("it should get 404 for a single listener", function (done) {
      chai
        .request(server)
        .get(`/listener/get/single/${id}`)
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(404);
          expect(res.body).to.have.property("noListenerDoc");
          expect(res.body.noListenerDoc).to.be.true;
          done();
        });
    });
    it("it should get a single username", function (done) {
      chai
        .request(server)
        .get(`/listener/get/username`)
        .set("x-auth-token-listener", token)
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(404);
          expect(res.body).to.have.property("noListenerDoc");
          expect(res.body.noListenerDoc).to.be.true;
          done();
        });
    });
  });
});
