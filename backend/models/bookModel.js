const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
    roomType: {
        type: String,
        required: true
    },
    roomNo: {
        type: Number,
        default: 0
    },
    maxPerson: {
        type: Number,
        required: true
    },
    addedPerson: {
        type: Number,
        required: true
    },
    rate: {
        type: Number,
        required: true
    },
    addedPersonRate: {
        type: Number,
        required: true
    }
})

const addChargesSchema = new mongoose.Schema({
    charge: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    id: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Book', new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        default: "pending"
    },
    from: {
        type: Date,
        required: true
    },
    to: {
        type: Date,
        required: true
    },
    note: {
        type: String,
        default: ""
    },
    room: {
        type: [roomSchema],
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    deposit: {
        type: Number,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    payed: {
        type: Number,
        default: 0
    },
    downPayment: {
        type: Number,
        required: true
    },
    reasonToCancel: {
        type: String,
        default: null
    },
    showed: {
        type: Boolean,
        default: false
    },
    addCharges: {
        type: [addChargesSchema],
        default: []
    },
    feedback: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feedback',
        default: null
    },
    confirmedDate: {
        type: Date,
        default: null
    },
    cancelledDate: {
        type: Date,
        default: null
    }
}, { timestamps: true }), 'books')