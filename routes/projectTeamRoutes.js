const express = require('express');
const router = express.Router();
const teamController = require('../controllers/projectTeamController');

router.get('/', teamController.getTeam);
router.post('/', teamController.addMember);

module.exports = router;