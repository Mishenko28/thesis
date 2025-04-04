const Book = require('../models/bookModel')
const AdminSetting = require('../models/adminSettingsModel')
const { ActivityLog, Actions } = require('../models/activityLogModel')
const User = require('../models/userModel')
const UserPersonalData = require('../models/userPersonalDataModel')
const sendMail = require('../Utility/nodeMailer')
const { Admin } = require('../models/adminModel')
const Payment = require('../models/paymentModel')
const { format } = require('date-fns')

// STATUS
// pending
// confirmed
// ongoing
// cancelled
// noshow
// expired
// completed


// GET TOTAL BOOKS
const getTotalBooks = async (_, res) => {
    try {
        const pending = await Book.countDocuments({ status: "pending" })
        const confirmed = await Book.countDocuments({ status: "confirmed" })
        const ongoing = await Book.countDocuments({ status: "ongoing" })
        const completed = await Book.countDocuments({ status: "completed" })
        const noshow = await Book.countDocuments({ status: "noshow" })
        const cancelled = await Book.countDocuments({ status: "cancelled" })
        const expired = await Book.countDocuments({ status: "expired" })

        res.status(200).json({ pending, confirmed, completed, ongoing, cancelled, noshow, expired })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// GET TOTAL BOOKS BY USER
const getTotalBooksByUser = async (req, res) => {
    const { email } = req.query

    try {
        const { _id: userId } = await User.findOne({ email })

        const pending = await Book.countDocuments({ status: "pending", userId })
        const confirm = await Book.countDocuments({ status: "confirmed", userId })
        const ongoing = await Book.countDocuments({ status: "ongoing", userId })
        const complete = await Book.countDocuments({ status: "completed", userId })
        const cancel = await Book.countDocuments({ status: "cancelled", userId })

        res.status(200).json({ pending, confirm, ongoing, complete, cancel })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// GET ALL PENDING
const getPending = async (_, res) => {
    try {
        let books = await Book.find({ status: "pending" })

        books = await Promise.all(books.map(async (book) => {
            const { email } = await User.findOne({ _id: book.userId })
            const user = await UserPersonalData.findOne({ email: email })
            const newBook = book.toObject()

            newBook.user = user

            return newBook
        }))

        res.status(200).json(books)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// GET ALL EXPIRED
const getExpired = async (req, res) => {
    const { month } = req.query

    try {
        let books = await Book.find({ status: "expired" })

        books = await Promise.all(books.map(async (book) => {
            if (book.from.getMonth() !== new Date(month).getMonth() && book.to.getMonth() !== new Date(month).getMonth()) {
                return null
            }

            if (book.from.getFullYear() !== new Date(month).getFullYear() && book.to.getFullYear() !== new Date(month).getFullYear()) {
                return null
            }

            const { email } = await User.findOne({ _id: book.userId })
            const user = await UserPersonalData.findOne({ email: email })
            const newBook = book.toObject()

            newBook.user = user

            return newBook
        }))

        books = books.filter(book => book !== null)

        res.status(200).json(books)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// GET ALL CONFIRMED
const getConfirmed = async (_, res) => {
    try {
        let books = await Book.find({ status: "confirmed" })

        books = await Promise.all(books.map(async (book) => {
            const { email } = await User.findOne({ _id: book.userId })
            const user = await UserPersonalData.findOne({ email: email })
            const newBook = book.toObject()

            newBook.user = user

            return newBook
        }))

        res.status(200).json(books)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// GET ALL ONGOING
const getOngoing = async (_, res) => {
    try {
        let books = await Book.find({ status: "ongoing" })

        books = await Promise.all(books.map(async (book) => {
            const { email } = await User.findOne({ _id: book.userId })
            const user = await UserPersonalData.findOne({ email: email })
            const newBook = book.toObject()

            newBook.user = user

            return newBook
        }))

        res.status(200).json(books)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// GET ALL CANCELLED
const getCancelled = async (req, res) => {
    const { month } = req.query

    try {
        let books = await Book.find({ status: "cancelled" })

        books = await Promise.all(books.map(async (book) => {
            if (book.from.getMonth() !== new Date(month).getMonth() && book.to.getMonth() !== new Date(month).getMonth()) {
                return null
            }
            if (book.from.getFullYear() !== new Date(month).getFullYear() && book.to.getFullYear() !== new Date(month).getFullYear()) {
                return null
            }

            const { email } = await User.findOne({ _id: book.userId })
            const user = await UserPersonalData.findOne({ email: email })
            const newBook = book.toObject()

            newBook.user = user

            return newBook
        }))

        books = books.filter(book => book !== null)

        res.status(200).json(books)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// GET ALL NOSHOW
const getNoshow = async (req, res) => {
    const { month } = req.query

    try {
        let books = await Book.find({ status: "noshow" })

        books = await Promise.all(books.map(async (book) => {
            if (book.from.getMonth() !== new Date(month).getMonth() && book.to.getMonth() !== new Date(month).getMonth()) {
                return null
            }
            if (book.from.getFullYear() !== new Date(month).getFullYear() && book.to.getFullYear() !== new Date(month).getFullYear()) {
                return null
            }

            const { email } = await User.findOne({ _id: book.userId })
            const user = await UserPersonalData.findOne({ email: email })
            const newBook = book.toObject()

            newBook.user = user

            return newBook
        }))

        books = books.filter(book => book !== null)

        res.status(200).json(books)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// GET ALL COMPLETED
const getCompleted = async (req, res) => {
    const { month } = req.query

    try {
        let books = await Book.find({ status: "completed" })

        books = await Promise.all(books.map(async (book) => {
            if (book.from.getMonth() !== new Date(month).getMonth() && book.to.getMonth() !== new Date(month).getMonth()) {
                return null
            }

            if (book.from.getFullYear() !== new Date(month).getFullYear() && book.to.getFullYear() !== new Date(month).getFullYear()) {
                return null
            }

            const { email } = await User.findOne({ _id: book.userId })
            const user = await UserPersonalData.findOne({ email: email })
            const newBook = book.toObject()

            newBook.user = user

            return newBook
        }))

        books = books.filter(book => book !== null)

        res.status(200).json(books)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// ADD NEW PENDING BOOK
const addBook = async (req, res) => {
    const { email, from, to, note, selectedRoomTypes, total, deposit } = await req.body
    const { downPayment } = await AdminSetting.findOne({})

    const room = selectedRoomTypes.map(roomType => ({ roomType: roomType.name, maxPerson: roomType.maxPerson, addedPerson: roomType.addedPerson, rate: roomType.rate, addedPersonRate: roomType.addFeePerPerson }))


    try {
        const admins = await Admin.find({ role: { $in: ["booking"] } })
        const user = await User.findOne({ email })

        let book = (await Book.create({ userId: user._id, from, to, note, room, total, deposit, balance: total, downPayment })).toObject()

        book.user = await UserPersonalData.findOne({ email })

        admins.forEach(admin => {
            sendMail({
                subject: "New Reservation Received!",
                to: admin.email,
                html: `<h3>Dear ${admin.personalData.name},</h3>
                    <p>You have received a new reservation request through the website. Below are the details:</p>
                    <hr />
                    <h4>Guest Information:</h4>
                    <ul>
                        <li>Name: ${book.user.name}</li>
                        <li>Email: ${book.user.email}</li>
                        <li>Contact: ${book.user.contact}</li>
                    </ul>
                    <hr />
                    <h4>Reservation Details:</h4>
                    <ul>
                        <li>Check-in Date: ${book.from}</li>
                        <li>Check-out Date: ${book.to}</li>
                        <li>Room Type: ${book.room.map(r => r.roomType).join(", ")}</li>
                        <li>Special Request: ${book.note !== "" ? book.note : "none"}</li>
                    </ul>
                    <hr />
                    <p>Please review the details and process the reservation accordingly.<p>
                    <p>Thank you.</p>
                    <p>Best Regards,</p>
                    <p><b>The Lagoon Resort Finland Inc.<b></p>`
            })
        })

        res.status(200).json({ book })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// PENDING & CANCELLED => CONFIRMED
const setConfirmed = async (req, res) => {
    const { _id, from, to, room, total, deposit, payed, adminEmail } = await req.body

    try {
        const newRoom = room.map(r => {
            delete r._id
            return r
        })

        const balance = total - payed
        const book = await Book.findOneAndUpdate({ _id }, { status: "confirmed", from, to, room: newRoom, total, deposit, balance, payed, reasonToCancel: "not cancelled" }, { new: true })

        const { email } = await User.findOne({ _id: book.userId })

        await Payment.create({ amount: payed, userId: book.userId })

        // activity log
        await ActivityLog.create({ adminEmail, action: [Actions.BOOKING, Actions.UPDATED], activity: `Confirmed a book of ${email}` })

        res.status(200).json(book)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// ONGOING => COMPLETED
const setCompleted = async (req, res) => {
    const { _id, total, addCharges, adminEmail } = await req.body

    try {
        const oldBook = await Book.findOne({ _id })

        if (total - oldBook.balance > 0) {
            await Payment.create({ amount: total - oldBook.payed, userId: oldBook.userId })
        }

        const book = await Book.findOneAndUpdate({ _id }, { status: "completed", balance: 0, total, payed: total, addCharges }, { new: true })

        const { email } = await User.findOne({ _id: book.userId })

        // activity log
        await ActivityLog.create({ adminEmail, action: [Actions.BOOKING, Actions.UPDATED], activity: `Confirm a book as completed of ${email}` })

        res.status(200).json(book)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// PENDING & CONFIRMED => CANCELLED
const setCancelled = async (req, res) => {
    const { _id, reasonToCancel, adminEmail } = await req.body

    try {
        const book = await Book.findOneAndUpdate({ _id }, { status: "cancelled", reasonToCancel }, { new: true })

        const { email } = await User.findOne({ _id: book.userId })

        // activity log
        await ActivityLog.create({ adminEmail: adminEmail || email + "(guest)", action: [Actions.BOOKING, Actions.UPDATED], activity: `Cancelled a book of ${email}` })

        res.status(200).json(book)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// ONGOING => NOSHOW
const setNoshow = async (req, res) => {
    const { _id, adminEmail } = await req.body

    try {
        const book = await Book.findOneAndUpdate({ _id }, { status: "noshow" }, { new: true })

        const { email } = await User.findOne({ _id: book.userId })

        // activity log
        await ActivityLog.create({ adminEmail, action: [Actions.BOOKING, Actions.UPDATED], activity: `Set a book as noshow of ${email}` })

        res.status(200).json(book)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// EDIT BOOK
const editBook = async (req, res) => {
    const { _id, from, to, room, total, payed, showed, adminEmail } = await req.body
    let editedParts = []

    try {
        const balance = total - payed

        const newRoom = room.map(r => {
            delete r._id
            return r
        })

        const oldBook = await Book.findOne({ _id })

        if (payed - oldBook.payed > 0) {
            await Payment.create({ amount: payed - oldBook.payed, userId: oldBook.userId })
        }

        const book = await Book.findOneAndUpdate({ _id }, { _id, from, to, room: newRoom, total, balance, payed, showed }, { new: true })

        const { email } = await User.findOne({ _id: book.userId })
        const user = await UserPersonalData.findOne({ email: email })

        const newBook = book.toObject()
        newBook.user = user

        // activity log
        from && format(oldBook.from, "MMM d, yyyy") !== format(from, "MMM d, yyyy") && editedParts.push("from")
        to && format(oldBook.to, "MMM d, yyyy") !== format(to, "MMM d, yyyy") && editedParts.push("to")
        room && JSON.stringify(oldBook.room) !== JSON.stringify(room) && editedParts.push("room")
        total && oldBook.total !== total && editedParts.push("total")
        payed && oldBook.payed !== payed && editedParts.push("payed")
        showed && oldBook.showed !== showed && editedParts.push("showed")

        if (editedParts.length > 0) {
            await ActivityLog.create({
                adminEmail,
                action: [Actions.BOOKING, Actions.UPDATED],
                activity: `Changed the book information of ${email}. ${editedParts.map(part => {
                    switch (part) {
                        case "from":
                            return ` changed start date from ${format(oldBook.to, "MMM d, yyyy")} to ${format(from, "MMM d, yyyy")}`
                        case "to":
                            return ` changed end date from ${format(oldBook.to, "MMM d, yyyy")} to ${format(to, "MMM d, yyyy")}`
                        case "room":
                            return ` changed room`
                        case "total":
                            return ` changed total from ${oldBook.total} to ${total}`
                        case "payed":
                            return ` changed payed balance from ${oldBook.payed} to ${payed}`
                        case "showed":
                            return ` marked as showed`
                    }
                })}`
            })
        }

        res.status(200).json(newBook)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// GET ALL USER BOOKING
const getUserBooks = async (req, res) => {
    const { status, email } = req.query

    try {
        const { _id } = await User.findOne({ email })

        const books = await Book.find({ status, userId: _id })

        res.status(200).json(books.reverse())
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}


module.exports = {
    getPending,
    getExpired,
    getConfirmed,
    getOngoing,
    getCancelled,
    getNoshow,
    getCompleted,
    addBook,
    setConfirmed,
    setCompleted,
    setCancelled,
    setNoshow,
    editBook,
    getUserBooks,
    getTotalBooksByUser,
    getTotalBooks
}