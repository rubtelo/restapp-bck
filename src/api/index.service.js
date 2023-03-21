const { Router } = require("express");
const router = Router();

const generalController = require("../controllers/general.controller");


router.get('/', async (req, res) => {
    //const socialEmployee = req.body.socialEmployee || req.query.socialEmployee;
    //const data = await generalController.getRecord(socialEmployee);
    res.status(200).json({
        success: true,
        message: `bitacora `
    });
});

router.get('/db', async (req, res) => {
    //const socialEmployee = req.body.socialEmployee || req.query.socialEmployee;
    const data = await generalController.getData();
    res.status(200).json({
        success: true,
        data
    });
});


router.get('/dbc', async (req, res) => {
    const data = await generalController.getDosdata();
    res.status(200).json({
        success: true,
        data
    });
});


/*
router.post('/record', async (req, res) => {
    const token = req.body.token || req.query.token || req.headers.token;
    const event = req.body.event || req.query.event;
    const module = req.body.module || req.query.module;

    let logs = {
        event: "Evento",
        module: "PRM"
    };

    if(event != undefined){ logs.event = event; }
    if(module != undefined){ logs.module = `${logs.module}-${module}`; }

    const data = await generalController.addRecord(req, info, token);
    res.status(200).json({
        success: true,
        data
    });
});
*/

module.exports = router;
