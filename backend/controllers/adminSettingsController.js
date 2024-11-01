const AdminSetting = require('../models/adminSettingsModel')
const ActivityLog = require('../models/activityLogModel')

const getSettings = async (_, res) => {
    try {
        let adminSetting = await AdminSetting.findOne({})

        while (!adminSetting) {
            await AdminSetting.create({})

            adminSetting = await AdminSetting.findOne({})
        }
        res.status(200).json({ adminSetting })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const updateSettings = async (req, res) => {
    const { downPayment, roomTypes, roomStart, adminEmail } = await req.body
    let editedParts = []

    try {
        const oldSettings = await AdminSetting.findOne({})

        const adminSetting = await AdminSetting.findOneAndUpdate({}, { downPayment, roomTypes, roomStart }, { new: true })

        // activity log
        oldSettings.downPayment != downPayment && editedParts.push("downPayment")
        oldSettings.roomTypes != roomTypes && editedParts.push("roomTypes")
        oldSettings.roomStart != roomStart && editedParts.push("roomStart")

        if (editedParts.length > 0) {
            await ActivityLog.create({
                adminEmail,
                activity: `Changed settings. ${editedParts.map(part => {
                    switch (part) {
                        case "downPayment":
                            return `(down payment: from ${oldSettings.downPayment} to ${downPayment})`
                        case "roomTypes":
                            return `(room types: from ${oldSettings.roomTypes} to ${roomTypes})`
                        case "roomStart":
                            return `(room start: from ${oldSettings.roomStart} to ${roomStart})`
                    }
                })}`
            })
        }

        res.status(200).json({ adminSetting })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    getSettings,
    updateSettings
}