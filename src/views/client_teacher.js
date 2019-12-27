var username, roomId, myScreenStream, myCameraStream, switchStatus;
var localPeersOfScreen = [];
var localPeersOfCamera = [];

window.onload = () => {
    if (username === undefined)
        username = prompt('Username:');
    if (roomId === undefined)
        roomId = prompt('Room ID:');

    setTimeout(() => {
        socket.send(JSON.stringify({
            event: 'join',
            username: username,
            roomId: roomId,
            identity: 'teacher'
        }));
    }, 1000);
};

socket.onmessage = msg => {
    console.log(`Got message`, msg);
    let data = JSON.parse(msg.data);
    const event = data.event;
    data = 'object' === typeof data.data ? data.data : data;
    switch(event) {

        case "offer of camera": {
            localPeersOfCamera[data.username] = new RTCPeerConnection(ice_config);
            let localPeerOfCamera = localPeersOfCamera[data.username];
            localPeerOfCamera.addStream(myCameraStream);
            localPeerOfCamera.onaddstream = event => {
                let new_video = document.createElement('video');
                new_video.setAttribute('autoplay', '');
                new_video.setAttribute('controls', '');
                new_video.setAttribute('id', `s-${data.username}`);
                new_video.srcObject = event.stream;
                q('div#remotev-div').appendChild(new_video);
            };
            localPeerOfCamera.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('Got My Icecandidate');
                    socket.send(JSON.stringify({
                        event: 'teacher candidate of camera',
                        candidate: event.candidate,
                        ano_username: data.username
                    }));
                }
            };

            localPeerOfCamera.setRemoteDescription(new RTCSessionDescription(data.offer));
            localPeerOfCamera.createAnswer(function (answer) {
                    localPeerOfCamera.setLocalDescription(answer);
                    socket.send(JSON.stringify({
                        event: 'answer of camera',
                        answer: answer,
                        ano_username: data.username
                    }));
                },
                function (error) {
                    alert(`[Error] ${error}`);
                });
            break;
        }

        case "offer of screen": {
            localPeersOfScreen[data.username] = new RTCPeerConnection(ice_config);
            let localPeerOfScreen = localPeersOfScreen[data.username];
            localPeerOfScreen.addStream(myScreenStream);
            localPeerOfScreen.onaddstream = event => {};
            localPeerOfScreen.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('Got My Icecandidate');
                    socket.send(JSON.stringify({
                        event: 'teacher candidate of screen',
                        candidate: event.candidate,
                        ano_username: data.username
                    }));
                }
            };

            localPeerOfScreen.setRemoteDescription(new RTCSessionDescription(data.offer)).then(
                localPeerOfScreen.createAnswer(function (answer) {
                        localPeerOfScreen.setLocalDescription(answer);
                        socket.send(JSON.stringify({
                            event: 'answer of screen',
                            answer: answer,
                            ano_username: data.username
                        }));
                    },
                    function (error) {
                        alert(`[Error] ${error}`);
                    })
            );

            break;
        }


        case "candidate of camera": {
            localPeersOfCamera[data.username].addIceCandidate(new RTCIceCandidate(data.candidate));
            break;
        }
        case "candidate of screen": {
            localPeersOfScreen[data.username].addIceCandidate(new RTCIceCandidate(data.candidate));
            break;
        }


        case "leave": {
            localPeersOfCamera[data.username].onicecandidate = null;
            localPeersOfCamera[data.username].onaddstream = null;
            localPeersOfScreen[data.username].onicecandidate = null;
            localPeersOfScreen[data.username].onaddstream = null;
            delete localPeersOfCamera[data.username];
            delete localPeersOfScreen[data.username];

            q('div#remotev-div').removeChild(q(`video#s-${data.username}`));
            break;
        }

        case "error": {
            alert(`[Error] ${data.log}`);
            window.location.reload();
        }
    }
};

function onLeave() {
    socket.send(JSON.stringify({
        event: 'leave'
    }));

    localPeersOfCamera.forEach(peer => {
        peer.onicecandidate = null;
        peer.onaddstream = null;
        peer.close();
    });

    localPeersOfScreen.forEach(peer => {
        peer.onicecandidate = null;
        peer.onaddstream = null;
        peer.close();
    });

    q('#video-main').srcObject = null;
    q('#video-sub').srcObject = null;
}

function startLiveMedia() {
    switchStatus = 0;
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            q('#video-main').srcObject = stream;
            myCameraStream = stream;
        }).catch(err => {
            console.log(`[Error] ${err.name} ${err.result}`);
        });
    }
    if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false
        }).then(stream => {
            q('#video-sub').srcObject = stream;
            myScreenStream = stream;
        }).catch(err => {
            console.log(`[Error] ${err.name} ${err.result}`);
        });
    }
}

q('#btn-start').onclick = () => {
    if (hasUserMedia() && hasRTCPeerConnection()) {
        startLiveMedia();
    }
    else
        alert("Your browser does not support WebRTC.");
};

q('#btn-switch').onclick = () => {
    if (switchStatus === 0) {
        q('#video-main').srcObject = myScreenStream;
        q('#video-sub').srcObject = myCameraStream;
    }
    else {
        q('#video-main').srcObject = myCameraStream;
        q('#video-sub').srcObject = myScreenStream;
    }
    switchStatus ^= 1;
}

q("#btn-leave").onclick = onLeave;
window.onbeforeunload = onLeave;