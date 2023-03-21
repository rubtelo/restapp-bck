const { Router } = require("express");
const router = Router();

const clientsController = require("../controllers/clients.controller");

// middleware
const verifyTokenRole = require("../middleware/verifyTokenRole");


// get clients
router.get('/', [verifyTokenRole([1,2])], async (req, res) => {
    //const infoUser = {
    //    userId: req.body.userId,
    //    timezone: req.body.timezone
    //};

    let filters = {};
    const id = req.query.id || req.body.id;
    const state = req.query.state || req.body.state;
    const region = req.query.region || req.body.region;
    const deleted = req.query.deleted || req.body.deleted;
    const active = req.query.active || req.body.active;
    const limit = req.query.limit || req.body.limit;

    if (id !== undefined) { filters.id = id; }
    if (state !== undefined) { filters.state = state; }
    if (region !== undefined) { filters.region = region; }
    if (deleted !== undefined) { filters.deleted = deleted; }
    if (active !== undefined) { filters.active = active; }
    if (limit !== undefined) { filters.limit = limit; }

    try {
        // get clients
        const response = await clientsController.getClients(filters);

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


// create client
router.post('/create', [verifyTokenRole([1,2,3,4])], async (req, res) => {
    const { client } = req.body;
    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    if(!client) return res.status(401).json({
        success: false,
        message: `incomplete fields`
    });

    // validate required
    const required = [ "idUser", "accessLevel", "userType", "firstName", "lastName", "email", "phoneNumber", "idRegion" ];
    const resKey = Object.keys(client);

    for(const item of required) {
        if(resKey.includes(item) === true){
            if(client[item].trim() == ""){
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
        // create client
        const response = await clientsController.create(client, infoUser);

        if(response.success == true && response.data > 1){
            // create role
            const role = await clientsController.addRole(client.idUser, infoUser);
            const pass = await clientsController.addPassword(client.idUser, client.idUser);
        }

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
