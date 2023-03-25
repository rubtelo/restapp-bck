const { Router } = require("express");
const router = Router();

const restaurantsController = require("../controllers/restaurants.controller");

// middleware
const verifyTokenRole = require("../middleware/verifyTokenRole");


// get restaurants
router.get('/', [verifyTokenRole([1,2,3,4])], async (req, res) => {
    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    let filters = {};
    const id = req.query.id || req.body.id;
    const idUser = req.query.idUser || req.body.idUser;
    const region = req.query.region || req.body.region;
    const zone = req.query.zone || req.body.zone;
    const opeNow = req.query.opeNow || req.body.opeNow;
    const deleted = req.query.deleted || req.body.deleted;
    const active = req.query.active || req.body.active;
    const limit = req.query.limit || req.body.limit;
    const allstates = req.query.allstates || req.body.allstates;

    if (id !== undefined) { filters.id = id; }
    if (idUser !== undefined) { filters.idUser = idUser; }
    if (region !== undefined) { filters.IdRegion = region; }
    if (zone !== undefined) { filters.zone = zone; }
    if (opeNow !== undefined) { filters.opeNow = opeNow; }
    if (deleted !== undefined) { filters.deleted = deleted; }
    if (active !== undefined) { filters.active = active; }
    if (limit !== undefined) { filters.limit = limit; }
    if (allstates !== undefined) { filters.allStates = allstates; }

    try {
        // get restaurants
        const response = await restaurantsController.getAllRestaurants(filters, infoUser);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false
        });
    }
});


// create restaurant
router.post('/create', [verifyTokenRole([1,2,3,4])], async (req, res) => {
    const { restaurant } = req.body;
    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    if(!restaurant) return res.status(401).json({
        success: false,
        message: `incomplete fields`
    });

    // validate required
    const required = [ "idClient", "region", "name", "address", "paymentMethod", "locationMap" ];
    const resKey = Object.keys(restaurant);

    for(const item of required) {
        if(resKey.includes(item) === true){
            if(restaurant[item].trim() == ""){
                console.log("empty ->", item);
                return res.status(403).json({
                    success: false,
                    message: "empty fields"
                });
            }
        } else {
            console.log("undefined ->", item);
            return res.status(403).json({
                success: false,
                message: "undefined fields"
            });
        }
    }

    try {
        const response = await restaurantsController.create(restaurant, infoUser);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false
        });
    }
});


// create restaurant
router.post('/extraInfo', [verifyTokenRole([1,2,3,4])], async (req, res) => {
    const { extra } = req.body;
    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    if(!extra) return res.status(401).json({
        success: false,
        message: `incomplete fields`
    });

    // validate required
    const required = [ "idRestaurant", "field", "value" ];
    const resKey = Object.keys(extra);

    for(const item of required) {
        if(resKey.includes(item) === true){
            if(restaurant[item].trim() == ""){
                console.log("empty ->", item);
                return res.status(403).json({
                    success: false,
                    message: "empty fields"
                });
            }
        } else {
            console.log("undefined ->", item);
            return res.status(403).json({
                success: false,
                message: "undefined fields"
            });
        }
    }

    try {
        const response = await restaurantsController.addExtra(extra, infoUser);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false
        });
    }
});


// edit restaurant
router.put('/edit/:id', [verifyTokenRole([1,2,3,4])], async (req, res) => {
    const { restaurant } = req.body;
    const idRestaurant = req.params || req.query;
    restaurant.idRestaurant = idRestaurant.id;

    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    if(!restaurant) return res.status(401).json({
        success: false,
        message: `incomplete fields`
    });    

    // validate required
    const required = [ "idRestaurant", "name", "address", "locationMap" ];
    // "openNow" required
    const resKey = Object.keys(restaurant);

    for(const item of required) {
        if(resKey.includes(item) === true){
            if(restaurant[item].trim() == ""){
                console.log("empty ->", item);
                return res.status(403).json({
                    success: false,
                    message: "empty fields"
                });
            }
        } else {
            console.log("undefined ->", item);
            return res.status(403).json({
                success: false,
                message: "undefined fields"
            });
        }
    }

    try {
        const response = await restaurantsController.edit(restaurant, infoUser);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false
        });
    }
});


// on - off restaurant
router.put('/isopen/:id', [verifyTokenRole([1,2,3,4])], async (req, res) => {
    const { id, open } = req.body;
    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    // validate openNow required
    if(open === undefined) return res.status(403).json({
        success: false,
        message: 'incomplete field openNow'
    });

    try {
        const response = await restaurantsController.edit({openNow: open, idRestaurant: id}, infoUser);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            data: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false
        });
    }
});


module.exports = router;


//const data = {status:200, success: true, message: "texto" };
//return res.status(200).json({success: true});
//const useragent = req.body.useragent;
//const userip = req.body.ip;
