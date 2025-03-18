import { useEffect, useState } from "react"
import axios from "axios"
import { format, formatDistance } from "date-fns"
import Loader from "./Loader"
import { Link } from "react-router-dom"
import useAdmin from "../hooks/useAdmin"




const Pending = ({ totalBooks }) => {
    const { state } = useAdmin()
    const [isLoading, setIsLoading] = useState(true)
    const [books, setBooks] = useState([])

    const [isCancelling, setIsCancelling] = useState(null)
    const [reason, setReason] = useState("")
    const [otherReason, setOtherReason] = useState("")

    useEffect(() => {
        fetchPending()
    }, [])

    const fetchPending = async () => {
        axios.get("book/user", { params: { status: "pending", email: state.user.email } })
            .then(res => setBooks(res.data))
            .finally(() => setIsLoading(false))
    }

    const handleToggCancel = (book) => {
        setIsCancelling(book)
        setReason("")
    }

    const handleReason = (value) => {
        setReason(value)
        setOtherReason("")
    }

    const handleOtherReason = (e) => {
        setReason(e.target.value)
        setOtherReason(e.target.value)
    }

    const handleSubmitCancel = async (e) => {
        e.preventDefault()

        if (!reason) return

        setIsLoading(true)

        axios.post('book/add-cancelled', { _id: isCancelling._id, reasonToCancel: reason })
            .then(res => {
                setBooks(prev => prev.filter(book => book._id !== res.data._id))
                totalBooks()
            })
            .finally(() => setIsLoading(false))
    }

    return (
        <div className="pending book-wrapper">
            {isLoading ?
                <Loader />
                :
                <>
                    {books.map(book => (
                        <div className="book" key={book._id}>
                            <div className="date">
                                <h1>{format(book.from, 'LLLL d' + (new Date(book.from).getFullYear() === new Date(book.to).getFullYear() ? '' : ', yyyy'))} - {format(book.to, (new Date(book.from).getMonth() === new Date(book.to).getMonth() ? '' : 'LLL ') + 'd, yyyy')}</h1>
                                <h2>({formatDistance(book.from, book.to)})</h2>
                            </div>
                            <hr />
                            <div className="rooms">
                                {book.room.map(room => (
                                    <div className="room-wrapper" key={room._id}>
                                        <div key={room._id} className="room">
                                            <h1>{room.roomType}</h1>
                                            <h2>₱{room.rate}</h2>
                                        </div>
                                        <div className="added-person">
                                            <h1>{Array.from({ length: room.maxPerson }, (_, i) => <i className={"fa-solid fa-person" + (i % 2 !== 0 ? "-dress" : "")} key={i} />)}{room.addedPerson !== 0 && " + "}{Array.from({ length: room.addedPerson }, (_, i) => <i className={"fa-solid fa-person" + (i % 2 !== 0 ? "-dress" : "")} key={i} />)} ({room.addedPerson + room.maxPerson})</h1>
                                            {room.addedPerson !== 0 && <h2>({room.addedPerson} x {room.addedPersonRate}) ₱{room.addedPerson * room.addedPersonRate}</h2>}
                                        </div>
                                    </div>
                                ))}
                                <hr />
                                <div className="total-wrapper">
                                    {Math.ceil((new Date(book.to) - new Date(book.from)) / (1000 * 60 * 60 * 24)) > 1 ?
                                        <>
                                            <div className="total">
                                                <h1>Total per day:</h1>
                                                <h2>₱{book.room.reduce((acc, curr) => acc + (curr.rate + (curr.addedPerson * curr.addedPersonRate)), 0)}</h2>
                                            </div>
                                            <div className="total">
                                                <h1>Final total:</h1>
                                                <h2>({formatDistance(book.from, book.to)} x {book.room.reduce((acc, curr) => acc + (curr.rate + (curr.addedPerson * curr.addedPersonRate)), 0)}) ₱{book.total}</h2>
                                            </div>
                                        </>
                                        :
                                        <div className="total">
                                            <h1>Total:</h1>
                                            <h2>₱{book.total}</h2>
                                        </div>
                                    }
                                    <div className="total">
                                        <h1>Down payment:</h1>
                                        <h2>₱{book.deposit}</h2>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            {book.note &&
                                <>
                                    <div className="note">
                                        <h1>Note:</h1>
                                        <h2>{book.note}</h2>
                                    </div>
                                    <hr />
                                </>
                            }
                            {!isCancelling ?
                                <button onClick={() => handleToggCancel(book)} className="cancel">Cancel this reservation</button>
                                :
                                <form onSubmit={handleSubmitCancel} className="cancel-wrapper">
                                    <div className="reasons">
                                        <h1>reason to cancel:</h1>
                                        <div className="reason">
                                            <input checked={reason === "Change of Plans"} onChange={() => handleReason("Change of Plans")} type="radio" name="reason" />
                                            <h2>Change of Plans</h2>
                                        </div>
                                        <div className="reason">
                                            <input checked={reason === "Financial Reasons"} onChange={() => handleReason("Financial Reasons")} type="radio" name="reason" />
                                            <h2>Financial Reasons</h2>
                                        </div>
                                        <div className="reason">
                                            <input checked={reason === "Personal Reasons"} onChange={() => handleReason("Personal Reasons")} type="radio" name="reason" />
                                            <h2>Personal Reasons</h2>
                                        </div>
                                        <div className="other">
                                            <h2>Others reason:</h2>
                                            <textarea value={otherReason} onChange={handleOtherReason} rows={3}></textarea>
                                        </div>
                                    </div>
                                    <div className="bttns">
                                        <button onClick={() => handleToggCancel(null)} className="back">Back</button>
                                        <button type="submit" className="submit">Submit</button>
                                    </div>
                                </form>
                            }
                        </div>
                    ))}
                    {books.length === 0 &&
                        <div className="book">
                            <h3>No pending bookings</h3>
                            <Link to="/booking" className="book-now">Book Now</Link>
                        </div>
                    }
                </>
            }
        </div >
    )
}

export default Pending