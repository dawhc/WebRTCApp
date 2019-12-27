const app = require('./app');
const db_conn = require('./db');

// 测试路由，直播间主页
app.get('/liveroom', (req, res) => {
    if (!req.query.id)
        res.redirect('/index');
    else {
        if (!req.signedCookies || !req.signedCookies.webrtc_userId)
            res.redirect(`/login?redirectURL=/liveroom?id=${req.query.id}`);
        else
            res.render(req.signedCookies.webrtc_userIdentity === '0' ? 'teacher' : 'student', {
                username: req.signedCookies.webrtc_username,
                roomId: req.query.id,
                socketURL: `wss://${app.get('ip')}:${app.get('port')}`
            });
    }
});

module.exports = app;