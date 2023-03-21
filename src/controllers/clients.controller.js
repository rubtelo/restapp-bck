const moment = require("moment-timezone");
const CryptoJS = require("crypto-js");

const json2sql = require("../utils/Json2Sql");
const SqlConnection = require("../utils/SqlConnection");
const configFile = require("../config-apps.json");


// List clients
exports.getClients = async (filters) => {
    try {
        const clients = await getAllClients(filters);

        return {
            status: 200,
            success: true,
            message: "clients listed correctly.",
            data: clients
        };
 
    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error creating resource."
        };
    }
};


// Create client
exports.create = async (info, user) => {
    try {
        if (info.alias == undefined || info.alias.trim() == ""){ info.alias = ""; }

        const checkUser = await validateUser(info.idUser);
        if(checkUser.length > 0){
            return {
                status: 400,
                success: false,
                message: "user already exists in the database",
                data: 0
            };    
        }

        const clientOk = await insertClient(info);

        return {
            status: 200,
            success: true,
            message: "Client created successfully.",
            data: clientOk.insertId
        };
 
    } catch (error) {
        return {
            status: 403,
            success: false,
            message: "error creating resource."
        };
    }
};


// Create role client
exports.addRole = async (idUser, user) => {
    try {
        const role = {
            "idRole": 3,
            "idUser": idUser,
            "Comment": ""
        };

        const roleOk = await assignRole(role);

        return {
            success: true,
            message: "Client role assigned successfully."
        };
 
    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error creating resource."
        };
    }
};


// Create pass client
exports.addPassword = async (user, pass) => {
    try {
        const myPass = { user, pass };
        const passOk = await assignPassword(myPass);

        return {
            success: true,
            message: "Client password create successfully."
        };
 
    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error creating resource."
        };
    }
};


// New Client
async function insertClient(data){
    try {
        const query = json2sql.createInsertQuery("Users", data);        

        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }
};


// Role to assign
async function assignRole(data){
    try {
        const query = json2sql.createInsertQuery("UsersRole", data);        

        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }
};


// validate user
async function validateUser(user){
    const columns = {
        "*": true
    };

    const conditions = {
        "IdUser": user,
        "IsActive": true,
        "IsDeleted": false
    };

    const query = json2sql.createSelectQuery("Users", undefined, columns, conditions, undefined, undefined, undefined);

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;
    } catch (error) {
        console.log("Error al buscar el registro.");
        console.error(error);
    }
};
    

// assign password
async function assignPassword(data){
    try {
        const info = {
            idUser: data.user,
            myPassword: CryptoJS.AES.encrypt(data.pass, configFile.cryptoKey).toString(),
        };
        const query = json2sql.createInsertQuery("UsersPassword", info);        

        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }
};


// get clients
async function getAllClients(filters){
    const columns = {
        "U.*": true,
        "R.Country": true,
        "R.State": true,
        "R.City": true
    };

    let conditions = {
        "U.IsActive": true,
        "U.IsDeleted": false
    };

    if(filters.id != undefined){ conditions = {...conditions, "U.IdUser": filters.id }; }
    if(filters.active != undefined){ conditions = {...conditions, "U.IsActive": filters.active }; }
    if(filters.deleted != undefined){ conditions = {...conditions, "U.IsDeleted": filters.deleted }; }
    if(filters.region != undefined){ conditions = {...conditions, "U.IdRegion": filters.region }; }

    const join = {
        "R" : {
            $innerJoin: {
                $table: "SysRegion",
                $on: { 'U.IdRegion': { $eq: '~~R.IdRegion' } }
            }
        }
    };

    const options = filters.limit != undefined ? { limit: filters.limit } : null;

    const query = json2sql.createSelectQuery("Users", join, columns, conditions, undefined, options, undefined);
    query.sql = query.sql.replace("`Users`", "`Users` AS `U`");

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;
    } catch (error) {
        throw error;
    }
};





//return { status: 200, success: false, message: "message" };
// if (!user) throw new Error();   --> retorno a try catch
// timeNow
// const now = moment(moment.tz(timeZone)).unix();
