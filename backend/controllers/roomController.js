const Room = require('../models/roomModel')

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
    const { img, roomType, rate, addFeePerPerson, maxPerson, caption } = await req.body

    try {
        const room = await Room.create({ img, roomType, rate, addFeePerPerson, maxPerson, caption })

        res.status(400).json({ room })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// UPDATE ROOM
const updateRoom = async (req, res) => {
    const { _id, img, roomType, rate, addFeePerPerson, maxPerson, caption } = await req.body

    try {
        const room = await Room.findOneAndUpdate({ _id }, { img, roomType, rate, addFeePerPerson, maxPerson, caption }, { new: true })

        res.status(400).json({ room })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE ROOM
const deleteRoom = async (req, res) => {
    const _id = await req.query._id

    try {
        const room = await Room.findOneAndDelete({ _id })

        res.status(400).json({ room })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    getAllRooms,
    addRoom,
    updateRoom,
    deleteRoom
}