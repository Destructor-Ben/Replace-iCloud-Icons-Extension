// Async function to load an image
function LoadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = src
    img.onload = () => resolve(img)
    img.onerror = (err) => reject(err)
  })
}

// Function to dynamically scale and draw text
// Ripped from icloud.com
async function DrawText(ctx, text, fontFamily, fontWeight, color, fontSize, yPosition, canvasWidth, maxWidth) {
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
    let textWidth = ctx.measureText(text).width
    let adjustedFontSize = fontSize

    // Scale down the font size if the text is too wide
    while (textWidth >= maxWidth && adjustedFontSize > 0) {
        adjustedFontSize -= 1
        ctx.font = `${fontWeight} ${adjustedFontSize}px ${fontFamily}`
        textWidth = ctx.measureText(text).width
    }

    ctx.textAlign = 'center'
    ctx.fillStyle = color
    ctx.fillText(text, canvasWidth / 2, yPosition)
}

// Creates the calendar icon for the current date
// Ripped from icloud.com
async function CreateCalendarIcon() {
  const iconSize = 80 // Same as the other icons
  const dayOfWeekFont = 'SFText Calendar Day Of Week'
  const dayOfMonthFont = 'SFDisplay Calendar Day Of Month'

  // Get the date
  const currentDate = new Date()
  const dayOfWeek = currentDate.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()
  const dayOfMonth = currentDate.getDate().toString()

  // Create a canvas
  const canvas = document.createElement('canvas')
  canvas.width = iconSize * window.devicePixelRatio
  canvas.height = iconSize * window.devicePixelRatio
  const ctx = canvas.getContext('2d')

  // Calculate a bunch of stuff
  const dayOfWeekFontSize = Math.floor(11 * iconSize / 60) * window.devicePixelRatio
  const dayOfMonthFontSize = Math.floor(36 * iconSize / 60) * window.devicePixelRatio
  const dayOfWeekY = 0.3 * iconSize * window.devicePixelRatio
  const dayOfMonthY = 0.817 * iconSize * window.devicePixelRatio

  // Load resources
  const backgroundImg = await LoadImage(GetNormalIconUrl('calendar'))
  await Promise.all([
    document.fonts.load(`500 ${dayOfWeekFontSize}px ${dayOfWeekFont}`),
    document.fonts.load(`200 ${dayOfMonthFontSize}px ${dayOfMonthFont}`)
  ])

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw background
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height)

  // Draw text
  await DrawText(ctx, dayOfWeek, dayOfWeekFont, '500', '#FF3B30', dayOfWeekFontSize, dayOfWeekY, canvas.width, canvas.width)
  await DrawText(ctx, dayOfMonth, dayOfMonthFont, '200', '#030303', dayOfMonthFontSize, dayOfMonthY, canvas.width, canvas.width)

  // Convert to a URL
  return canvas.toDataURL()
}

function GetNormalIconUrl(currentApp) {
  return chrome.runtime.getURL('img/' + currentApp + '.png')
}

async function GetIconUrl() {
  const url = location.href
  const testString = 'icloud.com'
  const sliceIndex = url.indexOf(testString) + testString.length
  const slicedUrl = url.slice(sliceIndex)
  const splitUrl = slicedUrl.split('/')
  let currentApp = splitUrl[1]

  // Handle icloud.com
  if (currentApp === null || currentApp === undefined || currentApp === '') {
    currentApp = 'iclouddrive'
  }

  // Handle canlendar
  if (currentApp === 'calendar') {
    return CreateCalendarIcon()
  }

  return GetNormalIconUrl(currentApp)
}

async function ReplaceIcon() {
  const head = document.querySelector('head')

  // Delete existing elements
  const iconElements = document.querySelectorAll('link[rel="icon"]')
  iconElements.forEach(e => e.remove())

  // Create and append the element
  const iconUrl = await GetIconUrl()
  const element = document.createElement('link')
  element.setAttribute('type', 'image/png')
  element.setAttribute('rel', 'icon')
  element.setAttribute('href', iconUrl)
  head.appendChild(element)

  console.log('Replaced favicon')
}

// Replace it the first time
ReplaceIcon()

// Setup a callback that allows it to update whenever the url is updated
console.log('Registering message callback')
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.method != 'UpdateFaviconFromEXT') {
    sendResponse({})
    return
  }

  console.log('Recieved message to update favicon')
  ReplaceIcon()
  sendResponse({message: 'Message to update icon recieved'})
})