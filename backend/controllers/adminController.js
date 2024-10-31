const Admin = require('../models/adminModel')
const Archive = require('../models/archiveModel')
const ActivityLog = require('../models/activityLogModel')

const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')

const createToken = (id) => {
    return jwt.sign({ id }, "LagoonThesis", { expiresIn: '1d' })
}


// LOGIN
const loginAdmin = async (req, res) => {
    const { email, password } = await req.body

    try {
        const admin = await Admin.findOne({ email })

        if (!admin) {
            throw Error("Admin not Found")
        }

        const match = await bcrypt.compare(password, admin.password)

        if (!match) {
            throw Error("Incorrect password")
        }

        const token = createToken(admin._id)

        // activity log
        await ActivityLog.create({ adminEmail: email, activity: "Logged in." })

        res.status(200).json({ email, token })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// ADD NEW ADMIN
const addNewAdmin = async (req, res) => {
    const { email, password, position, name, sex, age, contact, adminEmail } = await req.body

    try {
        const match = await Admin.findOne({ email })

        if (match) {
            throw Error("Admin already exist")
        }
        if (!validator.isEmail(email)) {
            throw Error("email is not valid")
        }
        if (!validator.isStrongPassword(password, { minUppercase: 0, minNumbers: 0, minSymbols: 0 })) {
            throw Error("password must atleast 8 characters")
        }


        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        const admin = await Admin.create({ email, password: hash, position, personalData: { name, sex, age, contact } })

        // activity log
        await ActivityLog.create({ adminEmail, activity: `Added a new admin. (${email})` })

        res.status(200).json({ admin })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE ADMIN
const deleteAdmin = async (req, res) => {
    const { _id, adminEmail } = await req.body

    try {
        const admin = await Admin.findOneAndDelete({ _id })

        // archive
        if (admin) {
            await Archive.create({ adminEmail, type: "admin", data: admin })
        }

        // activity log
        await ActivityLog.create({ adminEmail, activity: `Deleted an admin. (${admin.email})` })

        res.status(200).json({ admin })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// RESTORE ADMIN
const restoreAdmin = async (req, res) => {
    const { _id, data, adminEmail } = await req.body

    try {
        const admin = await Admin.create({ ...data })

        if (admin) {
            await Archive.findOneAndDelete({ _id })
        }

        // activity log
        await ActivityLog.create({ adminEmail, activity: `Restored an admin. (${admin.email})` })

        res.status(200).json({ admin })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// UPDATE ADMIN PROFILE
const updateAdmin = async (req, res) => {
    const { _id, email, position, name, sex, age, contact, adminEmail } = await req.body
    let editedParts = []

    try {
        const oldAdmin = await Admin.findOne({ _id })

        const admin = await Admin.findOneAndUpdate({ _id }, { email, position, personalData: { name, sex, age, contact } }, { new: true })

        // activity log
        oldAdmin.email != email && editedParts.push("email")
        oldAdmin.position != position && editedParts.push("position")
        oldAdmin.personalData.name != name && editedParts.push("name")
        oldAdmin.personalData.sex != sex && editedParts.push("sex")
        oldAdmin.personalData.age != age && editedParts.push("age")
        oldAdmin.personalData.contact != contact && editedParts.push("contact")

        if (editedParts.length > 0) {
            await ActivityLog.create({
                adminEmail,
                activity: `Changed profile. (${editedParts.map(part => {
                    switch (part) {
                        case "email":
                            return `email: ${oldAdmin.email} to ${email}`
                        case "position":
                            return `position: ${oldAdmin.position} to ${position}`
                        case "name":
                            return `name: ${oldAdmin.personalData.name} to ${name}`
                        case "sex":
                            return `sex: ${oldAdmin.personalData.sex} to ${sex}`
                        case "age":
                            return `age: ${oldAdmin.personalData.age} to ${age}`
                        case "contact":
                            return `contact: ${oldAdmin.personalData.contact} to ${contact}`
                    }
                })})`
            })
        }

        res.status(200).json({ admin })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// CHANGE PASSWORD
const updatePassword = async (req, res) => {
    const { password, adminEmail } = await req.body

    try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        const admin = await Admin.findOneAndUpdate({ email }, { email, password: hash }, { new: true })

        // activity log
        await ActivityLog.create({ adminEmail, activity: `Changed password.` })

        res.status(400).json({ admin })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// GET ALL ADMIN
const getAllAdmin = async (_, res) => {
    try {
        const admins = await Admin.find({})

        res.status(200).json({ admins })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    loginAdmin,
    addNewAdmin,
    deleteAdmin,
    restoreAdmin,
    updateAdmin,
    getAllAdmin,
    updatePassword
}