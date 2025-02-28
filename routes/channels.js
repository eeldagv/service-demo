// express 모듈 세팅
const express = require("express");
const router = express.Router();
const conn = require("../mariadb");
const { body, param, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const err = validationResult(req);

  if (err.isEmpty()) {
    return next();
  } else {
    return res.status(400).json(err.array());
  }
};

router
  .route("/")
  .get(
    [body("userId").notEmpty().isInt().withMessage("숫자 입력 필요"), validate],
    (req, res) => {
      const { userId } = req.body;

      conn.query(
        "SELECT * FROM `channels` WHERE user_id = ?",
        userId,
        function (err, results) {
          if (err) {
            return res.status(400).end();
          }
          if (results.length) {
            res.status(200).json(results);
          } else {
            res.status(404).json({
              message: "요청하신 채널 정보를 찾을 수 없습니다.",
            });
          }
        }
      );
    }
  )
  .post(
    [
      body("userId").notEmpty().isInt().withMessage("숫자 입력 필요"),
      body("name").notEmpty().isString().withMessage("문자 입력 필요"),
      validate,
    ],
    (req, res) => {
      const { name, userId } = req.body;
      let values = [name, userId];

      conn.query(
        "INSERT INTO `channels` (name, user_id) VALUES (?, ?)",
        values,
        function (err, results) {
          if (err) {
            return res.status(400).end();
          }
          res.status(201).json(results);
        }
      );
    }
  );

router
  .route("/:id")
  .get(
    [param("id").notEmpty().withMessage("채널id 필요"), validate],
    (req, res) => {
      let { id } = req.params;
      id = parseInt(id);

      conn.query(
        "SELECT * FROM `channels` WHERE id = ?",
        id,
        function (err, results) {
          if (err) {
            return res.status(400).end();
          }
          if (results.length) {
            res.status(200).json(results);
          } else {
            res.status(404).json({
              message: "요청하신 채널 정보를 찾을 수 없습니다.",
            });
          }
        }
      );
    }
  )
  .put(
    [
      param("id").notEmpty().withMessage("채널id 필요"),
      body("name").notEmpty().isString().withMessage("채널명 오류"),
      validate,
    ],
    (req, res) => {
      let { id } = req.params;
      id = parseInt(id);
      let { name } = req.body;
      let values = [name, id];

      conn.query(
        "UPDATE `channels` SET name = ? WHERE id = ?",
        values,
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
  )
  .delete(
    [param("id").notEmpty().withMessage("채널id 필요"), validate],
    (req, res) => {
      let { id } = req.params;
      id = parseInt(id);

      conn.query(
        "DELETE FROM `channels` WHERE id = ?",
        id,
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
