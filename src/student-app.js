const app = require('./app');
const connection = require('./db');

// 学生充值，val可为负数
app.get('/api/student/addCredit/:id/:val', function (req, res) {
    if (!req.signedCookies || !req.signedCookies.webrtc_userId) {
        return res.json({
            code: 1,
            message: "Login needed",
            data: {}
        });
    } else
    if (!(req.signedCookies.webrtc_userIdentity === '2'
        || (req.signedCookies.webrtc_userIdentity === '1' && req.params.id === req.signedCookies.webrtc_userId))) {
        return res.json({
            code: 1,
            message: "Illegal operation",
            data: {}
        });
    } else

    connection.query("select coins from users where id=" + req.params.id,function(err,result){
        if(err){
            console.log('[Student] Error: ' + err);
            res.status(503);
            return res.json({
                code: 2,
                message: err.name,
                data: {}
            });
        }
        let total=result[0].coins; //total为充值后的金钱数
        total += parseInt(req.params.val);
        console.log(total);
        connection.query("update users set coins = "+ total +" where id = "+req.params.id,function(err,result){
            if(err){
                console.log('[Student] Error: ' + err);
                res.status(503);
                return res.json({
                    code: 2,
                    message: err.name,
                    data: {}
                });
            }
            res.json({
                code: 0,
                message: "Successful",
                data: {}
            });
        });
    });
});

// 根据id删除用户信息
app.get('/api/student/delete/:id', function (req, res) {
    if (!req.signedCookies || !req.signedCookies.webrtc_userId) {
        return res.json({
            code: 1,
            message: 'Login needed',
            data: {}
        });
    } else
    if (req.signedCookies.webrtc_userIdentity !== '2') {
        return res.json({
            code: 1,
            message: 'Illegal operation',
            data: {}
        });
    } else

    connection.query('delete from users where id = ' + req.params.id, function (err, result) {
        if (err) {
            console.log('[Student] Error: ' + err);
            res.status(503);
            return res.json({
                code: 2,
                message: err.name,
                data: {}
            });
        }
        res.json({
            code: 0,
            message: 'Successful',
            data: {}
        });
    });
});

// admin，查询所有学生信息
app.get('/api/student/info', function (req, res) {
    if (!req.signedCookies || !req.signedCookies.webrtc_userId) {
        return res.json({
            code: 1,
            message: 'Login needed',
            data: {}
        });
    } else
    if (req.signedCookies.webrtc_userIdentity !== '2') {
        return res.json({
            code: 1,
            message: 'Illegal operation',
            data: {}
        });
    } else

    connection.query('select * from users where identity = 1', function (err, result) {
        if (err) {
            console.log('[Student] Error: ' + err);
            res.status(503);
            return res.json({
                code: 2,
                message: err.name,
                data: {}
            });
        }

        res.json({
            code: 0,
            message: 'Successful',
            data: result
        });
    });
});

// 根据id查询学生信息
app.get('/api/student/info/:id', function (req, res) {

    if (!req.signedCookies || !req.signedCookies.webrtc_userId) {
        return res.json({
            code: 1,
            message: 'Login needed',
            data: {}
        });
    } else
    if (!(req.signedCookies.webrtc_userIdentity === '2'
        || (req.signedCookies.webrtc_userIdentity === '1' && req.params.id === req.signedCookies.webrtc_userId))) {
        return res.json({
            code: 1,
            message: 'Illegal operation',
            data: {}
        });
    } else

    connection.query('select * from users where id=' + req.params.id, function (err, result) {
        if (err) {
            console.log('[Student] Error: ' + err);
            res.status(503);
            return res.json({
                code: 2,
                message: err.name,
                data: {}
            });
        }

        res.json({
            code: 0,
            message: 'Successful',
            data: result
        });
    });
});

// 更新学生个人信息
app.post('/api/student/update', function (req, res) {

    if (!req.signedCookies || !req.signedCookies.webrtc_userId) {
        return res.json({
            code: 1,
            message: 'Login needed',
            data: {}
        });
    } else
    if (req.signedCookies.webrtc_userIdentity === '0') {
        return res.json({
            code: 1,
            message: 'Illegal operation',
            data: {}
        });
    } else

    connection.query(`update users set ${req.body.col} = ? where id = ${req.params.id}`, [req.body.val], function (err, result) {
        if (err) {
            console.log('[Student] Error: ' + err);
            res.status(503);
            return res.json({
                code: 2,
                message: err.name,
                data: {}
            });
        }

        res.json({
            code: 0,
            message: 'Successful',
            data: {}
        });
    });
});

// 学生根据id加入课程
app.get('/api/student/joinCourse/:id', (req, res) => {
    if (!req.signedCookies || !req.signedCookies.webrtc_userId) {
        return res.json({
            code: 1,
            message: 'Login needed',
            data: {}
        });
    } else
    if (req.signedCookies.webrtc_userIdentity === '0') {
        return res.json({
            code: 1,
            message: 'Illegal operation',
            data: {}
        });
    } else

    connection.query(`select * from courses where id = ?`, req.params.id, (err, result) => {
        if (err) {
            console.log('[Student] Error: ' + err);
            res.status(503);
            return res.json({
                code: 2,
                message: err.name,
                data: {}
            });
        } else
        if (result.length === 0) {
            return res.json({
                code: 1,
                message: 'Course not found',
                data: {}
            });
        } else
        if (result[0].size === result[0].maxSize) {
            return res.json({
                code: 1,
                message: 'The course is full',
                data: {}
            });
        } else

        connection.query('update courses set size = ? where id = ?', [result[0].size + 1, req.params.id], (err, result) => {
            if (err) {
                console.log('[Student] Error: ' + err);
                res.status(503);
                return res.json({
                    code: 2,
                    message: err.name,
                    data: {}
                });
            }
            connection.query('select courses from users where id = ?', [req.signedCookies.webrtc_userId], (err, result) => {
                if (err) {
                    console.log('[Student] Error: ' + err);
                    res.status(503);
                    return res.json({
                        code: 2,
                        message: err.name,
                        data: {}
                    });
                }
                const courses = eval(`[${result[0].courses}]`);
                courses.push(req.params.id);
                connection.query('update users set courses = ? where id = ?',
                    [courses.toString(), req.signedCookies.webrtc_userId],
                    (err, result) => {
                    if (err) {
                        console.log('[Student] Error: ' + err);
                        res.status(503);
                        return res.json({
                            code: 2,
                            message: err.name,
                            data: {}
                        });
                    }
                    res.json({
                        code: 0,
                        message: 'Successful',
                        data: {}
                    });
                });
            });
        });
    });
});


module.exports = app;