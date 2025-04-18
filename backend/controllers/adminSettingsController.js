const AdminSetting = require('../models/adminSettingsModel')
const { ActivityLog, Actions } = require('../models/activityLogModel')
const Archive = require('../models/archiveModel')

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
    const { address, coordinates, systemEmail, downPayment, roomStart, roomEnd, phoneNumbers, socials, emails, adminEmail } = await req.body
    let editedParts = []

    try {
        const oldSettings = await AdminSetting.findOne({})

        const adminSetting = await AdminSetting.findOneAndUpdate({}, { address, coordinates, systemEmail, downPayment, roomStart, roomEnd, phoneNumbers, socials, emails }, { new: true })

        const handleArchive = async (type, value, data) => {
            await Archive.create({ adminEmail, type, model: "AdminSetting", value, data })
        }

        // activity log
        socials && oldSettings.socials != socials && editedParts.push("socials")
        emails && oldSettings.emails != emails && editedParts.push("emails")
        phoneNumbers && oldSettings.phoneNumbers != phoneNumbers && editedParts.push("phoneNumbers")
        downPayment && oldSettings.downPayment != downPayment && editedParts.push("downPayment")
        roomStart && oldSettings.roomStart != roomStart && editedParts.push("roomStart")
        roomEnd && oldSettings.roomEnd != roomEnd && editedParts.push("roomEnd")
        systemEmail && oldSettings.systemEmail != systemEmail && editedParts.push("systemEmail")
        address && oldSettings.address != address && editedParts.push("address")
        coordinates && oldSettings.coordinates != coordinates && editedParts.push("coordinates")

        if (editedParts.length > 0) {
            await ActivityLog.create({
                adminEmail,
                action: [Actions.ADMIN, Actions.UPDATED],
                activity: `Changed settings. ${editedParts.map(part => {
                    switch (part) {
                        case "downPayment":
                            return ` changed down payment from ${oldSettings.downPayment * 100}% to ${downPayment * 100}%`
                        case "roomStart":
                            return ` changed room start from ${oldSettings.roomStart} to ${roomStart}`
                        case "roomStart":
                            return ` changed room end from ${oldSettings.roomEnd} to ${roomEnd}`
                        case "systemEmail":
                            return ` changed system email from ${oldSettings.systemEmail} to ${systemEmail}`
                        case "address":
                            return ` changed address from ${oldSettings.address} to ${address}`
                        case "coordinates":
                            return ` changed coordinates from ${oldSettings.coordinates} to ${coordinates}`
                        case "emails":
                            if (oldSettings.emails.length === emails.length) {
                                return ` changed email from ${oldSettings.emails.filter(email => !emails.includes(email))[0].url} to ${emails.filter(email => !oldSettings.emails.includes(email))[0].url}`
                            } else if (oldSettings.emails.length > emails.length) {
                                handleArchive("email", `${oldSettings.emails.filter(email => !emails.includes(email))[0].url}`, oldSettings.emails.filter(email => !emails.includes(email))[0])
                                return ` deleted an email ${oldSettings.emails.filter(email => !emails.includes(email))[0].url}`
                            } else {
                                return ` added an email ${emails[emails.length - 1].url}`
                            }
                        case "phoneNumbers":
                            if (oldSettings.phoneNumbers.length === phoneNumbers.length) {
                                let oldPhoneNumber
                                let newPhoneNumber

                                oldSettings.phoneNumbers.forEach(element => {
                                    phoneNumbers.forEach(element2 => {
                                        if (element.sim !== element2.sim || element.number !== element2.number) {
                                            oldPhoneNumber = element
                                            newPhoneNumber = element2
                                        }
                                    })
                                })
                                return ` changed phone number from ${oldPhoneNumber.sim} ${oldPhoneNumber.number} to ${newPhoneNumber.sim} ${newPhoneNumber.number}`
                            } else if (oldSettings.phoneNumbers.length > phoneNumbers.length) {
                                let phoneNumber

                                oldSettings.phoneNumbers.forEach(element => {
                                    let isExist = false

                                    phoneNumbers.forEach(element2 => {
                                        if (element.sim === element2.sim && element.number === element2.number) {
                                            isExist = true
                                        }
                                    })

                                    if (!isExist) {
                                        phoneNumber = element
                                    }
                                })
                                handleArchive("number", `${phoneNumber.sim} ${phoneNumber.number}`, phoneNumber)
                                return ` deleted a phone number ${phoneNumber.sim} ${phoneNumber.number}`
                            } else {
                                const phoneNumber = phoneNumbers[phoneNumbers.length - 1]
                                return ` added a phone number ${phoneNumber.sim} ${phoneNumber.number}`
                            }
                        case "socials":
                            if (oldSettings.socials.length === socials.length) {
                                let oldSocial
                                let newSocial

                                oldSettings.socials.forEach(element => {
                                    socials.forEach(element2 => {
                                        if (element.app !== element2.app || element.link !== element2.link) {
                                            oldSocial = element
                                            newSocial = element2
                                        }
                                    })
                                })
                                return ` changed social media from ${oldSocial.app} ${oldSocial.link} to ${newSocial.app} ${newSocial.link}`
                            } else if (oldSettings.socials.length > socials.length) {
                                let social

                                oldSettings.socials.forEach(element => {
                                    let isExist = false

                                    socials.forEach(element2 => {
                                        if (element.app === element2.app && element.link === element2.link) {
                                            isExist = true
                                        }
                                    })

                                    if (!isExist) {
                                        social = element
                                    }
                                })
                                handleArchive("social", `${social.app} ${social.link}`, social)
                                return ` deleted a social media ${social.app} ${social.link}`
                            } else {
                                const social = socials[socials.length - 1]
                                return ` added a social media ${social.app} ${social.link}`
                            }
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