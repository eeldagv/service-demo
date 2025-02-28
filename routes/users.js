const express = require("express");
const router = express.Router();
const conn = require("../mariadb");
const { body, param, validationResult } = require("express-validator");

// JWT 모듈
const jwt = require("jsonwebtoken");

// .env 모듈
const dotenv = require("dotenv");
dotenv.config();

const validate = (req, res, next) => {
  const err = validationResult(req);

  if (err.isEmpty()) {
    return next();
  } else {
    return res.status(400).json(err.array());
  }
};

// 로그인
router.post(
  "/login",
  [
    body("email")
      .notEmpty()
      .isString()
      .isEmail()
      .withMessage("이메일 확인 필요"),
    body("password").notEmpty().isString().withMessage("비밀번호 확인 필요"),
    validate,
  ],
  (req, res) => {
    const { email, password } = req.body;

    conn.query(
      "SELECT * FROM users WHERE email = ?",
      email,
      function (err, results) {
        if (err) {
          return res.status(400).end();
        }

        loginUser = results[0];

        if (!loginUser) {
          return res.status(401).json({
            message: "존재하지 않는 아이디입니다.",
          });
        }

        if (loginUser.password !== password) {
          console.log(password);
          return res.status(401).json({
            message: "비밀번호가 일치하지 않습니다.",
          });
        }

        // token 발급
        const token = jwt.sign(
          {
            email: loginUser.email,
            name: loginUser.name,
          },
          process.env.PRIVATE_KEY,
          {
            expiresIn: "5m",
            issuer: "it's me",
          }
        );

        res.cookie("token", token, {
          httpOnly: true,
        });

        res.status(201).json({
          message: `${loginUser.name}님, 환영합니다.`,
        });
      }
    );
  }
);

// 회원가입
router.post(
  "/join",
  [
    body("email")
      .notEmpty()
      .isString()
      .isEmail()
      .withMessage("이메일 확인 필요"),
    body("name").notEmpty().isString().withMessage("이름 확인 필요"),
    body("password").notEmpty().isString().withMessage("비밀번호 확인 필요"),
    body("contact").notEmpty().isString().withMessage("연락처 확인 필요"),
    validate,
  ],
  (req, res) => {
    let { email, name, password, contact } = req.body;

    conn.query(
      `INSERT INTO users (email, name, password, contact) VALUES (?, ?, ?, ?)`,
      [email, name, password, contact],
      function (err, results) {
        if (err) {
          return res.status(400).end();
        }

        res.status(201).json(results);
      }
    );
  }
);

// 회원 개별 조회
router
  .route("/users")
  .get(
    [
      body("email")
        .notEmpty()
        .isString()
        .isEmail()
        .withMessage("이메일 확인 필요"),
      validate,
    ],
    (req, res) => {
      let { email } = req.body;

      conn.query(
        "SELECT * FROM `users` WHERE email = ?",
        email,
        function (err, results) {
          if (err) {
            return res.status(400).end();
          }
          res.status(200).json(results);
        }
      );
    }
  )
  // 회원 탈퇴
  .delete(
    [
      body("email")
        .notEmpty()
        .isString()
        .isEmail()
        .withMessage("이메일 확인 필요"),
      validate,
    ],
    (req, res) => {
      let { email } = req.body;

      conn.query(
        "DELETE FROM users WHERE email = ?",
        email,
        function (err, results) {
          if (err) {
            return res.status(400).end();
          }

          if (results.affectedRows == 0) {
            return res.status(404).end();
          } else {
            res.status(200).json(results);
          }
        }
      );
    }
  );

module.exports = router;
