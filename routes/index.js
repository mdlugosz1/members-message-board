var express = require("express");
var router = express.Router();

const user_controller = require("../controllers/userController");
const message_controller = require("../controllers/messageController");

/* GET register page */
router.get("/register", user_controller.user_register_get);

/* POST register page */
router.post("/register", user_controller.user_register_post);

/* GET login page */
router.get("/login", user_controller.user_login_get);

/* POST login page */
router.post("/login", user_controller.user_login_post);

/* Logut */
router.get("/logout", user_controller.user_logout);

/* Account get */
router.get("/account", user_controller.account_get);

/* Account post */
router.post("/account", user_controller.account_post);

/* DELETE message */
router.post("/delete", message_controller.message_delete);

/* POST message */
router.post("/", message_controller.messages_post);

/* GET home page. */
router.get("/", message_controller.messages_get);

module.exports = router;
