const json2sql = require("../utils/Json2Sql");
const SqlConnection = require("../utils/SqlConnection");

const { getConfig } = require("../controllers/general.controller");

// List Menu
exports.getMenus = async (filters) => {
    const columns = {
        "M.IdMenu": true,
        "M.Name": true,
        "M.Price": true,
        "M.IdCategory": true,
        "M.IsActive": true,
        "M.Observations": true,
        "C.Category": true
    };

    let conditions = { "M.IsDeleted": false };

    if(Object.keys(filters).length > 0){
        for (const key in filters) {
            const addFil = {
                [`M.${key}`]: filters[key]     
            };

            conditions = {...conditions, ...addFil};
        }
    }

    const join = {
        "C" : {
            $innerJoin: {
                $table: "MenuCategory",
                $on: { 'M.IdCategory': { $eq: '~~C.IdCategory' } }
            }
        }
    };

    const sort = {"M.IdMenu": false};

    const query = json2sql.createSelectQuery("Menus", join, columns, conditions, sort, undefined, undefined);
    query.sql = query.sql.replace("`Menus`", "`Menus` AS `M`");

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return {
            status: 200,
            success: true,
            message: "Menus listed successfully.",
            data: queryResult.results
        };

    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error listing resource."
        };
    }
};


// Create menu
exports.create = async (info, user) => {
    try {
        info.IdUser = user.userId;

        if (info.idCategory == undefined || info.idCategory.trim() == ""){ info.idCategory = 0; }
        if (info.price == undefined || info.price.trim() == ""){ info.price = 0; }
        if (info.observations == undefined || info.observations.trim() == ""){ info.observations = ""; }

        const menuOk = await insertMenu(info);

        return {
            status: 200,
            success: true,
            message: "Menu created successfully.",
            data: menuOk.insertId
        };
 
    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error creating resource."
        };
    }
};


// Edit menu
exports.edit = async (info) => {
    try {
        let data = {
            idCategory: info.idCategory,
            name: info.name,
            price: info.price,
            observations: info.observations
        };

        if (info.status == 1){ data.IsActive = true; }
        if (info.status == 2){ data.IsActive = false; }
        if (info.status == 3){ data.IsActive = false; data.IsDeleted = true; }

        const menuOk = await updateMenu(info.id, data);

        return {
            status: 200,
            success: true,
            message: "Menu edited successfully."
        };
 
    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error in resource editing."
        };
    }
};


// Active menu
exports.activeMenu = async (info) => {
    try {
        const menuOk = await updateMenu(info.id, {isActive: info.isActive});
        return {
            status: 200,
            success: true,
            message: "Menu checked successfully."
        };
 
    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error in resource editing."
        };
    }
};


// Create menu details
exports.createContent = async (info, user) => {
    try {
        info = {...info, IdUser: user.userId};
        const contentOk = await insertMenuDetails(info);

        return {
            status: 200,
            success: true,
            message: "Menu details created successfully.",
            data: contentOk.affectedRows
        };
 
    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error creating resource."
        };
    }
};


// Add Menu Details
exports.addMenuDetails = async (info, user) => {
    const columns = {
        "M.Id": true,
        "M.IdMenu": true,
        "M.Observations": true,
        "T.IdTag": true,
        "T.Tag": true
    };

    let conditions = {
        "M.IdMenu": idMenu,
        "M.IsActive": true,
        "M.IsDeleted": false
    };

    const join = {
        "T" : {
            $innerJoin: {
                $table: "MenuTags",
                $on: { 'M.IdTag': { $eq: '~~T.IdTag' } }
            }
        }
    };

    const query = json2sql.createSelectQuery("MenuDetails", join, columns, conditions, undefined, undefined, undefined);
    query.sql = query.sql.replace("`MenuDetails`", "`MenuDetails` AS `M`");

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return {
            status: 200,
            success: true,
            message: "Menus Content listed successfully.",
            data: queryResult.results
        };
    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error listing resource."
        };
    }
};


