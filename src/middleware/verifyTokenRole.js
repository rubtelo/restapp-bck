const jwt = require('jsonwebtoken');
const moment = require("moment-timezone");
const CryptoJS = require("crypto-js");
const configFile = require("../config-apps.json");

module.exports = (roles) => {
    return function (req, res, next) {
        const token = req.body.token || req.headers.token;
        const info = {
            timezone: req.body.timezone || req.headers.timezone,
            type: req.body.type || req.headers.type
        };

        if(token === undefined || token.trim() == "") return res.status(401).json({
            success: false,
            message: 'No token in request.'
        });

        // config file
        const configApp = configFile.default;
        const timeZone = info.timezone === undefined ? configApp.timeZone : info.timezone;
        // timeNow
        const now = moment(moment.tz(timeZone)).unix();

        // type token
        const type = info.type === undefined ? "public" : info.type;
        const typeToken = configFile.typesTokens.find( ttype => ttype.type == type );

        if(typeToken === undefined) return res.status(401).json({
            success: false,
            message: 'error checking type token.'
        });

        try {
            // check Token
            const decoded = jwt.verify(token, typeToken.secret);
            // check role
            if(roles.includes(decoded.userApp.rol) === false) {
                return res.status(403).json({ 
                    success: false,
                    message: "Not Authorized to access this route"
                });
            }

            const preId = CryptoJS.AES.decrypt(decoded.userApp.user.id.toString(), configFile.cryptoKey);
            const MyId = preId.toString(CryptoJS.enc.Utf8);

            req.body.rol = decoded.userApp.rol;
            req.body.timezone = req.headers.timezone || timeZone;
            req.body.type = req.headers.type;
            req.body.userId = MyId;
            next();

        } catch(err) {
            return res.status(401).json({ 
                success: false,
                message: "error checking token",
                description: `${err.name} - ${err.message}`
            });
        }
    }
};
