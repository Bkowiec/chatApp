const GameScore = require('../models/gameScore');
const config = require('../config/database');

module.exports = (router) => {
    router.get('/', (req, res) => {

        GameScore.find({}, (err, gameScores) => {

            if (err) {
                res.json({
                    success: false,
                    message: err
                });
            } else {

                if (!gameScores) {
                    res.json({
                        success: false,
                        message: 'No game scores found.'
                    });
                } else {
                    res.json({
                        success: true,
                        gameScores: gameScores
                    });
                }
            }
        }).sort({
            'score': -1
        });
    });
    router.post('/', (req, res) => {
        if (!req.body.createdBy) {
            res.json({
                success: false,
                message: 'Game scorer is required.'
            });
        } else {

            const gameScore = new GameScore({
                carType: req.body.carType,
                score: req.body.score,
                createdBy: req.body.createdBy
            });

            gameScore.save((err) => {
                if (err) {
                    if (err.errors) {
                        if (err.errors.title) {
                            res.json({
                                success: false,
                                message: err.errors.title.message
                            });
                        } else {
                            if (err.errors.body) {
                                res.json({
                                    success: false,
                                    message: err.errors.body.message
                                });
                            } else {
                                res.json({
                                    success: false,
                                    message: err
                                });
                            }
                        }
                    } else {
                        res.json({
                            success: false,
                            message: err
                        });
                    }
                } else {
                    res.json({
                        success: true,
                        message: 'Game score saved!'
                    });
                }
            });
        }
    });
    return router;
};