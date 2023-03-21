exports.setNulls = async (obj) => {
    const keys = Object.keys(obj);
    for (key of keys) {
        if (obj[key] === "") {
            obj[key] = null;
        }
    }
};

exports.bustNulls = async (obj) => {
    const keys = Object.keys(obj);
    for (key of keys) {
        if (obj[key] === null) {
            obj[key] = "";
        }
    }
};