// List Menu Details
exports.getMenuDetails = async (idMenu = 0) => {
    const columns = {
        "M.Id": true,
        "M.IdMenu": true,
        "M.Observations": true,
        "T.IdTag": true,
        "T.Tag": true
    };

    let conditions = {
        "M.IdMenu": idMenu,
        "M.IsActive": true,
        "M.IsDeleted": false,
        "T.IsDeleted": false,
    };

    const join = {
        "T" : {
            $innerJoin: {
                $table: "MenuTags",
                $on: { 'M.IdTag': { $eq: '~~T.IdTag' } }
            }
        }
    };

    const query = json2sql.createSelectQuery("MenuDetails", join, columns, conditions, undefined, undefined, undefined);
    query.sql = query.sql.replace("`MenuDetails`", "`MenuDetails` AS `M`");

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return {
            status: 200,
            success: true,
            message: "Menus Content listed successfully.",
            data: queryResult.results
        };
    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error listing resource."
        };
    }
};


// Delete Menu Details
exports.delMenuDetails = async (id) => {
    const fields = { isActive: false, isDeleted: true };
    const del = await updateContent(id, fields);

    return { status: 200, success: true, message: `correctly deleted id: ${id}`};
};


// List tag
exports.getTag = async (user, vMobile = false) => {
    const columns = { "*": true };
    let conditions = { isActive: true, isDeleted: false };
    if(vMobile) { conditions = {...conditions, viewMobile: true }; }
    const sort = {"Tag": true};

    const query = json2sql.createSelectQuery("MenuTags", undefined, columns, conditions, sort, undefined, undefined);

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return {
            status: 200,
            success: true,
            message: "Tag listed successfully.",
            data: queryResult.results
        };

    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error listing resource."
        };
    }
};


// Create tag
exports.createTag = async (tag, user) => {
    try {
        const query = json2sql.createInsertQuery("MenuTags", {tag:tag});        
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);

        return {
            status: 200,
            success: true,
            message: "Tag created successfully.",
            data: queryResult.results.insertId
        };
 
    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error creating resource."
        };
    }
};


// Delete Tags
exports.deleteTag = async (id, user) => {
    const fields = { isActive: false, isDeleted: true };
    const del = await updateTag(id, fields);
    return { status: 200, success: true, message: `correctly deleted id: ${id}`};
};


// New Menu
async function insertMenu(data){
    try {
        const query = json2sql.createInsertQuery("Menus", data);        

        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }
};


// Edit content
async function updateMenu(id, setChanges) {
    const columns = setChanges;
    const conditions = { IdMenu: id };

    const query = json2sql.createUpdateQuery("Menus", columns, conditions);
    try {
        const success = await SqlConnection.executeQuery(query.sql, query.values);
        return success.affectedRows;

    } catch (error) {
        console.log('Error in query execution to update menu content in db');
        throw(error);
    }
};


// New Menu Contents
async function insertMenuDetails(data){
    try {
        const query = json2sql.createInsertQuery("MenuDetails", data);        

        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }
};


// Edit content
async function updateContent(id, setChanges) {
    const columns = setChanges;
    const conditions = { Id: id };

    const query = json2sql.createUpdateQuery("MenuDetails", columns, conditions);

    try {
        const success = await SqlConnection.executeQuery(query.sql, query.values);
        return success.affectedRows;

    } catch (error) {
        console.log('Error in query execution to update menu content in db');
        throw(error);
    }
};


// Delete tag
async function updateTag(id, setChanges) {
    const query = json2sql.createUpdateQuery("MenuTags", setChanges, { IdTag: id });
    try {
        const success = await SqlConnection.executeQuery(query.sql, query.values);
        return success.affectedRows;

    } catch (error) {
        console.log('Error in query execution to update tag in db');
        throw(error);
    }
};


//// Mobile Data ////

