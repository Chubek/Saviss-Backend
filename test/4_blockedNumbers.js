process.env.NODE_ENV = "test";

const BlockedNumbers = require("../Models/BlockedNumbers");
const Admin = require("../Models/Admin");
const Listener = require("../Models/Listener");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../test-server");
const expect = require("chai").expect;
const jwt = require("jsonwebtoken");

chai.use(chaiHttp);

describe("Blocked Numbers", function () {
  let idOne, idTwo, tokenOne, tokenTwo;
  let adminId, adminToken;

  before(async function () {
    await BlockedNumbers.deleteMany({});
    await Admin.deleteMany({});
    await Listener.deleteMany({});

    const admin = new Admin({
      userName: "Heru Kasagi",
      email: "hero@kasagi.com",
      phoneNumber: "09324232",
      password: "lfsdf",
    });

    const adminDoc = await admin.save();
    adminToken = jwt.sign({ id: adminDoc._id }, process.env.JWT_SECRET);
  });
  before(function () {
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

  describe("blockign the number", function () {
    it("it should block the number", function (done) {
      chai
        .request(server)
        .post("/blocked/block")
        .set("x-auth-token-admin", adminToken)
        .send({ number: "+9385130604", reportMessage: "bothering girls" })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body.numberBlocked).to.be.true;
          done();
        });
    });
    it("it should not be able to pair up", function (done) {
      chai
        .request(server)
        .post("/session/pairup/randomly")
        .send({ seekerNumber: "+9385130604" })
        .end((err, res) => {
          if (err) done(err);
          console.log(res.body);
          expect(res).to.have.status(403);
          expect(res.body).to.have.property("numberBlocked");
          expect(res.body.numberBlocked).to.be.true;
          done();
        });
    });
    it("it should unbblock the number", function (done) {
      chai
        .request(server)
        .put("/blocked/unblock")
        .set("x-auth-token-admin", adminToken)
        .send({ number: "+9385130604" })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body.numberUnblocked).to.be.true;
          done();
        });
    });
    it("it should be able to pair up", function (done) {
      chai
        .request(server)
        .post("/session/pairup/randomly")
        .send({ seekerNumber: "+9385130604" })
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
  });
});
