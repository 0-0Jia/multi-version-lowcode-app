import React, { useState } from 'react';
import './index.less';
import { PluginProps } from '@alilc/lowcode-types';
import { Button, Dialog, Form, Input } from '@alifd/next';
import { uniqueId } from '@alilc/lowcode-utils';
import { project } from '@alilc/lowcode-engine';
import { dateFormat } from 'src/utils';
import { saveSchema } from 'src/universal/utils';

export interface IProps {

}

const saveVersionModal: React.FC<IProps & PluginProps> = (props): React.ReactElement => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [formVal, setFormVal] = useState({
        versionName: '',
        description: ''
    })

    const saveVersion = () => {
        saveSchema(false);
        const preVersionList = JSON.parse(window.localStorage.getItem('versionList')!) || [];
        const username = JSON.parse(window.localStorage.getItem('loginUser')!)?.username;
        const curTime = new Date();
        preVersionList?.unshift({
          id: uniqueId(),
          username,
          ...formVal,
          versionJson: project.exportSchema(),
          operator: username,
          createTime: dateFormat("YYYY-mm-dd HH:MM:SS", curTime),
        })
        window.localStorage.setItem('versionList', JSON.stringify(preVersionList));
        window.location.reload();
    }

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        saveVersion()
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <div className="lowcode-plugin-user-container">
            <Button type="primary" onClick={showModal}>
                保存当前版本
            </Button>
            <Dialog title="填写版本信息" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} onClose={handleCancel}>
                <Form
                    name="basic"
                    value={formVal}
                    onChange={(val) => {
                        setFormVal(val)
                    }}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                >
                    <Form.Item
                        label="版本名称"
                        name="versionName"
                        required
                        requiredMessage='请填写'
                    >
                        <Input name='versionName' />
                    </Form.Item>

                    <Form.Item
                        label="版本描述"
                        name="description"
                        required
                        requiredMessage='请填写'
                    >
                        <Input name='description' />
                    </Form.Item>
                </Form>
            </Dialog>
        </div>
    );
};

export default saveVersionModal;
