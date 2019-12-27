const socket = new WebSocket(SERVER_SOCKET_URL);

const ice_config = {
//    "iceServers": [{
//        "urls": "stun:stun1.l.google.com:19302"
//    }]
};

function q(s) {
    return document.querySelector(s);
}

function hasUserMedia() {
    navigator.getDisplayMedia = navigator.mediaDevices.getDisplayMedia || navigator.getDisplayMedia;
    navigator.getUserMedia = navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    return (!! navigator.getUserMedia) && (!! navigator.getDisplayMedia);
}
function hasRTCPeerConnection() {
    window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
    window.RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
    window.RTCIceCandidate = window.RTCIceCandidate || window.webkitRTCIceCandidate || window.mozRTCIceCandidate;
    return !! window.RTCPeerConnection;
}

//window.onbeforeunload = socket.emit('leave', username);