// List Menu Index
exports.getMenuIndex = async (user, filters) => {
    const columns = {
        "R.IdRestaurant": true,
        "R.Name": "Restaurant",
        "C.IdCategory": true,
        "C.Category": true,
        "M.IdMenu": true,
        "M.Name": true,
        "M.Observations": true,
        "M.Price": true,
        "URLP": "Picture", 
        "0": "Score"
    };

    let conditions = {
        "R.OpenNow": true,
        "R.IsActive": true, "R.IsDeleted": false,
        "M.IsActive": true, "M.IsDeleted": false,
        "C.IsActive": true, "C.IsDeleted": false
    };

    let join = {
        "M" : {
            $innerJoin: {
                $table: "Menus",
                $on: { 'R.IdRestaurant': { $eq: '~~M.IdRestaurant' } }
            }
        },
        "C" : {
            $innerJoin: {
                $table: "MenuCategory",
                $on: { 'M.IdCategory': { $eq: '~~C.IdCategory' } }
            }
        }
    };

    // check Tag
    if(filters.tag != undefined){
        join = {...join, ...{
            "D" : {
                $innerJoin: {
                    $table: "MenuDetails",
                    $on: { 'M.IdMenu': { $eq: '~~D.IdMenu' } }
                }
            }
        }};

        filters["D.IsActive"] = true;
        filters["D.IdTag"] = filters.tag;

        delete filters.tag;
    }

    // add filters
    if(Object.keys(filters).length > 0){
        for (const key in filters) {
            const addFil = {
                [key]: filters[key]
            };

            conditions = {...conditions, ...addFil};
        }
    }

    //const sort = {"M.IdMenu": false};
    const sort = undefined;

    const query = json2sql.createSelectQuery("Restaurants", join, columns, conditions, sort, undefined, undefined);
    query.sql = query.sql.replace("`Restaurants`", "`Restaurants` AS `R`");
    query.sql = query.sql.replace("`0`", "'0'");
    query.sql = query.sql.replace("`URLP`", "(SELECT `P`.`Url` FROM MenuPictures AS `P` WHERE `P`.`IdMenu` = `M`.`IdMenu` AND `P`.`IsActive` = 1 AND `P`.`IsDeleted` = 0 ORDER BY IdPicture DESC LIMIT 1)");
    query.sql = query.sql += " GROUP BY M.IdMenu;";

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return {
            status: 200,
            success: true,
            message: "Menus Index listed successfully.",
            data: queryResult.results
        };

    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error listing resource."
        };
    }
};


// List Menu Favorites
exports.getMenuFavorites = async (user, filters) => {
    const columns = {
        "R.IdRestaurant": true,
        "R.Name": "Restaurant",
        "C.IdCategory": true,
        "C.Category": true,
        "M.IdMenu": true,
        "M.Name": true,
        "M.Observations": true,
        "M.Price": true,
        "URLP": "Picture", 
    };

    const conditions = {
        "M.IsDeleted": false,
        "R.IsActive": true, "R.IsDeleted": false,
        "C.IsActive": true, "C.IsDeleted": false,
        "M.IdMenu": {
            $in: JSON.parse(filters)
        }
    };

    let join = {
        "M" : {
            $innerJoin: {
                $table: "Menus",
                $on: { 'R.IdRestaurant': { $eq: '~~M.IdRestaurant' } }
            }
        },
        "C" : {
            $innerJoin: {
                $table: "MenuCategory",
                $on: { 'M.IdCategory': { $eq: '~~C.IdCategory' } }
            }
        }
    };

    const query = json2sql.createSelectQuery("Restaurants", join, columns, conditions, undefined, undefined, undefined);
    query.sql = query.sql.replace("`Restaurants`", "`Restaurants` AS `R`");
    query.sql = query.sql.replace("`URLP`", "(SELECT `P`.`Url` FROM MenuPictures AS `P` WHERE `P`.`IdMenu` = `M`.`IdMenu` AND `P`.`IsActive` = 1 AND `P`.`IsDeleted` = 0 ORDER BY IdPicture DESC LIMIT 1)");
    query.sql = query.sql += " GROUP BY M.IdMenu ORDER BY `M`.`IdMenu` DESC;";

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return {
            status: 200,
            success: true,
            message: "Menus Index listed successfully.",
            data: queryResult.results
        };

    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error listing resource."
        };
    }
};


