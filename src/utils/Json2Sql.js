const SQLBuilder = require('json-sql-builder2');

const sql = new SQLBuilder('MySQL');

exports.createSelectQuery = (table, joins, columns, conditions, sort, options, group) => {
    const queryObj = {};
    queryObj.$select = {
        $from: table
    };
    if (joins) {
        queryObj.$select.$join = joins;
    }
    if (columns) {
        queryObj.$select.$columns = columns;
    }
    if (conditions) {
        queryObj.$select.$where = conditions;
    }
    if (sort) {
        queryObj.$select.$orderBy = sort;
    }
    if (group) {
        queryObj.$select.$groupBy = group;
    }
    if (options) {
        if (options.limit) {
            queryObj.$select.$limit = options.limit;
        }
        if (options.offset) {
            queryObj.$select.$offset = options.offset;
        }
    }

    try {
        const query = sql.build(queryObj);
        return query;
    }
    catch (error) {
        console.log("Error in creation of select query");
        console.error(error);
        throw (error);
    }
};

exports.createInsertQuery = (table, documents) => {
    const queryObj = {
        $table: table,
        $documents: documents
    };
    try {
        const queryResult = sql.$insert(queryObj);
        return queryResult;
    }
    catch (error) {
        console.log("Error in creation of insert query");
        console.error(error);
        throw (error);
    }
};

exports.createUpdateQuery = (table, values, conditions) => {
    const queryObj = {
        $table: table,
        $set: values,
        $where: conditions
    };
    try {
        const queryResult = sql.$update(queryObj);
        return queryResult;
    }
    catch (error) {
        console.log("Error in creation of update query");
        console.error(error);
        throw (error);
    }
};

exports.createDeleteQuery = (table, conditions) => {
    const queryObj = {
        $from: table,
        $where: conditions
    };
    try {
        const queryResult = sql.$delete(queryObj);
        return queryResult;
    }
    catch (error) {
        console.log("Error in creation of delete query");
        console.error(error);
        throw (error);
    }
};
