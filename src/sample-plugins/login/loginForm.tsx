import React, { useEffect, useState } from 'react'
import { randomNum, calculateWidth, DOMAIN_URL } from '../../utils/index'
import { Form, Input, Row, Col } from 'antd'
import PromptBox from '../../components/PromptBox'
import store from "../../store/index";
import { toggleLoginAction } from "../../store/actionCreators";
import axios from 'axios'

interface IProps {
    switchShowBox: (box: any) => void;
    className: string;
    form?: any;
}

export const LoginForm: React.FC<IProps> = (props): React.ReactElement => {
    const [focusItem, setFocusItem] = useState(-1);
    const [code, setCode] = useState('');
    useEffect(() => {
        createCode();
    }, [])

    /**
     * 生成验证码
     */
    const createCode = () => {
        const canvas = document.getElementById('canvas');
        const ctx = canvas?.getContext('2d');
        if (ctx) {
            const chars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
            let code = ''
            ctx.clearRect(0, 0, 80, 39)
            for (let i = 0; i < 4; i++) {
                const char = chars[randomNum(0, 57)]
                code += char
                ctx.font = randomNum(20, 25) + 'px SimHei'  //设置字体随机大小
                ctx.fillStyle = '#D3D7F7'
                ctx.textBaseline = 'middle'
                ctx.shadowOffsetX = randomNum(-3, 3)
                ctx.shadowOffsetY = randomNum(-3, 3)
                ctx.shadowBlur = randomNum(-3, 3)
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
                let x = 80 / 5 * (i + 1)
                let y = 39 / 2
                let deg = randomNum(-25, 25)
                /**设置旋转角度和坐标原点**/
                ctx.translate(x, y)
                ctx.rotate(deg * Math.PI / 180)
                ctx.fillText(char + '', 0, 0)
                /**恢复旋转角度和坐标原点**/
                ctx.rotate(-deg * Math.PI / 180)
                ctx.translate(-x, -y)
            }
            setCode(code);
        }
    }

    const loginSubmit = (e: any) => {
        e.preventDefault();
        setFocusItem(-1);
        props.form.validateFields((err: any, values: any) => {
            if (!err) {
                // 表单登录时，若验证码长度小于4则不会验证，所以我们这里要手动验证一次，线上的未修复
                if (code.toUpperCase() !== values.verification.toUpperCase()) {
                    props.form.setFields({
                        verification: {
                            value: values.verification,
                            errors: [new Error('验证码错误')]
                        }
                    })
                    return
                }
                console.log( DOMAIN_URL + 'users/login')
                axios({
                  method: 'post',
                  url: DOMAIN_URL + 'user/login',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  data: {
                    username: values.username,
                    password: values.password,
                  }
                }).then(res => {
                  console.log(res.data)
                  if(res.data.status===200){
                    store.dispatch(toggleLoginAction(true, {username: values.username}));
                    location.reload();
                  }else {
                    alert('用户名或密码有误，请重新登录！')
                  }
                })
            }
        })
    }

    const register = () => {
        props.switchShowBox('register')
        setTimeout(() => props.form.resetFields(), 500)
    }

    const { getFieldDecorator, getFieldError } = props.form;

    return (
        <div className={props.className}>
            <h3 className='title'>欢迎登录低代码系统</h3>
            <Form onSubmit={loginSubmit}>
                <Form.Item help={getFieldError('username') &&
                    <PromptBox info={getFieldError('username')} width={calculateWidth(getFieldError('username'))} y={20} />}>
                    {getFieldDecorator('username', {
                        rules: [{ required: true, message: '请输入用户名' }]
                    })(
                        <Input
                            onFocus={() => setFocusItem(0)}
                            onBlur={() => setFocusItem(-1)}
                            maxLength={16}
                            placeholder='用户名'
                            addonBefore={<span className='iconfont icon-User' style={focusItem === 0 ? styles.focus : {}} />} />
                    )}
                </Form.Item>
                <Form.Item help={getFieldError('password') &&
                    <PromptBox info={getFieldError('password')} width={calculateWidth(getFieldError('password'))}  y={120}/>}>
                    {getFieldDecorator('password', {
                        rules: [{ required: true, message: '请输入密码' }]
                    })(
                        <Input
                            onFocus={() => setFocusItem(1)}
                            onBlur={() => setFocusItem(-1)}
                            type='password'
                            maxLength={16}
                            placeholder='密码'
                            addonBefore={<span className='iconfont icon-suo1' style={focusItem === 1 ? styles.focus : {}} />} />
                    )}
                </Form.Item>
                <Form.Item help={getFieldError('verification') &&
                    <PromptBox info={getFieldError('verification')} width={calculateWidth(getFieldError('verification'))} y={220}/>}>
                    {getFieldDecorator('verification', {
                        validateFirst: true,
                        rules: [
                            { required: true, message: '请输入验证码' },
                            {
                                validator: (rule: any, value: any, callback: any) => {
                                    if (value.length >= 4 && code.toUpperCase() !== value.toUpperCase()) {
                                        callback('验证码错误')
                                    }
                                    callback()
                                }
                            }
                        ]
                    })(
                        <Row>
                            <Col span={15}>
                                <Input
                                    onFocus={() => setFocusItem(2)}
                                    onBlur={() => setFocusItem(-1)}
                                    maxLength={4}
                                    placeholder='验证码'
                                    addonBefore={<span className='iconfont icon-securityCode-b'
                                        style={focusItem === 2 ? styles.focus : {}} />} />
                            </Col>
                            <Col span={15}>
                                <canvas onClick={createCode} width="100" height='39' id='canvas' style={{ background: 'black', marginTop: '8px', marginLeft: '30px' }} />
                            </Col>
                        </Row>
                    )}
                </Form.Item>
                <div className='bottom'>
                    <input className='loginBtn' type="submit" value='登录' />
                    <span className='registerBtn' onClick={register}>注册</span>
                </div>
            </Form>
        </div>
    );
};

const styles = {
    focus: {
        width: '20px',
        opacity: 1
    },
}

export default Form.create()(LoginForm)