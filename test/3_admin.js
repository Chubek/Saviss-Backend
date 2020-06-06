process.env.NODE_ENV = "test";

const Admin = require("../Models/Admin");
const SuperAdmin = require("../Models/SuperAdmin");
const Listener = require("../Models/Listener");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../test-server");
const expect = require("chai").expect;
const jwt = require("jsonwebtoken");

chai.use(chaiHttp);

let id, token, tokenPk;
let adminId, adminToken, adminTokenPk;
let listenerId;
let banDate;

describe("SuperAdmin", function () {
  before(async function () {
    await Admin.deleteMany({});
    await Listener.deleteMany({});
    await SuperAdmin.deleteMany({});
  });
  describe("Create Super Admin", function () {
    it("it should create a superAdmin", function (done) {
      chai
        .request(server)
        .post("/superAdmin/create")
        .send({
          userName: "To",
          password: "Kill",
          email: "A@mockingbird.com",
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("superAdminCreated");
          expect(res.body.superAdminCreated).to.be.true;
          done();
        });
    });
    it("it should create a superAdmin but throw a 403 because it exists", function (done) {
      chai
        .request(server)
        .post("/superAdmin/create")
        .send({
          userName: "To",
          password: "Kill",
          email: "A@mockingbird.com",
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(403);
          expect(res.body).to.have.property("superAdminExists");
          expect(res.body.superAdminExists).to.be.true;
          done();
        });
    });
  });
  describe("superAdminAuth", function () {
    before(async function () {
      const doc = await SuperAdmin.find({});
      id = doc[0]._id;
      token = jwt.sign({ id: id }, process.env.JWT_SECRET);
      tokenPk = token.split(".")[0];
    });
    it("it should auth superAdmin with username", function (done) {
      chai
        .request(server)
        .post("/superAdmin/auth")
        .send({
          userName: "To",
          password: "Kill",
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("token");
          expect(res.body).to.have.property("superDoc");
          expect(res.body.token.split(".")[0]).to.equal(tokenPk.toString());
          expect(res.body.superDoc._id).to.equal(id.toString());
          done();
        });
    });
    it("it should auth superAdmin with email", function (done) {
      chai
        .request(server)
        .post("/superAdmin/auth")
        .send({
          email: "A@mockingbird.com",
          password: "Kill",
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("token");
          expect(res.body).to.have.property("superDoc");
          expect(res.body.token.split(".")[0]).to.equal(tokenPk.toString());
          expect(res.body.superDoc._id).to.equal(id.toString());
          done();
        });
    });
    it("it should auth superAdmin with both username email", function (done) {
      chai
        .request(server)
        .post("/superAdmin/auth")
        .send({
          email: "A@mockingbird.com",
          password: "Kill",
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("token");
          expect(res.body).to.have.property("superDoc");
          expect(res.body.token.split(".")[0]).to.equal(tokenPk.toString());
          expect(res.body.superDoc._id).to.equal(id.toString());
          done();
        });
    });
  });
  describe("Superadmin Edit/Password Change", function () {
    it("it should edit superadmin info", function (done) {
      chai
        .request(server)
        .put("/superAdmin/edit/info")
        .set("x-auth-token-super", token)
        .send({
          userName: "Hero",
          email: "zero@hero.com",
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("superUpdated");
          expect(res.body.superUpdated).to.be.true;
          done();
        });
    });
    it("it should change superadmin password", function (done) {
      chai
        .request(server)
        .put("/superAdmin/change/password")
        .set("x-auth-token-super", token)
        .send({
          oldPassword: "Kill",
          newPassword: "Bill",
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("passwordChanged");
          expect(res.body.passwordChanged).to.be.true;
          done();
        });
    });
    it("it should auth superAdmin with new email and password", function (done) {
      chai
        .request(server)
        .post("/superAdmin/auth")
        .send({
          email: "zero@hero.com",
          password: "Bill",
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("token");
          expect(res.body).to.have.property("superDoc");
          expect(res.body.token.split(".")[0]).to.equal(tokenPk.toString());
          expect(res.body.superDoc._id).to.equal(id.toString());
          done();
        });
    });
  });
  describe("Create admin", function () {
    it("it should ceate an admin", function (done) {
      chai
        .request(server)
        .post("/superAdmin/create/admin")
        .set("x-auth-token-super", token)
        .send({
          adminUserName: "Kiram",
          adminEmail: "kiram@gmail.com",
          adminPassword: "T3stP4ssw0rd",
          adminNumber: "09385130604",
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("adminCreated");
          expect(res.body.adminCreated).to.be.true;
          done();
        });
    });
    it("it should get 401 because of adminUserName", function (done) {
      chai
        .request(server)
        .post("/superAdmin/create/admin")
        .set("x-auth-token-super", token)
        .send({
          adminUserName: "Kiram",
          adminEmail: "kiram@gmafil.com",
          adminPassword: "T3stP4ssw0rd",
          adminNumber: "0938513f0604",
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(401);
          expect(res.body).to.have.property("isSame");
          expect(res.body.isSame).to.equal("userName");
          done();
        });
    });
    it("it should get 401 because of adminEmail", function (done) {
      chai
        .request(server)
        .post("/superAdmin/create/admin")
        .set("x-auth-token-super", token)
        .send({
          adminUserName: "Kiraml",
          adminEmail: "kiram@gmail.com",
          adminPassword: "T3stP4ssw0rd",
          adminNumber: "0938513j0604",
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).to.have.status(401);
          expect(res.body).to.have.property("isSame");
          expect(res.body.isSame).to.equal("email");
          done();
        });
    });
    it("it should get 401 because of adminNumber", function (done) {
      chai
        .request(server)
        .post("/superAdmin/create/admin")
        .set("x-auth-token-super", token)
        .send({
          adminUserName: "Kifram",
          adminEmail: "kiram@gmafil.com",
          adminPassword: "T3stP4ssw0rd",
          adminNumber: "09385130604",
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
  describe("Admin routes", function () {
    before(async function () {
      const admin = await Admin.findOne({ userName: "Kiram" });
      adminId = admin._id;
      adminToken = jwt.sign({ id: adminId }, process.env.JWT_SECRET);
      adminTokenPk = adminToken.split(".")[0];
    });
    describe("admin auth", function () {
      it("it should authorize the admin using email", function (done) {
        chai
          .request(server)
          .post("/admin/auth")
          .send({
            email: "kiram@gmail.com",
            password: "T3stP4ssw0rd",
          })
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(200);
            expect(res.body).to.have.property("token");
            expect(res.body).to.have.property("adminDoc");
            expect(res.body.token.split(".")[0]).to.equal(
              adminTokenPk.toString()
            );
            console.log("adminDoc", res.body.adminDoc);
            done();
          });
      });
    });
    describe("admin edit info", function () {
      it("it should edit admin info", function (done) {
        chai
          .request(server)
          .put("/admin/edit/info")
          .set("x-auth-token-admin", adminToken)
          .send({
            userName: "Hero",
            phoneNumber: "+984234247",
            email: "kill@hellobill.com",
          })
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(200);
            expect(res.body).to.have.property("adminEdited");
            expect(res.body.adminEdited).to.be.true;
            done();
          });
      });
      it("it should change admin password", function (done) {
        chai
          .request(server)
          .put("/admin/change/password")
          .set("x-auth-token-admin", adminToken)
          .send({
            oldPassword: "T3stP4ssw0rd",
            newPassword: "Th!rstyBr0th3rs",
          })
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(200);
            expect(res.body).to.have.property("passwordChanged");
            expect(res.body.passwordChanged).to.be.true;
            done();
          });
      });
      after(async function () {
        const admins = await Admin.findOne({ _id: adminId });
      });
      it("it should auth admin with new email and password", function (done) {
        chai
          .request(server)
          .post("/admin/auth")
          .send({
            email: "kill@hellobill.com",
            password: "Th!rstyBr0th3rs",
          })
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(200);
            expect(res.body).to.have.property("token");
            expect(res.body).to.have.property("adminDoc");
            expect(res.body.token.split(".")[0]).to.equal(
              adminTokenPk.toString()
            );
            done();
          });
      });
    });
    describe("approve/ban listener", function () {
      before(function () {
        banDate = new Date();
      });
      before(async function () {
        const listener = new Listener({
          userName: "Hiram",
          email: "hiram@goldman.com",
          "otp.password": "1254",
          "otp.creationHour": new Date()
            .toISOString()
            .substr(11, 5)
            .replace(":", ""),
          cell: "+919655550189 ",
          categories: ["Killing", "Disembowling"],
          emailVerificationCode: "1121",
        });

        const listenerDoc = await listener.save();

        listenerId = listenerDoc._id;
      });
      it("it should approve the listener", function (done) {
        chai
          .request(server)
          .put(`/admin/set/approval/${listenerId}`)
          .set("x-auth-token-admin", adminToken)
          .send({
            approval: "true",
          })
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(200);
            expect(res.body).to.have.property("isApproved");
            expect(res.body.isApproved).to.be.true;
            done();
          });
      });
      it("it should ban the listener", function (done) {
        chai
          .request(server)
          .put(`/admin/ban/${listenerId}`)
          .set("x-auth-token-admin", adminToken)
          .send({
            endDate: banDate,
          })
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(200);
            expect(res.body).to.have.property("listenerBanned");
            expect(res.body.listenerBanned).to.be.true;
            done();
          });
      });
      it("it should reaffirm listener ban and approval", async function () {
        const listenerDoc = await Listener.findOne({ _id: listenerId });
        expect(
          listenerDoc.bannedStatus.expireDate.toISOString().split(".")[0]
        ).to.equal(banDate.toISOString().split(".")[0]);
        expect(listenerDoc.approvalStatus.approved).to.be.true;
      });
    });
    describe("Admin gets", function () {
      it("it should get all the admins", function (done) {
        chai
          .request(server)
          .get("/admin/get/all")
          .set("x-auth-token-super", token)
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(200);
            expect(res.body).to.have.property("adminDocs");
            expect(res.body.adminDocs).to.be.an("array");
            expect(res.body.adminDocs).not.be.empty;
            done();
          });
      });
      it("it should get a single admins", function (done) {
        chai
          .request(server)
          .get(`/admin/get/single/${adminId}`)
          .set("x-auth-token-super", token)
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(200);
            expect(res.body).to.have.property("adminDoc");
            expect(res.body.adminDoc).to.be.an("object");
            expect(res.body.adminDoc).not.be.null;
            done();
          });
      });
    });
    describe("Admin 404s", function () {
      before(async function () {
        await Listener.deleteMany({});
        await Admin.deleteMany({});
        await SuperAdmin.deleteMany({});
      });
      it("it should get 404 for all the admins", function (done) {
        chai
          .request(server)
          .get("/admin/get/all")
          .set("x-auth-token-super", token)
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(404);
            expect(res.body).to.have.property("noAdminFound");
            expect(res.body.noAdminFound).to.be.true;
            done();
          });
      });
      it("it should get 404 for a single admins", function (done) {
        chai
          .request(server)
          .get(`/admin/get/single/${adminId}`)
          .set("x-auth-token-super", token)
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(404);
            expect(res.body).to.have.property("noAdmin");
            expect(res.body.noAdmin).to.be.true;
            done();
          });
      });
    });
  });
});
