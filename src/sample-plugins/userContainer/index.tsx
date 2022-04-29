import React from 'react';
import './index.scss';
import { PluginProps } from '@alilc/lowcode-types';
import store from "../../store/index";
import { Button, Dialog } from '@alifd/next';
import { logout } from 'src/utils/session';

export interface IProps {

}

const UserContainer: React.FC<IProps & PluginProps> = (props): React.ReactElement => {

  const user = JSON.parse(localStorage.getItem('loginUser')!);

  const loginOut = () => {
    Dialog.confirm({
      content: '确定要登出系统吗？',
      onOk: () => {
        logout();
        window.location.reload();
      }
    })
  }

  return (
    <div className="lowcode-plugin-user-container">
      <span>Hello! {store.getState().loginUser?.username ?? user?.username}</span>
      <Button text onClick={loginOut} style={{marginLeft: 16}}>登出系统</Button>
    </div>
  );
};

export default UserContainer;