// Get Menu Detail by Id
exports.getMenuDetailById = async (idMenu = 0, allStatus = false) => {
    try {
        const result = await menuDetailById(idMenu, allStatus);
        const options = await getDataConfig(["serviceOptions", "paymentMethod"]);

        const menu = {
            idMenu: 0,
            idCategory: 0,
            category: "",
            name: "",
            price: "",
            observations: "",
            isActive: 0,
            stats: {
                service: 5.0,
                food: 5.0,
                environment: 5.0
            },
            tags: [],
            pictures: [],
            restaurant: {
                idRestaurant: "",
                name: "",
                address: "",
                idRegion: "",
                region: "",
                zone: "",
                paymentMethod: [],
                location: {
                    lat: 0,
                    lon: 0
                },
                serviceOptions: [],
                profilePicture: ""
            }
        };

        if(result.length > 0) {
            let i = 1;
            for (const item of result) {
                if(i == 1) {
                    menu.idMenu = item.IdMenu;
                    menu.idCategory = item.IdCategory;
                    menu.category = item.Category;
                    menu.name = item.Mname.trim();
                    menu.price = item.Price.trim();
                    menu.observations = item.MObservations.trim();
                    menu.isActive = item.MIsActive;

                    menu.restaurant.idRestaurant = item.IdRestaurant;
                    menu.restaurant.name = item.Name;
                    menu.restaurant.address = item.Address;
                    menu.restaurant.idRegion = item.IdRegion;
                    menu.restaurant.region = item.City;
                    menu.restaurant.zone = item.Zone;

                    const gps = item.LocationMap.split(",");
                    menu.restaurant.location.lat = parseFloat(gps[0]);
                    menu.restaurant.location.lon = parseFloat(gps[1]);

                    menu.restaurant.profilePicture = item.RPUrl;

                    const digitosPM = item.PaymentMethod.toString().split('').map(digito => parseInt(digito, 10));
                    const digitosSO = item.ServiceOptions.toString().split('').map(digito => parseInt(digito, 10));

                    const paymentMethod = JSON.parse(options["paymentMethod"].Value);
                    const serviceOptions = JSON.parse(options["serviceOptions"].Value);

                    for(const dig of digitosPM){ menu.restaurant.paymentMethod.push(paymentMethod[dig]); }
                    for(const dig of digitosSO){ menu.restaurant.serviceOptions.push(serviceOptions[dig]); }
                }

                // Tags
                const validateTag = menu.tags.find(keyTag => keyTag.idTag === item.IdTag);
                if(!validateTag) {
                    menu.tags.push({
                        idTag: item.IdTag,
                        tag: item.Tag,
                        observations: item.DObservations.trim()
                    });
                }

                // Pictures
                if(item.PUrl != null){
                    const validatePicture = menu.pictures.includes(item.PUrl);
                    if(!validatePicture) {
                        menu.pictures.push(item.PUrl);
                    }
                }

                i++;
            }
        }

        return {
            status: 200,
            success: true,
            message: "Menu Detail listed successfully.",
            data: menu
        };
    } catch (error) {
        return {
            status: 400,
            success: false,
            message: error
        };
    }
};


// List Menu Suggest
exports.getMenuSuggest = async (user, filters) => {
    const columns = {
        "R.IdRestaurant": true,
        "R.Name": "Restaurant",
        "C.IdCategory": true,
        "C.Category": true,
        "M.IdMenu": true,
        "M.Name": true,
        "M.Observations": true,
        "M.Price": true,
        "URLP": "Picture", 
        "0": "Score"
    };

    let conditions = {
        "R.OpenNow": true,
        "R.IsActive": true, "R.IsDeleted": false,
        "M.IsActive": true, "M.IsDeleted": false,
        "C.IsActive": true, "C.IsDeleted": false
    };

    let join = {
        "M" : {
            $innerJoin: {
                $table: "Menus",
                $on: { 'R.IdRestaurant': { $eq: '~~M.IdRestaurant' } }
            }
        },
        "C" : {
            $innerJoin: {
                $table: "MenuCategory",
                $on: { 'M.IdCategory': { $eq: '~~C.IdCategory' } }
            }
        }
    };

    // check Tag
    if(filters.tag != undefined){
        join = {...join, ...{
            "D" : {
                $innerJoin: {
                    $table: "MenuDetails",
                    $on: { 'M.IdMenu': { $eq: '~~D.IdMenu' } }
                }
            }
        }};

        filters["D.IsActive"] = true;
        filters["D.IdTag"] = filters.tag;

        delete filters.tag;
    }

    // add filters
    if(Object.keys(filters).length > 0){
        for (const key in filters) {
            const addFil = {
                [key]: filters[key]
            };

            conditions = {...conditions, ...addFil};
        }
    }

    const sort = undefined;

    const query = json2sql.createSelectQuery("Restaurants", join, columns, conditions, sort, undefined, undefined);
    query.sql = query.sql.replace("`Restaurants`", "`Restaurants` AS `R`");
    query.sql = query.sql.replace("`0`", "'0'");
    query.sql = query.sql.replace("`URLP`", "(SELECT `P`.`Url` FROM MenuPictures AS `P` WHERE `P`.`IdMenu` = `M`.`IdMenu` AND `P`.`IsActive` = 1 AND `P`.`IsDeleted` = 0 ORDER BY IdPicture DESC LIMIT 1)");
    query.sql = query.sql += " GROUP BY M.IdMenu LIMIT ? ;";

    query.values.push(...[10]);

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return {
            status: 200,
            success: true,
            message: "Menus Index listed successfully.",
            data: queryResult.results
        };

    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error listing resource."
        };
    }
};


