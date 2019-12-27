const app = require('./app');
const db_conn = require('./db');

// *************************************
// Identity:
// 0: teacher
// 1: student
// 2: admin
// *************************************

// 测试路由，登录界面
app.get('/login', (req, res) => {
    if (!req.query.redirectURL)
        req.query.redirectURL = '/index';

    res.render('login', {redirectURL: req.query.redirectURL});
});

// 登录功能
// body: username, password, redirectURL
app.post('/api/login', (req, res) => {
    if (!req.body.redirectURL)
        req.body.redirectURL = '/index';

    db_conn.query(`SELECT * FROM users WHERE username = ?`, [req.body.username], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                status: 2,
                log: err
            });
        }
        result = result[0];
        if (result && result.password === req.body.password) {
            res.cookie('webrtc_userId', result.id, {signed: true, maxAge: 86400000, httpOnly: true});
            res.cookie('webrtc_username', result.username, {signed: true, maxAge: 86400000, httpOnly: true});
            res.cookie('webrtc_userIdentity', result.identity, {signed: true, maxAge: 86400000, httpOnly: true});
            res.json({
                code: 0,
                message: 'Successful',
                data: {
                    redirectURL: req.body.redirectURL
                }

            });
        }
        else
            res.json({
                code: 1,
                message: 'Invalid username or password',
                data: {
                    redirectURL: `/login?redirectURL=${req.body.redirectURL}`
                }
            });
    });
});

// 注销功能
app.get('/api/logout', (req, res) => {
    res.clearCookie('webrtc_userId');
    res.clearCookie('webrtc_username');
    res.clearCookie('webrtc_userIdentity');
    res.json({
        code: 0,
        message: 'Successful',
        data: {
            redirectURL: req.query.redirectURL ? req.query.redirectURL : '/index'
        }
    });
});

// 注册功能
// body: username, password, email, identity, edulevel
app.post('/api/register', (req, res) => {

    const invalidPasswdExp = RegExp(/^(?:\d+|[a-zA-Z]+|[!@#$%^&*]+)$/);
    const validEmailExp = RegExp(/^[a-zA-Z0-9_-]+@([a-zA-Z0-9]+\.)+(com|cn|net|org)$/);

    // Validate password
    if (!req.body.password || req.body.password.length < 8 || invalidPasswdExp.test(req.body.password))
        res.json({
            code: 1,
            message: 'Invalid password',
            data: {}
        });
    else

    // Validate email
    if (!req.body.email || !validEmailExp.test(req.body.email))
        res.json({
            code: 1,
            message: 'Invalid email',
            data: {}
        });
    else

    // Validate username & Insert into database
        db_conn.query('insert into users (username, password, email, identity, eduLevel) values(?, ?, ?, ?, ?)',
            [req.body.username, req.body.password, req.body.email, req.body.identity, req.body.eduLevel],
            (err, result) => {
            if (err) {

                // Duplicate username or email
                if (/^Duplicate.+$/.test(err.sqlMessage)) {
                    return res.json({
                        code: 1,
                        message: err.sqlMessage,
                        data: {}
                    });
                }
                console.log(`[App] Unexpected error: \n${err}`);
                res.status(503);
                res.json({
                    code: 2,
                    message: err.name,
                    data: {}
                });
            }
            console.log(result);
            res.json({
                code: 0,
                message: 'Successful',
                data: {}
            });
        });
});

module.exports = app;

