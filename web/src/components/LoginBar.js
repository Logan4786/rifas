import React, { useState, useContext} from 'react'
import { Context } from '../Context/AuthContext'
import './styleComponents.css'



export default function LoginBar () {
    const { handleLogin } = useContext(Context)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    return (
    
    <div className="login-bar">
        <h1><span className="orange">E</span>ntrar</h1>
        <form className="form-bar">
                <input className="input-login" value={email} 
                onChange={e => setEmail(e.target.value)} placeholder="Email">
                </input>

                <input className="input-login" value={password} type="password"
                onChange={e => setPassword(e.target.value)} placeholder="Password">
                </input>

                <div className="button-inline">
                    <button className="button-login" type="button" onClick={() => handleLogin(email,password) }>OK</button>
                    <button className="button-register">Register</button>
                </div>
        </form>
    </div>    
    )
}


// export default LoginBar