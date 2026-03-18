const express = require("express");
const asyncHandler = require("../middlewares/asyncHandler");
const apiKeyAuth = require("../middlewares/apiKeyAuth");
const messageController = require("../controllers/messageController");

const router = express.Router();

router.use(apiKeyAuth);

router.post("/", asyncHandler(messageController.createMessage));
router.get("/", asyncHandler(messageController.listMessages));
router.delete("/:id", asyncHandler(messageController.deleteMessage));

module.exports = router;