// Get Restaurant by Id
exports.getRestaurantById = async (idRestaurant = 0) => {
    try {
        const result = await restaurantById(idRestaurant);
        const options = await getDataConfig(["serviceOptions", "paymentMethod"]);

        const restaurant = {
            idRestaurant: 0,
            name: "",
            description: "",
            address: "",
            idRegion: "",
            region: "",
            zone: "",
            schedule: "",
            openNow: true,
            paymentMethod: [],
            location: {
                lat: 0,
                lon: 0
            },
            serviceOptions: [],
            profilePicture: "",
            pictures: [],
            comments: [
                {
                    date: "",
                    message: "",
                    stats: 0
                }
            ],
            restMenus: []
        };

        if(result.length > 0) {
            let i = 1;

            const comments = await getCommentsRestaurantById(idRestaurant);
            const restMenus = await getMenusRestaurantById(idRestaurant);

            for (const item of result) {
                if(i == 1) {
                    restaurant.idRestaurant = item.IdRestaurant;
                    restaurant.name = item.Name.trim();
                    restaurant.address = item.Address.trim();
                    restaurant.idRegion = item.IdRegion;
                    restaurant.region = item.City;
                    restaurant.zone = item.Zone;
                    restaurant.schedule = item.Schedule;
                    restaurant.openNow = item.OpenNow;
                    restaurant.profilePicture =  item.Url;

                    const gps = item.LocationMap.split(",");
                    restaurant.location.lat = parseFloat(gps[0]);
                    restaurant.location.lon = parseFloat(gps[1]);

                    restaurant.serviceOptions = [];
                    restaurant.paymentMethod = [];

                    const digitosPM = item.PaymentMethod.toString().split('').map(digito => parseInt(digito, 10));
                    const digitosSO = item.ServiceOptions.toString().split('').map(digito => parseInt(digito, 10));

                    const paymentMethod = JSON.parse(options["paymentMethod"].Value);
                    const serviceOptions = JSON.parse(options["serviceOptions"].Value);

                    for(const dig of digitosPM){ restaurant.paymentMethod.push(paymentMethod[dig]); }
                    for(const dig of digitosSO){ restaurant.serviceOptions.push(serviceOptions[dig]); }
                }

                restaurant.pictures.push(item.Url);
                i++;
            }

            if(comments.length > 0) {
                for (const item of comments) {
                    const cdate = item.Timestamp.split(" ");

                    restaurant.comments.push({
                        date: cdate[0],
                        message: item.Comment,
                        stats: 5.0
                    });
                }
            }

            if(restMenus.length > 0) {
                for (const item of restMenus) {
                    restaurant.restMenus.push({
                        idMenu: item.IdMenu,
                        idRestaurant: item.IdRestaurant,
                        restaurant: item.Restaurant,
                        idCategory: item.IdCategory,
                        category: item.Category,
                        observations: item.Observations,
                        name: item.Name,
                        price: item.Price,
                        score: item.Score,
                        picture: item.Url,
                        isActive: item.IsActive
                    });
                }
            }

        }

        return {
            status: 200,
            success: true,
            message: "Restaurant Data listed successfully.",
            data: restaurant
        };
    } catch (error) {
        return {
            status: 400,
            success: false,
            message: error
        };
    }
};


