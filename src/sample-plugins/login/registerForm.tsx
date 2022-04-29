import React, { useState } from 'react'
import { Form, Input, message } from 'antd'
import { calculateWidth, DOMAIN_URL } from '../../utils/index'
import PromptBox from '../../components/PromptBox'
import axios from 'axios'

interface IProps {
    switchShowBox: (box: any) => void;
    className: string;
    form?: any;
}

export const RegisterForm: React.FC<IProps> = (props): React.ReactElement => {
    const [focusItem, setFocusItem] = useState(-1);

    const registerSubmit = (e: any) => {
        e.preventDefault();
        setFocusItem(-1);
        props.form.validateFields((err: any, values: any) => {
            if (!err) {
                axios({
                  method: 'post',
                  url: DOMAIN_URL + 'user/register',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  data: {
                    username: values.registerUsername,
                    password: values.registerPassword,
                  }
                }).then(res => {
                  console.log(res.data)
                  if(res.data.status===1){
                    alert('用户名已存在！')
                  }else if(res.data.status===200){
                    alert('注册成功！');
                    gobackLogin();
                }else {
                    alert('注册失败！')
                  }
                })
            }
        })
      }
      const gobackLogin = () => {
        props.switchShowBox('login')
        setTimeout(() => props.form.resetFields(), 500)
      }

    const {getFieldDecorator, getFieldError, getFieldValue} = props.form;

    return (
        <div className={props.className}>
        <h3 className='title'>管理员注册</h3>
        <Form onSubmit={registerSubmit}>
          <Form.Item help={getFieldError('registerUsername') && 
          <PromptBox info={getFieldError('registerUsername')} width={calculateWidth(getFieldError('registerUsername'))} y={20}/>}>
            {getFieldDecorator('registerUsername', {
              validateFirst: true,
              rules: [
                {required: true, message: '用户名不能为空'},
                {pattern: '^[^ ]+$', message: '不能输入空格'},
              ]
            })(
              <Input
                onFocus={() => setFocusItem(0)}
                onBlur={() => setFocusItem(-1)}
                maxLength={16}
                placeholder='用户名'
                addonBefore={<span className='iconfont icon-User' style={focusItem === 0 ? styles.focus : {}}/>}/>
            )}
          </Form.Item>
          <Form.Item help={getFieldError('registerPassword') && 
          <PromptBox info={getFieldError('registerPassword')} width={calculateWidth(getFieldError('registerPassword'))} y={120}/>}>
            {getFieldDecorator('registerPassword', {
              validateFirst: true,
              rules: [
                {required: true, message: '密码不能为空'},
                {pattern: '^[^ ]+$', message: '密码不能有空格'}
              ]
            })(
              <Input
                onFocus={() => setFocusItem(1)}
                onBlur={() => setFocusItem(-1)}
                type='password'
                maxLength={16}
                placeholder='密码'
                addonBefore={<span className='iconfont icon-suo1' style={focusItem === 1 ? styles.focus : {}}/>}/>
            )}
          </Form.Item>
          <Form.Item help={getFieldError('confirmPassword') && 
          <PromptBox info={getFieldError('confirmPassword')} width={calculateWidth(getFieldError('confirmPassword'))} y={220}/>}>
            {getFieldDecorator('confirmPassword', {
              validateFirst: true,
              rules: [
                {required: true, message: '请确认密码'},
                {
                  validator: (rule: any, value: any, callback: any) => {
                    if (value && value !== getFieldValue('registerPassword')) {
                      callback('两次输入不一致！')
                    }
                    callback()
                  }
                },
              ]
            })(
              <Input
                onFocus={() => setFocusItem(2)}
                onBlur={() => setFocusItem(-1)}
                type='password'
                maxLength={16}
                placeholder='确认密码'
                addonBefore={<span className='iconfont icon-suo1' style={focusItem === 2 ? styles.focus : {}}/>}/>
            )}
          </Form.Item>
          <div className='bottom'>
            <input className='loginBtn' type="submit" value='注册'/>
            <span className='registerBtn' onClick={gobackLogin}>返回登录</span>
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

export default Form.create()(RegisterForm)