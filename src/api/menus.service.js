const { Router } = require("express");
const router = Router();

const menusController = require("../controllers/menus.controller");
const logsController = require("../controllers/logs.controller");

// middleware
const verifyTokenRole = require("../middleware/verifyTokenRole");


// list menus
router.get('/listmenu', [verifyTokenRole([1,2,3,4,5,6])], async (req, res) => {
    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    let filters = {};
    // skip fields
    const keys = Object.keys(req.body);
    const bodyKeys = ["rol", "timezone", "type", "userId"];

    for (const item of keys) {
        if(bodyKeys.includes(item) === false){
            const newItem = { [item]: req.body[item] };
            filters = {...filters, ...newItem};
        }
    }

    try {
        const response = await menusController.getMenus(filters);

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


// create menu
router.post('/create', [verifyTokenRole([1,2,3,4])], async (req, res) => {
    const { menu } = req.body;
    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    if(!menu) return res.status(401).json({
        success: false,
        message: `incomplete fields`
    });

    // validate required
    const required = [ "idRestaurant", "name" ];
    const resKey = Object.keys(menu);

    for(const item of required) {
        if(resKey.includes(item) === true){
            if(menu[item].trim() == ""){
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
        const response = await menusController.create(menu, infoUser);

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


// edit menu
router.put('/edit', [verifyTokenRole([1,2,3,4])], async (req, res) => {
    const { menu } = req.body;
    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    if(!menu) return res.status(401).json({
        success: false,
        message: `incomplete fields`
    });

    // validate required
    const required = [ "idMenu", "name", "status" ];
    const resKey = Object.keys(menu);

    for(const item of required) {
        if(resKey.includes(item) === true){
            if(menu[item].trim() == ""){
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
        const response = await menusController.edit(menu);

        res.status(response.status).json({
            success: response.success,
            message: response.message
        });

    } catch (error) {
        res.status(400).json({
            success: false
        });
    }
});


// on - off menu
router.put('/isactive/:id', [verifyTokenRole([1,2,3,4])], async (req, res) => {
    const { isActive } = req.body;
    const idMenu = req.params || req.query;

    // validate isactive required
    if(isActive === undefined) return res.status(403).json({
        success: false,
        message: 'incomplete field isActive'
    });

    try {
        const response = await menusController.activeMenu({isActive, id: idMenu.id});

        res.status(response.status).json({
            success: response.success,
            message: response.message
        });

    } catch (error) {
        res.status(400).json({
            success: false
        });
    }
});


// list content menus
router.get('/menudetails', [verifyTokenRole([1,2,3,4,5,6])], async (req, res) => {
    const { IdMenu } = req.body;
    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    if(!IdMenu) return res.status(401).json({
        success: false,
        message: `incomplete fields`
    });

    try {
        const response = await menusController.getMenuDetails(IdMenu);

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


// create menu content
router.post('/content', [verifyTokenRole([1,2,3,4])], async (req, res) => {
    const { menu } = req.body;
    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    // validate required
    if(menu.length == 0) return res.status(401).json({
        success: false,
        message: `incomplete fields`
    });

    try {
        const response = await menusController.createContent(menu, infoUser);

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


// delete menu content
router.delete('/content', [verifyTokenRole([1,2,3,4])], async (req, res) => {
    const { id, useragent, ip } = req.body;

    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    // validate required
    if(!id) return res.status(401).json({
        success: false,
        message: `incomplete fields`
    });

    try {
        // send to edit
        const response = await menusController.delMenuDetails(id);

        // to record
        let info = {
            event: `Delete menu content id: ${id}`,
            module: "Menu Content",
            user: infoUser.userId
        };

        if (useragent != undefined) { info.useragent = useragent; }
        if (ip != undefined) { info.ip = ip; }

        const record = await logsController.addRecord(req, info);
        ////

        res.status(response.status).json({
            success: response.success,
            message: response.message
        });

    } catch (error) {
        res.status(400).json({
            success: false
        });
    }
});


// list tag
router.get('/tags', [verifyTokenRole([1,2,3,4,5,6])], async (req, res) => {
    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    try {
        const response = await menusController.getTag(infoUser);

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


// create tag
router.post('/tagCreate', [verifyTokenRole([1,2,3,4])], async (req, res) => {
    const { tag } = req.body;
    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    if(!tag) return res.status(401).json({
        success: false,
        message: `incomplete fields`
    });

    try {
        const response = await menusController.createTag(tag, infoUser);

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


// delete tag
router.delete('/tag', [verifyTokenRole([1,2,3,4])], async (req, res) => {
    const { tag } = req.body;
    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    if(!tag) return res.status(401).json({
        success: false,
        message: `incomplete fields`
    });

    try {
        const response = await menusController.deleteTag(tag, infoUser);

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


//// Data App ////

// list tags
router.get('/tagList', [verifyTokenRole([1,2,3,4,5,6])], async (req, res) => {
    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    try {
        const response = await menusController.getTag(infoUser,true);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            tags: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false
        });
    }
});


// List menu index
router.get('/menuIndexList', [verifyTokenRole([1,2,3,4,5,6])], async (req, res) => {
    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    const getFilters = Object.keys(req.params).length > 0
                    ? req.params
                    : req.query;

    // add filters
    let filters = {
        'R.IdRegion': getFilters["idRegion"]
    };

    if(getFilters["idZone"] != undefined && getFilters["idZone"] > 0){
        filters = {...filters, ...{"R.Zone": getFilters["idZone"]} };
    }

    if(getFilters["idCategory"] != undefined && getFilters["idCategory"] > 0){
        filters = {...filters, ...{"M.idCategory": getFilters["idCategory"]} };
    }

    // revisar ya que los serviceOptions se guardan agrupados
    if(getFilters["serviceOptions"] != undefined && getFilters["serviceOptions"] > 0){
        filters = {...filters, ...{"R.serviceOptions": getFilters["serviceOptions"]} };
    }

    if(getFilters["idTag"] != undefined && getFilters["idTag"] > 0){
        filters = {...filters, ...{"tag": getFilters["idTag"]} };
    }

    try {
        const response = await menusController.getMenuIndex(infoUser, filters);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            menus: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false
        });
    }
});


// List menu favorites
router.get('/menuFavoritesList', [verifyTokenRole([1,2,3,4,5,6])], async (req, res) => {
    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    const getFilters = Object.keys(req.params).length > 0
                    ? req.params
                    : req.query;

    // add filters
    let filters = {};

    if(getFilters["idMenu"] != undefined && getFilters["idMenu"].length > 0){
        filters = getFilters["idMenu"];

    } else {
        return res.status(200).json({
            success: true,
            message: "without listing favorites",
            menus: []
        });
    }

    try {
        const response = await menusController.getMenuFavorites(infoUser, filters);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            menus: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false
        });
    }
});


// menu details
router.get('/menuDetail', [verifyTokenRole([1,2,3,4,5,6])], async (req, res) => {
    const { idMenu } = Object.keys(req.params).length > 0
                    ? req.params
                    : req.query;

    if(!idMenu) return res.status(401).json({
        success: false,
        message: `incomplete fields`
    });

    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    const params = req.body;
    let allStatus = false;

    if(Object.keys(params).length > 0){
        if(params.allStatus != undefined){
            allStatus = params.allStatus;
        }
    }

    try {
        const response = await menusController.getMenuDetailById(idMenu, allStatus);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            menu: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false
        });
    }
});


// List menu suggest
// ** arreglar para que llame prioritarios
router.get('/menuSuggest', [verifyTokenRole([1,2,3,4,5,6])], async (req, res) => {
    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    // agregar filtros
    const filters = {};

    try {
        const response = await menusController.getMenuSuggest(infoUser,filters);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            suggest: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false
        });
    }
});


// restaurant details
router.get('/restaurant', [verifyTokenRole([1,2,3,4,5,6])], async (req, res) => {
    const { idRestaurant } = Object.keys(req.params).length > 0
                    ? req.params
                    : Object.keys(req.query).length > 0
                        ? req.query : req.body;

    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    if(!idRestaurant) return res.status(401).json({
        success: false,
        message: `incomplete fields`
    });

    try {
        const response = await menusController.getRestaurantById(idRestaurant);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            restaurant: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false
        });
    }
});


// Search Delegate Menu Name List
router.get('/sdMenuNameList', [verifyTokenRole([1,2,3,4,5,6])], async (req, res) => {
    const infoUser = {
        userId: req.body.userId,
        timezone: req.body.timezone
    };

    const { name } = req.body;
    if(!name) return res.status(401).json({
        success: false,
        message: 'name required'
    });

    const getFilters = Object.keys(req.params).length > 0
                    ? req.params
                    : req.query;

    // add filters
    const filters = {
        'R.IdRegion': getFilters["idRegion"],
        "M.Name": name.trim()
    };

    try {
        const response = await menusController.getSDMenu(infoUser, filters);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            menus: response.data
        });

    } catch (error) {
        res.status(400).json({
            success: false
        });
    }
});



module.exports = router;
