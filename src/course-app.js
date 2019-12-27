const app = require('./app');
const connection = require('./db');

// 根据id获取课程信息
app.get('/api/course/info/:id', (req, res) => {
    connection.query('select * from courses where id = ?', [req.params.id], (err, result) => {
        if (err) {
            console.log(`[Course] Error: ${err}`);
            res.status(503);
            return res.json({
                code: 2,
                message: err.name,
                data: {}
            });
        } else
        if (result.length === 0)
            res.json({
                code: 1,
                message: 'Course not found',
                data: {}
            });
        else
            res.json({
                code: 0,
                message: 'Successful',
                data: result
            });
    });
});

// 根据关键字查询课程
app.get('/api/course/search/:col/:val', (req, res) => {
    if (['name', 'minEduLevel', 'maxSize', 'teacher'].indexOf(req.params.col) === -1) {
        return res.json({
            code: 1,
            message: `Unknown key: ${req.params.col}`,
            data: {}
        });
    } else

    connection.query(`select * from courses where ${req.params.col} like ?`, [`%${req.params.val}%`],  (err, result) => {
        if (err) {
            console.log(`[Course] Error: ${err}`);
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

// 更新课程数据
app.post('/api/course/update', (req, res) => {
    if (['name', 'minEduLevel', 'maxSize', 'teacher', 'price'].indexOf(req.body.col) === -1) {
        return res.json({
            code: 1,
            message: `Unknown key: ${req.body.col}`,
            data: {}
        });
    } else

    connection.query(`update courses set ${req.body.col} = ? where id = ${req.body.id}`, [req.body.val], (err, result) => {
        if (err) {
            console.log(`[Course] Error: ${err}`);
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

// 根据id删除课程
app.get('/api/course/delete/:id', (req, res) => {
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

    connection.query('select teacher from courses where id = ?', [req.params.id], (err, result) => {
        if (err) {
            console.log(`[Course] Error: ${err}`);
            res.status(503);
            return res.json({
                code: 2,
                message: err.name,
                data: {}
            });
        }

        const teacherId = result[0].teacher;
        connection.query('select courses from users where id = ?', [teacherId], (err, result) => {
            if (err) {
                console.log(`[Course] Error: ${err}`);
                res.status(503);
                return res.json({
                    code: 2,
                    message: err.name,
                    data: {}
                });
            }

            const courses = eval(`[${result[0].courses}]`);
            courses.splice(courses.indexOf(parseInt(req.params.id)), 1);
            connection.query('update users set courses = ? where id = ?', [courses.toString(), teacherId], (err, result) => {
                if(err) {
                    console.log(`[Course] Error: ${err}`);
                    res.status(503);
                    return res.json({
                        code: 2,
                        message: err.name,
                        data: {}
                    });
                }

                connection.query('delete from courses where id = ?', [req.params.id], (err, result) => {
                    if(err) {
                        console.log(`[Course] Error: ${err}`);
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