const moment = require("moment-timezone");
const jwt = require('jsonwebtoken');
const CryptoJS = require("crypto-js");

const json2sql = require("../utils/Json2Sql");
const SqlConnection = require("../utils/SqlConnection");
const configFile = require("../config-apps.json");

const Users = "Users";

// Generate token
exports.getToken = async (type, info) => {
    let message = "access granted";

    // config file
    const configApp = configFile.default;
    const timeZone = info.timezone == undefined ? configApp.timeZone : info.timeZone;

    const typeToken = configFile.typesTokens.find( ttype => ttype.type == type );
    const privateKey = typeToken.secret;

    // data Token
    const expire = moment(moment.tz(timeZone)).add(typeToken.life, "s").unix();
    if(type == "public"){ info = null; message = "token generated success"; }

    const userApp = await getUserApp(info);

    if (userApp === false) return {
        status: 401,
        success: false,
        message: "invalid data",
        token: {}
    };

    const data = {
        userApp,
        timeZone: timeZone,
        iss: "appX-auth",
        exp: expire
    };

    // generate Token
    const token = jwt.sign(data, privateKey, { algorithm: 'HS256' });
    return {
        status: 200 ,
        success: true,
        message,
        token
    };
};


// Check token - return decode
exports.checkToken = async (info, token, decode = true) => {
    // config file
    const configApp = configFile.default;
    const timeZone = info.timezone === undefined ? configApp.timeZone : info.timezone;

    // type token
    const type = info.type === undefined ? "public" : info.type;
    const typeToken = configFile.typesTokens.find( ttype => ttype.type == type );

    if(typeToken === undefined) return res.status(401).json({
        success: false,
        message: 'error checking type token.'
    });

    try {
        // check Token
        let decoded = jwt.verify(token, typeToken.secret);
        if(decode === true) {
            // Decrypt
            const id = decoded.userApp.user.id;
            const bytes = CryptoJS.AES.decrypt(id, configFile.cryptoKey);
            decoded.userApp.user.id = bytes.toString(CryptoJS.enc.Utf8);
            decoded.userApp.timeZone = decoded.timeZone;

            return { status: 200, success: true, message: "token ok!", token: decoded.userApp };
        } else {
            return { status: 200, success: true, message: "token ok!", token: {} };    
        }

    } catch(err) {
        return res.status(401).json({ 
            success: false,
            message: "error checking token",
            description: `${err.name} - ${err.message}`
        });
    }
};


// Construct User Data
async function getUserApp(data){
    let userApp = {};
    let userBd = [];

    if(data === null) {
        userApp = {
            user: {
                id: CryptoJS.AES.encrypt("myId", configFile.cryptoKey).toString(),
                firstName: "firstName",
                lastName: "lastName",
                region: configFile.default.city,
                phoneNumber: "310XXXXXXX",
                email: "xxxxx@correo.com",
                alias: "Customer"
            },
            rol: 5,
            extraInfo: {
                environment: "app",
                userType: "customer"
            }
        };

    } else {
        // auth user - client
        userBd = await getUserBd(data);

        // auth customer
        if(data.customer != undefined && data.customer == true){ userBd = await getCustomerBd(data); }

        if (userBd.length === 0) return false;

        userBd = userBd[0];

        const prePass = CryptoJS.AES.decrypt(userBd.MyPassword.toString(), configFile.cryptoKey);
        const MyPass = prePass.toString(CryptoJS.enc.Utf8);
        if (data.password.trim() != MyPass.trim()) return false;

        // Encrypt id user
        const usType = ["NA", "admin", "client", "customer"];
        const acLevel = ["NA", "all", "web", "app"];

        userApp = {
            user: {
                id: CryptoJS.AES.encrypt(userBd.IdUser.toString(), configFile.cryptoKey).toString(),
                firstName: userBd.FirstName,
                lastName: userBd.LastName,
                region: userBd.IdRegion,
                phoneNumber: userBd.PhoneNumber,
                email: userBd.Email,
                alias: userBd.Alias
            },
            rol: userBd.IdRole,
            extraInfo: {
                environment: acLevel[userBd.AccessLevel],
                userType: usType[userBd.UserType]
            }
        };
    }
    return userApp;
};


// obtener datos de usuario - authenticate
async function getUserBd(data){
    const columns = {
        "U.*": true,
        "R.IdRole": true,
        "P.MyPassword": true
    };

    const conditions = {
        "U.IdUser": data.username,
        //"U.IsActive": true,
        //"U.IsDeleted": false,
        //"R.IsActive": true,
        //"R.IsDeleted": false,
        //"P.IsActive": true,
        //"P.IsDeleted": false,
        "(U.IsActive = 1 AND U.IsDeleted = 0)": undefined,
        "(R.IsActive = 1 AND R.IsDeleted = 0)": undefined,
        "(P.IsActive = 1 AND P.IsDeleted = 0)": undefined
    };

    const join = {
        "R" : {
            $innerJoin: {
                $table: "UsersRole",
                $on: { 'U.IdUser': { $eq: '~~R.IdUser' } }
            }
        },
        "P" : {
            $innerJoin: {
                $table: "UsersPassword",
                $on: { 'U.IdUser': { $eq: '~~P.IdUser' } }
            }
        }
    };

    const query = json2sql.createSelectQuery(Users, join, columns, conditions, undefined, undefined, undefined);
    query.sql = query.sql.replace("`Users`", "`Users` AS `U`");
    query.sql = query.sql.replace(/`/g, '');
    query.sql = query.sql.replace(/  /g, ' ');

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;
    } catch (error) {
        console.log("Error al selecionar el registro.");
        console.error(error);
    }
};


// obtener datos de customer - authenticate
async function getCustomerBd(data){
// login con passport
    const columns = {
        "U.*": true,
        "R.IdRole": true,
        "P.MyPassword": true
    };

    const conditions = {
        "U.IdUser": data.username,
        //"U.IsActive": true,
        //"U.IsDeleted": false,
        //"R.IsActive": true,
        //"R.IsDeleted": false,
        //"P.IsActive": true,
        //"P.IsDeleted": false,
        "(U.IsActive = 1 AND U.IsDeleted = 0)": undefined,
        "(R.IsActive = 1 AND R.IsDeleted = 0)": undefined,
        "(P.IsActive = 1 AND P.IsDeleted = 0)": undefined
    };

    const join = {
        "R" : {
            $innerJoin: {
                $table: "UsersRole",
                $on: { 'U.IdUser': { $eq: '~~R.IdUser' } }
            }
        },
        "P" : {
            $innerJoin: {
                $table: "UsersPassword",
                $on: { 'U.IdUser': { $eq: '~~P.IdUser' } }
            }
        }
    };

    const query = json2sql.createSelectQuery("Client", join, columns, conditions, undefined, undefined, undefined);
    query.sql = query.sql.replace("`Client`", "`Client` AS `U`");
    query.sql = query.sql.replace(/`/g, '');
    query.sql = query.sql.replace(/  /g, ' ');

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;
    } catch (error) {
        console.log("Error al selecionar el registro.");
        console.error(error);
    }
};