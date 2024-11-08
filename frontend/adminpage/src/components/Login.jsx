import '../styles/Login.css'
import Loader from '../components/loader'
import axios from 'axios'
import useAdmin from '../hooks/useAdmin'
import { useState } from 'react'

function Login() {
    const { state, dispatch } = useAdmin()

    const [email, setEmail] = useState('johnthomasalog@gmail.com')
    const [password, setPassword] = useState('thomas1228')
    const [error, setError] = useState('')

    const [loading, setLoading] = useState(false)
    const [isPassHide, setIsPassHide] = useState(true)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        axios.post(`${state.uri}/admin/login`, {
            email: email,
            password: password
        })
            .then((res) => {
                dispatch({ type: 'LOGIN', payload: res.data })
            })
            .catch((err) => {
                setError(err.response.data.error)
            })

        setLoading(false)
        setPassword('')
    }

    return (
        <div className='login-container'>
            <h2>Login</h2>
            {loading ?
                <Loader />
                :
                <>
                    <form onSubmit={handleSubmit}>
                        {error && <p className='error'>{error}</p>}
                        <div>
                            <label>Email:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder='Enter your admin email'
                                required
                            />
                        </div>
                        <div>
                            <label>Password:</label>
                            <input
                                type={isPassHide ? "password" : "text"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder='Enter your password'
                                required
                            />
                            {
                                password.length > 0 &&
                                <button type='button' className='show-pass' onClick={() => setIsPassHide(!isPassHide)}>
                                    {isPassHide ? 'Show' : 'Hide'}
                                </button>
                            }
                        </div>
                        <button type="submit">Login</button>
                    </form>
                </>
            }
        </div>
    )
}

export default Login