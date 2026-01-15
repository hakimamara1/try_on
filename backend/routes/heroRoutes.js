const express = require('express');
const {
    getHeroes,
    createHero,
    updateHero,
    deleteHero
} = require('../controllers/heroController');

const router = express.Router();

router
    .route('/')
    .get(getHeroes)
    .post(createHero);

router
    .route('/:id')
    .put(updateHero)
    .delete(deleteHero);

module.exports = router;