// List Search Delegate Menu List
exports.getSDMenu = async (user, filters) => {
    const columns = {
        "R.IdRestaurant": true,
        "R.Name": "Restaurant",
        "C.IdCategory": true,
        "C.Category": true,
        "M.IdMenu": true,
        "M.Name": true,
        "M.Observations": true,
        "M.Price": true,
        "URLP": "Picture", 
        "0": "Score"
    };

    let conditions = {
        "R.OpenNow": true,
        "R.IsActive": true, "R.IsDeleted": false,
        "M.IsActive": true, "M.IsDeleted": false,
        "C.IsActive": true, "C.IsDeleted": false
    };

    let join = {
        "M" : {
            $innerJoin: {
                $table: "Menus",
                $on: { 'R.IdRestaurant': { $eq: '~~M.IdRestaurant' } }
            }
        },
        "C" : {
            $innerJoin: {
                $table: "MenuCategory",
                $on: { 'M.IdCategory': { $eq: '~~C.IdCategory' } }
            }
        }
    };

    // add filters
    if(Object.keys(filters).length > 0){
        for (const key in filters) {
            const addFil = {
                [key]: filters[key]
            };

            conditions = {...conditions, ...addFil};
        }
    }

    const query = json2sql.createSelectQuery("Restaurants", join, columns, conditions, undefined, undefined, undefined);
    query.sql = query.sql.replace("`Restaurants`", "`Restaurants` AS `R`");
    query.sql = query.sql.replace("`0`", '"0"');
    query.sql = query.sql.replace("`URLP`", "(SELECT `P`.`Url` FROM MenuPictures AS `P` WHERE `P`.`IdMenu` = `M`.`IdMenu` AND `P`.`IsActive` = 1 AND `P`.`IsDeleted` = 0 ORDER BY IdPicture DESC LIMIT 1)");
    query.sql = query.sql.replace('`Name` = ?', '`Name` like "%' + filters["M.Name"] + '%"');
    query.sql = query.sql += " GROUP BY M.IdMenu;";

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return {
            status: 200,
            success: true,
            message: "Menus Index listed successfully.",
            data: queryResult.results
        };

    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error listing resource."
        };
    }
};


// Query Menu Detail
async function menuDetailById(idMenu = 0, allStatus = false) {
    const columns = {
        "M.IdMenu": true,
        "M.IdCategory": true,
        "C.Category": true,
        "M.Name": "Mname",
        "M.Price": true,
        "M.Observations": "MObservations",
        "M.IsActive": "MIsActive",
        "D.Id": "IdDetail",
        "T.IdTag": true,
        "T.Tag": true,
        "D.Observations": "DObservations",
        "P.Url": "PUrl",
        "R.*": true,
        "RP.Url": "RPUrl",
        "RE.Country": true,
        "RE.State": true,
        "RE.City": true
    };

    let conditions = {
        "M.IdMenu": idMenu,
        "M.IsActive": true, "M.IsDeleted": false,
        "R.IsActive": true, "R.IsDeleted": false,
        "C.IsActive": true, "C.IsDeleted": false,
        "D.IsActive": true, "D.IsDeleted": false,
        "T.IsActive": true, "T.IsDeleted": false,
    };

    if(allStatus == true){
        delete conditions["M.IsActive"];
    }

    const join = {
        "R" : {
            $innerJoin: {
                $table: "Restaurants",
                $on: { 'M.IdRestaurant': { $eq: '~~R.IdRestaurant' } }
            }
        },
        "C" : {
            $innerJoin: {
                $table: "MenuCategory",
                $on: { 'M.IdCategory': { $eq: '~~C.IdCategory' } }
            }
        },
        "D" : {
            $innerJoin: {
                $table: "MenuDetails",
                $on: { 'M.IdMenu': { $eq: '~~D.IdMenu' } }
            }
        },
        "RE" : {
            $innerJoin: {
                $table: "SysRegion",
                $on: { 'R.IdRegion': { $eq: '~~RE.IdRegion' } }
            }
        },
        "T" : {
            $leftJoin: {
                $table: "MenuTags",
                $on: { 'D.IdTag': { $eq: '~~T.IdTag' } }
            }
        },
        "P" : {
            $leftJoin: {
                $table: "MenuPictures",
                $on: { 'M.IdMenu': { $eq: '~~P.IdMenu' } }
            }
        },
        "RP" : {
            $leftJoin: {
                $table: "RestaurantPictures",
                $on: { 'M.IdRestaurant': { $eq: '~~RP.IdRestaurant' } }
            }
        }
    };

    const query = json2sql.createSelectQuery("Menus", join, columns, conditions, undefined, undefined, undefined);
    query.sql = query.sql.replace("`Menus`", "`Menus` AS `M`");
    query.sql = query.sql += " AND (`P`.`IsActive` = ? OR `P`.`IsActive` IS ?) AND (`P`.`IsDeleted` = ? OR `P`.`IsDeleted` IS ?)";
    query.sql = query.sql += " AND (`RP`.`IsActive` = ? OR `RP`.`IsActive` IS ?) AND (`RP`.`IsDeleted` = ? OR `RP`.`IsDeleted` IS ?);";

    query.values.push(...[true, null, false, null, true, null, false, null]);

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        return `error listing resource >> ${error}`;
    }
};


