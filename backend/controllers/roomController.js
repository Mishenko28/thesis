const Room = require('../models/roomModel')
const Archive = require('../models/archiveModel')
const { ActivityLog, Actions } = require('../models/activityLogModel')

// GET ALL ROOMS
const getAllRooms = async (_, res) => {
    try {
        const rooms = await Room.find({})

        res.status(200).json({ rooms })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// ADD ROOM
const addRoom = async (req, res) => {
    const { roomNo, img, roomType, caption, active, adminEmail } = await req.body

    try {
        const existingRoomNo = await Room.findOne({ roomType, roomNo })
        if (existingRoomNo) throw new Error("Room number already exists.")

        const room = await Room.create({ roomNo, img, roomType, caption, active })

        // activity log
        await ActivityLog.create({ adminEmail, action: [Actions.ROOM, Actions.CREATED], activity: `Added a new room with a room number of ${roomNo} in ${roomType} room type` })

        res.status(200).json({ room })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// UPDATE ROOM
const updateRoom = async (req, res) => {
    const { _id, roomNo, img, caption, active, roomType, adminEmail } = await req.body
    let editedParts = []

    try {
        const existingRoomNo = await Room.findOne({ _id: { $ne: _id }, roomNo, roomType })
        if (existingRoomNo) throw new Error("Room number already exists.")

        const oldRoom = await Room.findOne({ _id })

        const room = await Room.findOneAndUpdate({ _id }, { roomNo, img, caption, active }, { new: true })

        // activity log
        roomNo && oldRoom.roomNo != roomNo && editedParts.push("roomNo")
        img && oldRoom.img != img && editedParts.push("img")
        caption || caption === "" && oldRoom.caption != caption && editedParts.push("caption")
        active !== null && oldRoom.active != active && editedParts.push("active")

        if (editedParts.length > 0) {
            await ActivityLog.create({
                adminEmail,
                action: [Actions.ROOM, Actions.UPDATED],
                activity: `Changed properties of room ${oldRoom.roomNo} in ${oldRoom.roomType} roomtype.${editedParts.map(part => {
                    switch (part) {
                        case "roomNo":
                            return ` changed room number from ${oldRoom.roomNo} to ${roomNo}`
                        case "img":
                            return ` changed main image`
                        case "caption":
                            return ` changed caption from "${oldRoom.caption}" to "${caption}"`
                        case "active":
                            return ` changed active status to ${active ? "active" : "inactive"}`
                    }
                })}`
            })
        }

        res.status(200).json({ room })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE ROOM
const deleteRoom = async (req, res) => {
    const { _id, adminEmail } = await req.body

    try {
        const room = await Room.findOneAndDelete({ _id }, { new: true })

        // archive
        if (room) {
            await Archive.create({ adminEmail, type: "room", data: room })
        }

        // activity log
        await ActivityLog.create({ adminEmail, action: [Actions.ROOM, Actions.DELETED], activity: `Deleted a room with a room number of ${room.roomNo} in ${room.roomType} room type` })

        res.status(200).json({ room })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// RESTORE ROOM
const restoreRoom = async (req, res) => {
    const { _id, data, adminEmail } = await req.body

    try {
        const room = await Room.create({ ...data })

        // archive
        if (room) {
            await Archive.findOneAndDelete({ _id })
        }

        // activity log
        await ActivityLog.create({ adminEmail, action: [Actions.ROOM, Actions.RESTORED], activity: `Restored a room with a room number of ${room.roomNo} in ${room.roomType} roomtype` })

        res.status(200).json({ room })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    getAllRooms,
    addRoom,
    updateRoom,
    deleteRoom,
    restoreRoom
}