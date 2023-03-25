const json2sql = require("../utils/Json2Sql");
const SqlConnection = require("../utils/SqlConnection");


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
exports.getTag = async (user) => {
    const columns = { idTag: true, tag: true };
    const conditions = { isActive: true, isDeleted: false };

    const query = json2sql.createSelectQuery("MenuTags", undefined, columns, conditions, undefined, undefined, undefined);

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


//return { status: 200, success: false, message: "message" };
// if (!user) throw new Error();   --> retorno a try catch
// timeNow
// const now = moment(moment.tz(timeZone)).unix();
