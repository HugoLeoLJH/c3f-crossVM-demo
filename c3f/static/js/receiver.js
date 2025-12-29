var offscreenCan;
var gl;
var Canvas;
var myWorker;
var sender_browser;
var receiver_browser;
var abc={};
var serverWorker;
var fixedBitSequence;
window.onload = mainWithThreads;

function copyInputValue() {
  const value = document.getElementById("binaryResult").textContent;


  navigator.clipboard.writeText(value)
    .then(() => {
      console.log("Copied to clipboard: " + value);
    })
    .catch(err => {
      console.error("Failed to copy: ", err);
    });
}

function fnBrowserDetect() {
  let userAgent = navigator.userAgent;
  let browserName;

  if(userAgent.match(/edg/i)){
    browserName = "edge";
  }else if(userAgent.match(/opr/i)){
    browserName = "opera";
  }else if(userAgent.match(/chrome|chromium|crios/i)){
    browserName = "chrome";
  }else if(userAgent.match(/firefox|fxios/i)){
    browserName = "firefox";
  }else if(userAgent.match(/safari/i)){
    browserName = "safari";
  }else{
    browserName="No browser detection";
  }
  if (navigator.brave) browserName = "brave";
  return browserName;
}

function isWebRTCSupported() {
	return !!(window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection);
  }
  
function isTorBrowser() {
	let userAgent = navigator.userAgent;


	if (userAgent.includes("TorBrowser")) {
		return true;
	}


	if (!isWebRTCSupported()) {
		return true;
	}

	return false;
}
  

function receiveInit()
{
  browserHere=fnBrowserDetect();
  if(browserHere=="firefox"){
	if(isTorBrowser())
	{
		browserHere="tor";
	}
  }
  console.log("browserHere=",browserHere);
  myWorker=new Worker("static/js/workers/probeWorker.js"); 
  myWorker.addEventListener('message',handleMessage);
  Canvas=document.getElementById("Canvas");
  offscreenCan=Canvas.transferControlToOffscreen();
  myWorker.postMessage({ canvas: offscreenCan}, [offscreenCan]);
  
}

function handleSubMessage()
{
  
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function mainWithThreads()
{
  receiveInit();
} 

function handleMessage(msg)
{
  if(msg.data[0]=='Receive_Sequence')
  {
    fixedBitSequence=msg.data[1];
    convertBackToUnicode();
  }else if(msg.data[0]=='WebglOK')
  {
    myWorker.postMessage(["browser",browserHere]);
  } 
}

function convertBackToUnicode() {
    if (!fixedBitSequence) {
        alert("Please change into 512 bits sequence！");
        return;
    }

    const binaryData = fixedBitSequence;


    const byteArray = [];
    for (let i = 0; i < binaryData.length; i += 8) {
        const byte = binaryData.slice(i, i + 8);
        byteArray.push(parseInt(byte, 2));
    }
    document.getElementById('binaryResult').textContent = binaryData;
}