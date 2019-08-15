const jwt = require('jsonwebtoken');

module.exports = {
    generateToken: () => {
        return jwt.sign({ data: 'foobar' }, 'secret', { expiresIn: '1h' });
    },

    isAuthenticated: (req, res, next) => {
        jwt.verify(req.headers.authorization, 'secret', (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Not Authorized' });
            }
            next();
        })
    }
}