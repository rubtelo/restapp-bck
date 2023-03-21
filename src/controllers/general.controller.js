const moment = require("moment-timezone");
const https = require("https");

const json2sql = require("../utils/Json2Sql");
const SqlConnection = require("../utils/SqlConnection");
//const validateToken = require("../utils/validateToken");

const Record = "SysConfig";

exports.getData = async () => {
   const conditions = {
      IsDeleted: false
   };

   const columns = {
      "*": true
   };

   const query = json2sql.createSelectQuery(Record, undefined, columns, conditions, undefined, undefined, undefined);

   try {
      const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
      return queryResult.results;

   } catch (error) {
      console.log("Error al selecionar el registro.");
      console.error(error);
   }
};


// ejecuta consulta callback (return bool)
exports.getDosdata = async () => {
   // llamar conexion mysql
   const mySqlConnect = await SqlConnection.mySqlConnect();

   // construir consulta
   const conditions = {IsDeleted: false };
   const columns = { "*": true };
   const query = json2sql.createSelectQuery(Record, undefined, columns, conditions, undefined, undefined, undefined);

   // ejecutar consulta
   mySqlConnect.query(query.sql, query.values, (error, results) => {
      if (error) throw error;

      results.forEach((element) => {
         //console.log(element);

         if(element.Id == 2){
            variable = element.Option;
         } else {
            variable = element.Option;
            bool = true;
         }
      });

      console.log("variable", variable);
   });

   // finaliza conexion
   mySqlConnect.end();
   return true;
};


// Obtener bitacora
exports.getRecord = async (socialEmployee = undefined) => {
   const dateStart = moment(moment.tz('America/Bogota')).add(-1, 'd').startOf('day').utc().format('YYYY-MM-DD HH:mm:ss');
   const dateEnd = moment.utc(moment.tz('America/Bogota')).format();

   const conditions = {
      SocialNumberEmployee: socialEmployee,
      Timestamp: {
         $between: {
            $min: dateStart,
            $max: dateEnd
        }
      }
   };

   const columns = {
      "*": true
   };

   const sort = undefined;
   const query = json2sql.createSelectQuery(Record, undefined, columns, conditions, sort, undefined, undefined);

   try {
      const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
      if (queryResult.error) {
         throw (queryResult.error);
      }
      return queryResult.result;
  }
  catch (error) {
      console.log("Error al selecionar el registro.");
      console.error(error);
      throw (error);
  }
};

/*
// Registro bitacora
exports.addRecord = async (req, data, token) => {
   const employee = validateToken.decodeToken(token);
   let myIp = "0.0.0.0";
   let agent = req.headers['user-agent'];

   if(req.headers.host == undefined){ req.headers.host = ""; }
   if(data.useragent != undefined && data.useragent != "") { agent = data.useragent; }
   if(data.ip != undefined && data.ip != "") { myIp = data.ip; } else { const agIp = await getIp(); myIp = agIp.ip; }

   const query = json2sql.createInsertQuery(Record, {
      SocialNumberEmployee: employee.socialNumber,
      Event: data.event,
      Module: data.module,
      Platform: req.headers.host,
      Agent: agent,
      Ip: myIp,
      Url: `${req.method} - ${req.originalUrl}`
   });

   try {
      const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
      if (queryResult.error) {
         throw (queryResult.error);
      }
      return true;
   } catch (error) {
      console.log("Error al insertar el registro de bitacora.");
      console.error(error);
      return false;
   }
};


exports.validaEmpleado = async (document) => {
   const conditions = { SocialNumber: document };
   const columns = {
      Id: true,
      SocialNumber: true,
      FirstName: true,
      LastName: true,
      Region: true,
      Position: true,
      IsActive: true
   };
   const query = json2sql.createSelectQuery("Employees", undefined, columns, conditions, undefined, undefined, undefined);

   try {
       const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
       if (queryResult.error) {
          throw (queryResult.error);
       }
       return queryResult.result[0];
   } catch (error) {
       console.log("Error al consultar empleado.");
       console.error(error);
       throw (error);
   }
}


async function getIp() {
   // verifica estados
   const configFile = require("../config-apps.json");
   const url = configFile.getIp;

   return new Promise((resolve) => {
      https.get(url, resp => {
         let data = "";
         resp.on("data", chunk => {
            data += chunk;
         });
   
         resp.on("end", () => {
            resolve(JSON.parse(data));
         });
      });
   });
};
*/

