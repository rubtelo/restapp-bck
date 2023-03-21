const json2sql = require("../utils/Json2Sql");
const SqlConnection = require("../utils/SqlConnection");
const configFile = require("../config-apps.json");


// Add record
exports.addRecord = async (req, info) => {
    try {
        const myIp = info.ip != undefined ? info.ip : "0.0.0.0";
        const myAgent = info.useragent != undefined ? info.useragent : "data-useragent";

        const query = json2sql.createInsertQuery("SysRecord", {
            IdUser: info.user,
            Event: info.event,
            Module: info.module,
            Platform: req.headers.host,
            Agent: myAgent,
            Ip: myIp,
            Url: `${req.originalUrl}`,
            Action: `${req.method}`,
        });

        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        console.log('error :>> ', error);
        throw error;
    }
};

