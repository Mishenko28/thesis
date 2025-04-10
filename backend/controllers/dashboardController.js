const Book = require('../models/bookModel')
const Payment = require('../models/paymentModel')
const User = require('../models/userModel')
const UserPersonalData = require('../models/userPersonalDataModel')
const { startOfMonth, format } = require('date-fns')

const now = new Date()

const getTotalBookPerMonth = async (year) => {
    const books = await Book.find({
        createdAt: { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) },
        status: { $nin: ['pending', 'cancelled', 'expired'] }
    })

    const bookings = Array(12).fill(0)
    books.forEach(book => {
        const month = book.createdAt.getMonth()
        bookings[month] += 1
    })

    return bookings
}

const getAllData = async (_, res) => {
    try {
        const payments = await Payment.find({ createdAt: { $gte: startOfMonth(new Date()) } })

        const revenue = payments.reduce((acc, payment) => {
            return acc + parseFloat(payment.amount)
        }, 0)

        const totalBook = await Book.countDocuments({ status: { $nin: ['pending', 'cancelled', "expired"] }, createdAt: { $gte: startOfMonth(new Date()) } })
        const newUsers = await User.countDocuments({ createdAt: { $gte: startOfMonth(new Date()) } })
        let recentSales = await Payment.find({}).populate('userId').sort({ createdAt: -1 }).limit(20)

        recentSales = await Promise.all(recentSales.map(async payment => {
            payment.toObject()

            const { name, img } = await UserPersonalData.findOne({ email: payment.userId.email })

            return {
                _id: payment._id,
                name,
                img,
                email: payment.userId.email,
                payed: payment.amount
            }
        }))

        const bookings = {
            previousYear: {
                year: now.getFullYear() - 1,
                value: await getTotalBookPerMonth(now.getFullYear() - 1)
            },
            currentYear: {
                year: now.getFullYear(),
                value: await getTotalBookPerMonth(now.getFullYear())
            }
        }

        res.status(200).json({ revenue, totalBook, newUsers, recentSales, bookings })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


module.exports = {
    getAllData
}