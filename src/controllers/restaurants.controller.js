const json2sql = require("../utils/Json2Sql");
const SqlConnection = require("../utils/SqlConnection");
const configFile = require("../config-apps.json");


// Get restaurants
exports.getAllRestaurants = async (filters, user) => {
    try {
        const restaurants = await getRestaurants(filters);

        return {
            status: 200 ,
            success: true,
            message: "Restaurant listed successfully.",
            data: restaurants
        };

    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error creating resource."
        };
    }
};


// Create
exports.create = async (info, user) => {
    try {
        info.IdUser = user.userId;

        if (info.serviceOptions == undefined || info.serviceOptions.trim() == ""){ info.serviceOptions = 1; }
        if (info.profilePicture == undefined || info.profilePicture.trim() == ""){ info.profilePicture = 0; }
        if (info.openNow == undefined || info.openNow == ""){ info.openNow = 1; }

        const restaurantOk = await insertRestaurant(info);

        return {
            status: 200 ,
            success: true,
            message: "Restaurant created successfully.",
            data: restaurantOk.insertId
        };

    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error creating resource."
        };
    }
};


// Create
exports.addExtra = async (info, user) => {
    try {
        info.IdUser = user.userId;
        const restaurantOk = await insertRestaurantExtra(info);

        return {
            status: 200 ,
            success: true,
            message: "Restaurant add info extra successfully.",
            data: restaurantOk.insertId
        };

    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error creating resource."
        };
    }
};


// Edit Restaurant
exports.edit = async (info, user) => {
    try {
        const conditions = { "IdRestaurant": info.idRestaurant };
        delete info.idRestaurant;

        const query = json2sql.createUpdateQuery("Restaurants", info, conditions);
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);

        return {
            status: 200 ,
            success: true,
            message: "Restaurant edited successfully.",
            data: { affectedRows: queryResult.results.affectedRows }
        };

    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error edit resource."
        };
    }
};


// New Restaurant
async function insertRestaurant(data){
    // construct
    const sql = `INSERT INTO Restaurants (IdRestaurant, idClient, idRegion, zone, name, address, paymentMethod, locationMap, schedule, serviceOptions, profilePicture, openNow, IdUser) VALUES ((SELECT CONCAT(${data.idClient.slice(0,4)}, (MAX(R.Id)+1)) FROM Restaurants R), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
    const values = [data.idClient, data.region, data.zone, data.name, data.address, data.paymentMethod, data.locationMap, data.schedule, data.serviceOptions, data.profilePicture, data.openNow, data.IdUser];

    try {
        const queryResult = await SqlConnection.executeQuery(sql, values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }
};


// Restaurant Info
async function insertRestaurantExtra(data){
    try {
        const query = json2sql.createInsertQuery("RestaurantExtra", data);        

        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }    
};


// get restaurants
async function getRestaurants(filters){
    const columns = {
        "R.*": true,
        "G.Country": true,
        "G.State": true,
        "G.City": true
    };

    let conditions = {
        "R.IsActive": true,
        "R.IsDeleted": false
    };

    // COMPLETAR FILTROS
    // FUNCION PARA VALIDAR
    if(filters.idUser != undefined){ conditions = {...conditions, "R.IdClient": filters.idUser }; }
    if(filters.id != undefined){ conditions = {...conditions, "R.IdRestaurant": filters.id }; }
    if(filters.active != undefined){ conditions = {...conditions, "R.IsActive": filters.active }; }
    if(filters.deleted != undefined){ conditions = {...conditions, "R.IsDeleted": filters.deleted }; }
    if(filters.region != undefined){ conditions = {...conditions, "R.IdRegion": filters.region }; }
    if(filters.opeNow != undefined){ conditions = {...conditions, "R.OpenNow": filters.opeNow }; }

    if(filters.allStates != undefined){
        delete conditions["R.IsActive"];
        delete filters.allStates;
    }

    const join = {
        "G" : {
            $innerJoin: {
                $table: "SysRegion",
                $on: { 'R.IdRegion': { $eq: '~~G.IdRegion' } }
            }
        }
    };

    const options = filters.limit != undefined ? { limit: filters.limit } : null;

    const query = json2sql.createSelectQuery("Restaurants", join, columns, conditions, undefined, options, undefined);
    query.sql = query.sql.replace("`Restaurants`", "`Restaurants` AS `R`");

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
