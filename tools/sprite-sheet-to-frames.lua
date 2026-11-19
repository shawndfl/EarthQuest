-- Convert a transparency-separated sprite sheet into an Aseprite animation.
-- Run from File > Scripts after opening the sprite sheet in Aseprite.

local sourceSprite = app.sprite

if not sourceSprite then
  app.alert("Open a sprite sheet before running this script.")
  return
end

local dialog = Dialog("Sprite Sheet to Frames")
dialog:number { id = "duration", label = "Frame duration (ms):", text = "100", decimals = 0 }
dialog:button { id = "convert", text = "Convert" }
dialog:button { id = "cancel", text = "Cancel" }
dialog:show()

local options = dialog.data
if not options.convert then
  return
end

local duration = math.floor(tonumber(options.duration) or -1)
if duration < 1 then
  app.alert("Frame duration must be greater than zero.")
  return
end

-- Render the active frame so visible layers are combined exactly as displayed.
local sourceImage = Image(sourceSprite.spec)
sourceImage:drawSprite(sourceSprite, app.frame.frameNumber, Point(0, 0))

local function isTransparent(x, y)
  local pixel = sourceImage:getPixel(x, y)

  if sourceSprite.colorMode == ColorMode.INDEXED then
    return pixel == sourceSprite.transparentColor
  elseif sourceSprite.colorMode == ColorMode.GRAY then
    return app.pixelColor.grayaA(pixel) == 0
  end

  return app.pixelColor.rgbaA(pixel) == 0
end

local function rowIsTransparent(y)
  for x = 0, sourceImage.width - 1 do
    if not isTransparent(x, y) then
      return false
    end
  end
  return true
end

local function columnIsTransparent(x, top, bottom)
  for y = top, bottom do
    if not isTransparent(x, y) then
      return false
    end
  end
  return true
end

-- Find occupied row bands from top to bottom. Within each band, transparent
-- columns divide the frames, giving row-major order without a fixed cell size.
local regions = {}
local y = 0

while y < sourceImage.height do
  while y < sourceImage.height and rowIsTransparent(y) do
    y = y + 1
  end

  if y < sourceImage.height then
    local top = y
    while y < sourceImage.height and not rowIsTransparent(y) do
      y = y + 1
    end
    local bottom = y - 1
    local x = 0

    while x < sourceImage.width do
      while x < sourceImage.width and columnIsTransparent(x, top, bottom) do
        x = x + 1
      end

      if x < sourceImage.width then
        local left = x
        while x < sourceImage.width and not columnIsTransparent(x, top, bottom) do
          x = x + 1
        end

        table.insert(regions, Rectangle(left, top, x - left, bottom - top + 1))
      end
    end
  end
end

if #regions == 0 then
  app.alert("No non-transparent frame regions were found.")
  return
end

local outputWidth = 0
local outputHeight = 0
for _, region in ipairs(regions) do
  outputWidth = math.max(outputWidth, region.width)
  outputHeight = math.max(outputHeight, region.height)
end

local outputSpec = ImageSpec(sourceSprite.spec)
outputSpec.width = outputWidth
outputSpec.height = outputHeight

local outputSprite = Sprite(outputSpec)
local outputLayer = outputSprite.layers[1]
outputLayer.name = "Animation"

if sourceSprite.colorMode == ColorMode.INDEXED then
  outputSprite:setPalette(sourceSprite.palettes[1])
  outputSprite.transparentColor = sourceSprite.transparentColor
end

app.transaction("Sprite sheet to frames", function()
  for index, region in ipairs(regions) do
    local image = Image(sourceImage, region)
    local frame

    if index == 1 then
      frame = outputSprite.frames[1]
    else
      frame = outputSprite:newEmptyFrame(index)
    end

    outputSprite:newCel(outputLayer, frame, image, Point(0, 0))
    frame.duration = duration / 1000
  end
end)

-- Sprite() focuses the new document; select its first animation frame.
app.frame = outputSprite.frames[1]
app.refresh()

app.alert("Created " .. #regions .. " animation frames.")