// Query Restaurant
async function restaurantById(idRestaurant = 0) {
    const columns = {
        "R.*": true,
        "P.Url": true,
        "RE.Country": true,
        "RE.State": true,
        "RE.City": true
    };

    let conditions = {
        "R.IdRestaurant": idRestaurant,
        "R.IsActive": true, "R.IsDeleted": false
    };

    const join = {
        "RE" : {
            $innerJoin: {
                $table: "SysRegion",
                $on: { 'R.IdRegion': { $eq: '~~RE.IdRegion' } }
            }
        },
        "P" : {
            $leftJoin: {
                $table: "RestaurantPictures",
                $on: { 'R.IdRestaurant': { $eq: '~~P.IdRestaurant' } }
            }
        }
    };

    const query = json2sql.createSelectQuery("Restaurants", join, columns, conditions, undefined, undefined, undefined);
    query.sql = query.sql.replace("`Restaurants`", "`Restaurants` AS `R`");
    query.sql = query.sql += " AND (`P`.`IsActive` = ? OR `P`.`IsActive` IS ?) AND (`P`.`IsDeleted` = ? OR `P`.`IsDeleted` IS ?)";

    query.values.push(...[true, null, false, null]);

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        return `error listing resource >> ${error}`;
    }
};


// Query Restaurant Comments
async function getCommentsRestaurantById(idRestaurant = 0) {
    const columns = {
        "*": true
    };

    const conditions = {
        "IdRestaurant": idRestaurant,
        "IsActive": true, "IsDeleted": false
    };

    const join = undefined;

    const query = json2sql.createSelectQuery("RestaurantComments", join, columns, conditions, undefined, undefined, undefined);

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        return `error listing resource >> ${error}`;
    }
};


// List Menu by Restaurant
async function getMenusRestaurantById(idRestaurant = 0) {
    const columns = {
        "R.IdRestaurant": true,
        "R.Name": "Restaurant",
        "C.IdCategory": true,
        "C.Category": true,
        "M.IdMenu": true,
        "M.Name": true,
        "M.Observations": true,
        "M.Price": true,
        "M.IsActive": true,
        "P.Url": true, 
        "0": "Score"
    };

    let conditions = {
        "R.IdRestaurant": idRestaurant,
        "M.IsDeleted": false,
        "R.IsActive": true, "R.IsDeleted": false,
        "C.IsActive": true, "C.IsDeleted": false
    };

    const join = {
        "M" : {
            $innerJoin: {
                $table: "Menus",
                $on: { 'R.IdRestaurant': { $eq: '~~M.IdRestaurant' } }
            }
        },
        "C" : {
            $innerJoin: {
                $table: "MenuCategory",
                $on: { 'M.IdCategory': { $eq: '~~C.IdCategory' } }
            }
        },
        "P" : {
            $leftJoin: {
                $table: "MenuPictures",
                $on: { 'P.IdMenu': { $eq: '~~P.IdMenu' } }
            }
        }
    };

    const query = json2sql.createSelectQuery("Restaurants", join, columns, conditions, undefined, undefined, undefined);
    query.sql = query.sql.replace("`Restaurants`", "`Restaurants` AS `R`");
    query.sql = query.sql.replace("`0`", "'0'");
    query.sql = query.sql += " AND (`P`.`IsActive` = ? OR `P`.`IsActive` IS ?) AND (`P`.`IsDeleted` = ? OR `P`.`IsDeleted` IS ?) GROUP BY M.IdMenu ORDER BY `M`.`IsActive` DESC;";

    query.values.push(...[true, null, false, null]);

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        return {
            status: 400,
            success: false,
            message: "error listing resource."
        };
    }
};


// Get Data Config
async function getDataConfig(data = []) {
    try {
        if(data.length < 1) return [];

        const options = [];
        const config = await getConfig();

        for (const item of data) {
            options[item] = config.find((opt) => opt.Option == item);
        }

        return options;

    } catch (error) {
        return `error listing resource >> ${error}`;
    }
};


//return { status: 200, success: false, message: "message", data: [] };
// if (!user) throw new Error();   --> retorno a try catch
// timeNow
// const now = moment(moment.tz(timeZone)).unix();
