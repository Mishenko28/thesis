import { useEffect, useState } from "react"
import Loader from "../components/Loader"
import axios from "axios"
import "../styles/gallery.css"
import { motion } from "framer-motion"




const Gallery = () => {
    const [isLoading, setIsLoading] = useState(true)

    const [pictures, setPictures] = useState(null)

    useEffect(() => {
        fetchPics()
    }, [])

    const fetchPics = async () => {
        axios.get('gallery/all')
            .then(res => {
                setPictures(res.data.pictures)
            })
            .finally(() => setIsLoading(false))
    }


    return (
        <div className="gallery">
            <div className="header-page">
                <img src="/galleryBG.jpg" />
                <h1>GALLERY</h1>
                <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Cupiditate accusantium iste reprehenderit molestias sint qui obcaecati ut?</p>
            </div>
            {isLoading ?
                <Loader />
                :
                <div className="pics-wrapper">
                    {pictures.filter(pic => !pic.hide).map(pic => (
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            viewport={{ once: 1, amount: 0.7 }}
                            className="pic" key={pic._id}
                        >
                            <img src={pic.img} />
                            <p>{pic.caption}</p>
                        </motion.div>
                    ))}
                </div>
            }
        </div>
    )
}

export default Gallery