const express = require("express");
const asyncHandler = require("../middlewares/asyncHandler");
const managerGuard = require("../middlewares/managerGuard");
const keyController = require("../controllers/keyController");

const router = express.Router();

router.use(managerGuard);

router.post("/", asyncHandler(keyController.createKey));
router.delete("/:id", asyncHandler(keyController.deleteKey));

module.exports = router;
