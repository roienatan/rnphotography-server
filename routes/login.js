var express = require('express');
var router = express.Router();
const constants = require('../constants');
const auth = require('../auth');


router.get('/login/username/:username/password/:password', (req, res) => {
    let username = req.params.username;
    let password = req.params.password;

    if(username === constants.ADMIN.username && password === constants.ADMIN.password){
        return res.status(200).json({ token: auth.generateToken() });
    }
    return res.status(401).json({ message: 'Invalid username or password' });
})


module.exports = router;