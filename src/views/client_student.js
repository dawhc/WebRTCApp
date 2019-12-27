var username, roomId, localPeerOfCamera, localPeerOfScreen, myStream, switchStatus, remoteCameraStream, remoteScreenStream;

window.onload = () => {
    if (username === undefined)
        username = prompt('Username:');
    if (roomId === undefined)
        roomId = prompt('Room ID:');
    //socket.onopen =
    setTimeout(() => {
        socket.send(JSON.stringify({
            event: 'join',
            username: username,
            roomId: roomId,
            identity: 'student'
        }));
    }, 1000);

    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        myStream = stream;
        //q('#video-sub').srcObject = stream;
        setupLocalPeer();
    }).catch(err => {
        console.log(`[Error] ${err.name} ${err.result}`);
        alert(err.name);
    });

    switchStatus = 0;
};

socket.onmessage = msg => {
    console.log(`Got message`, msg);
    let data = JSON.parse(msg.data);
    const event = data.event;
    data = 'object' === typeof data.data ? data.data : data;
    console.log(data);
    switch(event) {

        case "answer of camera": {
            localPeerOfCamera.setRemoteDescription(new RTCSessionDescription(data.answer));
            break;
        }
        case "answer of screen": {
            localPeerOfScreen.setRemoteDescription(new RTCSessionDescription(data.answer));
            break;
        }

        case "candidate of camera": {
            localPeerOfCamera.addIceCandidate(new RTCIceCandidate(data.candidate));
            break;
        }
        case "candidate of screen": {
            localPeerOfScreen.addIceCandidate(new RTCIceCandidate(data.candidate));
            break;
        }

        case "error": {
            alert(`[Error] ${data.log}`);
            window.location.reload();
            break;
        }

        case "leave": {
            onLeave();
            break;
        }
    }
};

function onSwitch() {
    if(switchStatus === 1) {
        q("#video-main").srcObject = remoteCameraStream;
        q("#video-sub").srcObject = remoteScreenStream;
    }
    else {
        q("#video-main").srcObject = remoteScreenStream;
        q("#video-sub").srcObject = remoteCameraStream;
    }
    switchStatus ^= 1;
}

function onLeave() {
    socket.send(JSON.stringify({
        event: 'leave'
    }));

    localPeerOfCamera.onaddstream = null;
    localPeerOfCamera.onicecandidate = null;
    localPeerOfCamera.close();

    localPeerOfScreen.onaddstream = null;
    localPeerOfScreen.onicecandidate = null;
    localPeerOfScreen.close();
    setupLocalPeer();
}

function setupLocalPeer() {
    localPeerOfCamera = new RTCPeerConnection(ice_config);
    localPeerOfScreen = new RTCPeerConnection(ice_config);

    // *******************************************
    // Remote Media Stream
    // *******************************************
    localPeerOfCamera.onaddstream = function(event) {
        remoteCameraStream = event.stream;
        q("#video-main").srcObject = event.stream;
    };
    localPeerOfCamera.onicecandidate = function(event) {
        if (event.candidate) {
            console.log('[CameraLocalPeer] Got My Icecandidate');
            socket.send(JSON.stringify({
                event: 'student candidate of camera',
                candidate: event.candidate,
            }));
        }
    };

    localPeerOfScreen.onaddstream = function(event) {
        remoteScreenStream = event.stream;
        q("#video-sub").srcObject = event.stream;
    };
    localPeerOfScreen.onicecandidate = function(event) {
        if (event.candidate) {
            console.log('[ScreenLocalPeer] Got My Icecandidate');
            socket.send(JSON.stringify({
                event: 'student candidate of screen',
                candidate: event.candidate,
            }));
        }
    };

    localPeerOfCamera.addStream(myStream);
    localPeerOfScreen.addStream(myStream);
}

function startPeerConnection () {
    if (hasUserMedia() && hasRTCPeerConnection()) {

        // Create Offer to Teacher
        localPeerOfCamera.createOffer(offer => {
            socket.send(JSON.stringify({
                event: 'offer of camera',
                offer: offer,
            }));
            console.log(`Sending offer to teacher: ${offer}`);
            localPeerOfCamera.setLocalDescription(offer);
        }, err => {
            alert(`[Error] ${err}`);
        });

        localPeerOfScreen.createOffer(offer => {
            socket.send(JSON.stringify({
                event: 'offer of screen',
                offer: offer,
            }));
            console.log(`Sending offer to teacher: ${offer}`);
            localPeerOfScreen.setLocalDescription(offer);
        }, err => {
            alert(`[Error] ${err}`);
        });
    }
    else
        alert("Your browser does not support WebRTC.");
}

q("#btn-start").onclick = startPeerConnection;
q('#btn-switch').onclick = onSwitch;
q("#btn-leave").onclick = onLeave;
window.onbeforeunload = onLeave;