const { Router } = require("express");
const router = Router();

const authController = require("../controllers/auth.controller");

// middleware
const verifyTokenRole = require("../middleware/verifyTokenRole");


// validate access to route
router.post('/testerRoles', [verifyTokenRole([1,2,3,4])], async (req, res) => {

    try {
        console.log("se ejecuta");
        console.log("req.body", req.body);

        res.status(200).json({
            success: true,
            message: "pasa"
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when obtaining the data.',
            error: error
        });
    }
});


// endpoint auth public - no autenticado
router.post('/public', async (req, res) => {
    try {
        const { timezone, device } = req.body;
        const data = { timezone, device };

        const response = await authController.getToken("public", data);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            token: response.token
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when obtaining the data.',
            error: error
        });
    }
});


// endpoint auth user - authenticate
router.post('/signin', async (req, res) => {
    const {username, password} = req.body;

    if(!username || !password) return res.status(401).json({
        success: false,
        message: `incomplete fields`
    });

    try {
        const data = { username, password };
        const response = await authController.getToken("authenticated", data);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            token: response.token
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when obtaining the data.',
            error: error
        });
    }
});


// endpoint auth customer - authenticate
router.post('/login', async (req, res) => {
    const {username, password} = req.body;

    if(!username || !password) return res.status(401).json({
        success: false,
        message: `incomplete fields`
    });

    try {
        const data = { username, password, customer: true };
        const response = await authController.getToken("authenticated", data);

        res.status(response.status).json({
            success: response.success,
            message: response.message,
            token: response.token
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'An error has occurred when obtaining the data.',
            error: error
        });
    }
});


// verificar token
router.post('/checkToken', async (req, res) => {
    const token = req.body.token || req.headers.token;
    const info = {
        timezone: req.body.timezone || req.headers.timezone,
        type: req.body.type || req.headers.type
    };

    // token does not exist
    if(token === undefined || token.trim() == "") return res.status(401).json({
        success: false,
        message: 'No token in request.'
    });

    try {
        const data = await authController.checkToken(info, token);
        res.status(data.status).json({ 
            success: data.success,
            message: data.message,
            token: data.token
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'token error.',
            error
        });
    }
});


// endpoint auth user - autorizado - web
// aun no hace nada
router.post('/authorize', async (req, res) => {
    const {username, password} = req.body;

    if(!username || !password) return res.status(400).json({
        success: false,
        message: `incomplete fields`
    });

    try {
        // valida user controller
        // return status 200
    } catch (error) {
        // return 403 no permisos   401 no autorizado
    }

    res.status(200).json({
        success: true,
        message: `bitacora `
    });

    // return 403 no permisos   401 no autorizado
    /*res.status(400).json({
        success: false,
        message: 'An error has occurred when obtaining the data.',
        error: error
    });
    res.status(200).json({
        success: true,
        message: 'genera token'
    });*/
});


module.exports = router;
