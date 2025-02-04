function GetIconUrl() {
  // TODO: make this work with all of the calendar icons
  const url = location.href
  const testString = 'icloud.com'
  const sliceIndex = url.indexOf(testString) + testString.length
  const slicedUrl = url.slice(sliceIndex)
  const splitUrl = slicedUrl.split('/')
  let currentApp = splitUrl[1]

  if (currentApp === null || currentApp === undefined || currentApp === '') {
    currentApp = 'iclouddrive'
  }

  return chrome.runtime.getURL('img/' + currentApp + '.png')
}

function ReplaceIcon() {
  const head = document.querySelector('head')

  // Delete existing elements
  const iconElements = document.querySelectorAll('link[rel="icon"]')
  iconElements.forEach(e => e.remove())

  // Create and append the element
  const element = document.createElement('link')
  element.setAttribute('type', 'image/png')
  element.setAttribute('rel', 'icon')
  element.setAttribute('href', GetIconUrl())
  head.appendChild(element)

  console.log('Replaced favicon')
}

// Replace it the first time
ReplaceIcon()

// Setup a callback that allows it to update whenever the url is updated
console.log('Registering message callback')
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.method != "UpdateFaviconFromEXT") {
    sendResponse({});
    return
  }

  console.log('Recieved message to update favicon')
  ReplaceIcon()
  sendResponse({message: 'Message to update icon recieved'})
});