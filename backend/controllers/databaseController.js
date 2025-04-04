const mongoose = require("mongoose");
const crypto = require("crypto");

const secretKey = crypto.createHash("sha256").update(process.env.PASSWORD).digest()
const iv = Buffer.alloc(16, 0)
const zlib = require("zlib")


function encryptJSON(jsonData) {
    const compressed = zlib.gzipSync(JSON.stringify(jsonData))
    const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv)
    let encrypted = Buffer.concat([cipher.update(compressed), cipher.final()])
    return {
        iv: iv.toString("base64"),
        data: encrypted.toString("base64"),
    }
}

function decryptJSON(encryptedData) {
    try {
        const decipher = crypto.createDecipheriv(
            "aes-256-cbc",
            secretKey,
            Buffer.from(encryptedData.iv, "base64")
        )
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedData.data, "base64")),
            decipher.final(),
        ])
        return JSON.parse(zlib.gunzipSync(decrypted).toString())
    } catch (error) {
        throw new Error("Invalid decryption data")
    }
}

const getAllCollectionNames = async (req, res) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray()
        const collectionNames = collections.map(collection => collection.name)

        res.status(200).json(collectionNames)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const getAllCollections = async (req, res) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray()
        let backupData = {}

        for (let collection of collections) {
            const collectionName = collection.name
            const Model = mongoose.models[collectionName] || mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }), collectionName);
            const encrypt = encryptJSON(await Model.find({}))
            backupData[collectionName] = encrypt
        }

        res.status(200).json(backupData)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const getOneCollection = async (req, res) => {
    const { collectionName } = req.query

    try {
        const Model = mongoose.models[collectionName] || mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }), collectionName);
        const data = await Model.find({})
        const encrypt = encryptJSON(data)

        res.status(200).json({ [collectionName]: encrypt })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const restoreCollection = async (req, res) => {
    const { collections } = req.body

    try {
        for (const collectionName of Object.keys(collections)) {
            const Model = mongoose.models[collectionName] || mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }), collectionName)
            const decryptedData = decryptJSON(collections[collectionName])
            await Model.deleteMany({})
            await Model.insertMany(decryptedData)
        }

        res.status(200).json({ success: true })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const importCollection = async (req, res) => {
    const { collections } = req.body

    try {
        for (const collectionName of Object.keys(collections)) {
            const Model = mongoose.models[collectionName] || mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }), collectionName)
            const decryptedData = decryptJSON(collections[collectionName])

            await Promise.all(decryptedData.map(async data => {
                if (await Model.findOne({ _id: data._id })) {
                    return Model.updateOne({ _id: data._id }, data)
                } else {
                    return Model.create(data)
                }
            }))
        }

        res.status(200).json({ success: true })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}


module.exports = {
    getAllCollections,
    getAllCollectionNames,
    getOneCollection,
    restoreCollection,
    importCollection
}