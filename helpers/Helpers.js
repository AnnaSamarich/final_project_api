const jwt = require("jsonwebtoken");

module.exports = {
    handler: async (res, code, data) => await res.status(code).json(data),
    authenticatedToken: (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if(token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.SECRET_KEY, (err, sportsman) => {
        if(err) return res.status(403).send(err);
        req.sportsman = sportsman;
        next();
    });

    
},
};