import { useState } from "react"
import { format, formatDistance } from "date-fns"
import Loader2 from "./Loader2"
import axios from "axios"



const CancelBook = ({ setBooks, setToCancel, toCancel }) => {
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        setIsLoading(true)

        axios.post("book/add-cancelled", { _id: toCancel._id, reasonToCancel: "Cancelled by admin" })
            .then(res => {
                setBooks(prev => prev.filter(book => book._id !== res.data._id))
                setToCancel(null)
            })
            .catch((err) => {
                dispatch({ type: 'FAILED', payload: err.response.data.error })
                console.log(err.response.data.error)
            })
            .finally(() => setIsLoading(false))
    }

    return (
        <div className="full-cont">
            <form onSubmit={handleSubmit} className="cancel-book">
                <h1>You are about to cancel this Reservation:</h1>
                <div className="cancel-book-info">
                    {isLoading ?
                        <Loader2 />
                        :
                        <>
                            <h2>{toCancel.user.name} ({toCancel.user.sex}, {toCancel.user.age})</h2>
                            <h2>{toCancel.user.email}</h2>
                            <h2>{format(toCancel.from, 'LLL d' + (new Date(toCancel.from).getFullYear() === new Date(toCancel.to).getFullYear() ? '' : ', yyyy'))} - {format(toCancel.to, (new Date(toCancel.from).getMonth() === new Date(toCancel.to).getMonth() ? '' : 'LLL ') + 'd, yyyy')} ({formatDistance(toCancel.from, toCancel.to)})</h2>
                            <div className="room">
                                {toCancel.room.map((room, i) => (
                                    <h2 key={room._id}>{room.roomType}</h2>
                                ))}
                            </div>
                            <h2>Total: {toCancel.total}</h2>
                            <h2>Payed: {toCancel.payed}</h2>
                        </>
                    }
                </div>
                <div className="bttns">
                    <button type="submit" disabled={isLoading} className="green">Cancel this Reservation</button>
                    <button onClick={() => setToCancel(null)} className="red">Back</button>
                </div>
            </form>
        </div>
    )
}

export default CancelBook