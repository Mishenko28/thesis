const { Admin, Roles } = require('../models/adminModel')
const Archive = require('../models/archiveModel')
const { ActivityLog, Actions } = require('../models/activityLogModel')


const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')

const createToken = (id) => {
    return jwt.sign({ id }, "LagoonThesis", { expiresIn: '1d' })
}




// LOGIN
let attempts = {}

const loginAdmin = async (req, res) => {
    const { email, password } = await req.body
    const ip = await req.ip

    if (!attempts[ip]) attempts[ip] = 8
    else attempts[ip]--

    try {

        const admin = await Admin.findOne({ email })

        if (!admin) {
            const deletedAdmin = await Archive.findOne({ type: "admin", "data.email": email })

            if (deletedAdmin) {
                if (attempts[ip] <= 3) throw Error(`Warning you have only ${attempts[ip]} attempts left`)
                throw Error("This admin account has been deleted")
            }
        }

        if (!admin) {
            if (attempts[ip] <= 3) throw Error(`Warning you have only ${attempts[ip]} attempts left`)
            throw Error("Admin not Found")
        }

        const match = await bcrypt.compare(password, admin.password)

        if (!match) {
            if (attempts[ip] <= 3) throw Error(`Warning you have only ${attempts[ip]} attempts left`)
            throw Error("Incorrect password")
        }

        delete attempts[ip]
        const token = createToken(admin._id)

        // activity log
        await ActivityLog.create({ adminEmail: email, action: [Actions.LOGGED_IN, Actions.ADMIN], activity: "Logged in." })

        res.status(200).json({ email, token, profile: admin.img, role: admin.role })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// ADD NEW ADMIN
const addNewAdmin = async (req, res) => {
    const { email, password, img, role, name, sex, age, contact, adminEmail } = await req.body

    try {
        const match = await Admin.findOne({ email })

        if (match) throw Error("Admin already exist")
        if (!validator.isEmail(email)) throw Error("email is not valid")
        if (!validator.isStrongPassword(password, { minUppercase: 0, minNumbers: 0, minSymbols: 0 })) throw Error("password must atleast 8 characters")


        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        const admin = await Admin.create({ email, password: hash, img, role, personalData: { name, sex, age, contact } })

        // activity log
        await ActivityLog.create({ adminEmail, action: [Actions.ADMIN, Actions.CREATED], activity: `Added a new admin with the email of "${email}"` })

        res.status(200).json({ admin })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE ADMIN
const deleteAdmin = async (req, res) => {
    const { _id, password, adminEmail } = await req.body

    try {
        const admin = await Admin.findOne({ email: adminEmail })
        const match = await bcrypt.compare(password, admin.password)

        if (!match) throw Error("Incorrect password")

        const deletedAdmin = await Admin.findOneAndDelete({ _id })

        // archive
        if (admin) {
            await Archive.create({ adminEmail, type: "admin", data: deletedAdmin })
        }

        // activity log
        await ActivityLog.create({ adminEmail, action: [Actions.ADMIN, Actions.DELETED], activity: `Deleted an admin with the email of "${deletedAdmin.email}"` })

        res.status(200).json({ admin: deletedAdmin })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// RESTORE ADMIN
const restoreAdmin = async (req, res) => {
    const { _id, data, adminEmail } = await req.body

    try {
        const admin = await Admin.create({ ...data })

        // archive
        if (admin) {
            await Archive.findOneAndDelete({ _id })
        }

        // activity log
        await ActivityLog.create({ adminEmail, action: [Actions.ADMIN, Actions.RESTORED], activity: `Restored an admin with the email of "${admin.email}"` })

        res.status(200).json({ admin })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// UPDATE ADMIN PROFILE
const updateAdmin = async (req, res) => {
    const { _id, email, role, img, name, sex, age, contact, adminEmail } = await req.body
    let editedParts = []

    try {
        const exist = await Admin.findOne({ _id: { $ne: _id }, email })
        if (exist) throw Error("Admin already exist")

        const oldAdmin = await Admin.findOne({ _id })

        const admin = await Admin.findOneAndUpdate({ _id }, { email, img, role, personalData: { name, sex, age, contact } }, { new: true })

        // activity log
        JSON.stringify(oldAdmin.role) !== JSON.stringify(role) && editedParts.push("role")
        oldAdmin.img !== img && editedParts.push("image")
        oldAdmin.email !== email && editedParts.push("email")
        oldAdmin.personalData.name !== name && editedParts.push("name")
        oldAdmin.personalData.sex !== sex && editedParts.push("sex")
        oldAdmin.personalData.age !== age && editedParts.push("age")
        oldAdmin.personalData.contact !== contact && editedParts.push("contact")

        if (editedParts.length > 0) {
            await ActivityLog.create({
                adminEmail,
                action: [Actions.ADMIN, Actions.UPDATED],
                activity: `Changed information of admin ${oldAdmin.email}. ${editedParts.map(part => {
                    switch (part) {
                        case "role":
                            return ` changed role from "${oldAdmin.role.map(a => a)}" to "${role.map(a => a)}"`
                        case "image":
                            return ` changed Profile Picture`
                        case "email":
                            return ` changed email from "${oldAdmin.email}" to "${email}"`
                        case "name":
                            return ` changed name from "${oldAdmin.personalData.name}" to "${name}"`
                        case "sex":
                            return ` changed sex from "${oldAdmin.personalData.sex}" to "${sex}"`
                        case "age":
                            return ` changed age from "${oldAdmin.personalData.age}" to "${age}"`
                        case "contact":
                            return ` changed contact from "${oldAdmin.personalData.contact}" to "${contact}"`
                    }
                })} `
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
    const email = adminEmail

    try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        const admin = await Admin.findOneAndUpdate({ email }, { email, password: hash }, { new: true })

        // activity log
        await ActivityLog.create({ adminEmail, action: [Actions.ADMIN, Actions.UPDATED], activity: `Changed password.` })

        res.status(200).json({ admin })
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

// GET ALL ROLES
const getAllRoles = async (_, res) => {
    try {
        res.status(200).json({ Roles })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// GET ROLE BY EMAIL
const getRole = async (req, res) => {
    const { email } = await req.query

    try {
        const role = await Admin.findOne({ email }).select('role')

        res.status(200).json({ role: role.role })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// GET SINGLE ADMIN
const getSingleAdmin = async (req, res) => {
    const { email } = await req.query

    try {
        const admin = await Admin.findOne({ email })

        res.status(200).json({ admin })
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
    updatePassword,
    getAllRoles,
    getRole,
    getSingleAdmin,
}