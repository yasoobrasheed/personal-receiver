-- This script is used to watch the camera and send a webhook to the server when the camera is on or off.
-- You will need to install hammerspoon for this
-- Then you'll need to set it at ~/.hammerspoon/init.lua

-- Camera webhook configuration
local webhookUrl = "http://localhost:3000/api/camera"
local cameraInUse = false

-- Filter: only watch these cameras (empty = watch all)
local watchCameras = {
    "FaceTime HD Camera",
    -- "Webcam",
}

local function sendCameraEvent(isOn)
    local event = isOn and "camera_on" or "camera_off"
    local body = hs.json.encode({ event = event })
    print("Sending webhook: " .. event)

    hs.http.asyncPost(webhookUrl, body, { ["Content-Type"] = "application/json" },
        function(status, response, headers)
            print("Webhook response - status: " .. tostring(status))
            if response then print("Response: " .. response) end
        end)
end

-- Poll camera state every second
cameraTimer = hs.timer.new(1, function()
    local inUse = false
    for _, cam in ipairs(hs.camera.allCameras()) do
        local shouldWatch = #watchCameras == 0
        for _, name in ipairs(watchCameras) do
            if cam:name() == name then
                shouldWatch = true
                break
            end
        end
        if shouldWatch and cam:isInUse() then
            inUse = true
            break
        end
    end
    if inUse ~= cameraInUse then
        cameraInUse = inUse
        print("Camera state changed: " .. (inUse and "ON" or "OFF"))
        sendCameraEvent(inUse)
    end
end)
cameraTimer:start()
print("Camera polling started")