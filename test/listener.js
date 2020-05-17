process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const Listener = require("../Models/Listener");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../index");
const expect = require("chai").expect;
const jwt = require("jsonwebtoken");

chai.use(chaiHttp);
describe("Listener", function () {
  let id;
  let token;
  before(function (done) {
    Listener.deleteMany({}).then(() => done());
  });

  this.beforeEach(function (done) {
    Listener.findOne({ cell: "917428730894" }).then((doc) => {
      id = doc._id;
      token = jwt.sign({ id: doc._id });
      done();
    });
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
    it("it should get a multiple listeners", function (done) {
      chai
        .request(server)
        .get("/listener/get/all")
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("listenerDocs");
          expect(res.body.listenerDocs).to.be.an("array");
        });
    });
    it("it should get a single listener", function (done) {
      chai
        .request(server)
        .get(`/get/single/${id}`)
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("listenerDocs");
          expect(res.body.listenerDocs).to.be.an("array");
        });
    });
    it("it should get a single username", function (done) {
      chai
        .request(server)
        .get(`/get/single/${id}`)
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("listenerDocs");
          expect(res.body.listenerDocs).to.be.an("array");
        });
    });
  });
});
