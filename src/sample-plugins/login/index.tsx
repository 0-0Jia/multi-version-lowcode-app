import React, { useEffect, useState } from 'react'
import './index.scss'
import LoginForm from './loginForm'
import RegisterForm from './registerForm'

export interface IProps {

}

export const Login: React.FC<IProps> = (props): React.ReactElement => {
    const [showBox, setShowBox] = useState('login');
    useEffect(() => {

    }, [])

    //切换showbox
    const switchShowBox = (box: string) => {
        setShowBox(box);
    }
    return (
        <div id='login-page'>
            {
                <div>
                    <div id='backgroundBox' style={styles.backgroundBox} />
                    <div className='container'>
                        <LoginForm
                            className={showBox === 'login' ? 'box showBox' : 'box hiddenBox'}
                            switchShowBox={switchShowBox} />
                        <RegisterForm
                            className={showBox === 'register' ? 'box showBox' : 'box hiddenBox'}
                            switchShowBox={switchShowBox} />
                    </div>
                </div>
            }
        </div>
    );
};

const styles = {
    backgroundBox: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundImage: `url("http://img.iwocool.com/allimg/2007/1-200F1095102250.jpg")`,
        backgroundSize: '100% 100%',
        transition: 'all .5s'
    }
}
