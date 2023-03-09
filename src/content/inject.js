var contentJs = chrome.extension.getURL('js/content.js');
var script = document.createElement('script');
script.setAttribute('type', 'text/javascript');
script.setAttribute('src', contentJs);
(document.head || document.documentElement).appendChild(script);
script.onload = () => script.remove();

document.addEventListener('chromeMessageRequest', (event) => {
  var data = event.detail;  var message = data.msg;
  chrome.runtime.sendMessage(message, (response) => {
    document.dispatchEvent(new CustomEvent("chromeMessageResponse", {detail: {id: data.id, response: response}}));
  });
  
});