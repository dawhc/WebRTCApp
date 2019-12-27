const app = require('./app');
const connection = require('./db');

// 根据id删除教师用户
app.get('/api/teacher/delete/:id',function(req,res){
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

    {
        const delSql = 'DELETE FROM users where id=' + req.param.id;
        connection.query(delSql, function (err, result) {
            if (err) {
                console.log(`[Teacher] Error: ${err}`);
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
    }
});

// 根据id查询教师信息
app.get('/api/teacher/info/:id',function(req,res,next){
    if (!req.signedCookies || !req.signedCookies.webrtc_userId) {
        return res.json({
            code: 1,
            message: 'Login needed',
            data: {}
        });
    } else
    if (!(req.signedCookies.webrtc_userIdentity === '2'
        || (req.signedCookies.webrtc_userIdentity === '0' && req.params.id === req.signedCookies.webrtc_userId))) {
        return res.json({
            code: 1,
            message: 'Illegal operation',
            data: {}
        });
    } else

    connection.query('SELECT * FROM users WHERE id = ?', req.params.id,function (err, result,fields) {
        if(err){
            console.log(`[Teacher] Error: ${err}`);
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

// admin，查询所有教师信息
app.get('/api/teacher/info', function(req, res) {
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

    connection.query('select * from users where identity = 0', function (err, result) {
        if (err) {
            console.log('[Teacher] Error: ' + err);
            res.status(503);
            return res.json({
                code: 2,
                message: err.name
            });
        }

        res.json({
            code: 0,
            message: 'Successful',
            data: result
        });
    });
});

// 更新教师用户
app.post('/api/teacher/update',function(req,res,next){
    if (!req.signedCookies || !req.signedCookies.webrtc_userId) {
        return res.json({
            code: 1,
            message: 'Login needed',
            data: {}
        });
    } else
    if (req.signedCookies.webrtc_userIdentity === '1') {
        return res.json({
            code: 1,
            message: 'Illegal operation',
            data: {}
        });
    } else {
        let sql = 'update users set ' + req.body.col + '=' + req.body.to + ' where id=' + req.params.id;
        connection.query(sql, function (err, rows) {
            if (err) {
                console.log(`[Teacher] Error: ${err}`);
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
    }
});

// 学生给教师打分
app.get('/api/teacher/grade/:id/:score',function(req,res,next){
    if (!req.signedCookies || !req.signedCookies.webrtc_userId) {
        return res.json({
            code: 1,
            message: 'Login needed',
            data: {}
        });
    } else
    if (req.signedCookies.webrtc_userIdentity !== '1') {
        return res.json({
            code: 1,
            message: 'Illegal operation',
            data: {}
        });
    } else

    connection.query('SELECT * FROM users WHERE id = ?',req.params.id,function (err, result,fields) {
        if(err){
            console.log(`[Teacher] Error: ${err}`);
            res.status(503);
            return res.json({
                code: 2,
                message: err.name,
                data: {}
            });
        }

        if (result[0].identity !== 0) {
            return res.json({
                code: 1,
                message: 'Illegal operation',
                data: {}
            });
        } else {

            let stuCount = parseInt(result[0].stuCount);
            let score = parseInt(result[0].score);
            score = ((score * stuCount) + parseInt(req.params.score)) / (stuCount + 1);
            stuCount++;
            const sql = "update users set stuCount = '" + stuCount + "',score = '" + score + "' where id = '" + req.params.id + "'";
            connection.query(sql, function (err, rows) {
                if (err) {
                    console.log(`[Teacher] Error: ${err}`);
                    res.status(503);
                    return res.json({
                        code: 2,
                        message: err.name,
                        data: {}
                    });
                } else {
                    res.json({
                        code: 0,
                        message: 'Successful',
                        data: {}
                    });
                }
            });
        }
    });
});

// 教师添加课程
// body: name, teacher, minEduLevel, maxSize, price
app.post('/api/teacher/addCourse', function(req, res) {
    if (!req.signedCookies || !req.signedCookies.webrtc_userId) {
        return res.json({
            code: 1,
            message: 'Login needed',
            data: {}
        });
    } else

    if (req.signedCookies.webrtc_userIdentity === '1') {
        return res.json({
            code: 1,
            message: 'Illegal operation',
            data: {}
        });
    } else

    connection.query(`insert into courses (name, teacher, minEduLevel, maxSize, price) value (?, ?, ?, ?, ?)`,
        [req.body.name, req.signedCookies.webrtc_userId, req.body.minEduLevel, req.body.maxSize, req.body.price],
        (err, result) => {

        if(err) {
            console.log(`[Teacher] Error: ${err}`);
            res.status(503);
            return res.json({
                code: 2,
                message: err.name,
                data: {}
            });
        }

        connection.query('select LAST_INSERT_ID() as id', (err, result) => {
            if (err) {
                console.log(`[Teacher] Error: ${err}`);
                res.status(503);
                return res.json({
                    code: 2,
                    message: err.name,
                    data: {}
                });
            }
            const courseId = result[0].id;
            connection.query('select courses from users where id = ?', [req.signedCookies.webrtc_userId], (err, result) => {
                if (err) {
                    console.log(`[Teacher] Error: ${err}`);
                    res.status(503);
                    return res.json({
                        code: 2,
                        message: err.name,
                        data: {}
                    });
                }
                const courses = eval(`[${result[0].courses}]`);
                courses.push(courseId);
                connection.query('update users set courses = ? where id = ?',
                    [courses.toString(), req.signedCookies.webrtc_userId],
                    (err, result) => {
                    if (err) {
                        console.log(`[Teacher] Error: ${err}`);
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