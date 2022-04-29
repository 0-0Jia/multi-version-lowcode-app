import React, { useEffect, useState, version } from 'react';
import './index.scss';
import { PluginProps } from '@alilc/lowcode-types';
import { Button, Dialog } from '@alifd/next';
import { material, project } from '@alilc/lowcode-engine';
import { saveSchema } from 'src/universal/utils';

export interface IProps {

}

const VersionManagement: React.FC<IProps & PluginProps> = (props): React.ReactElement => {
    const [versionList, setVersionList] = useState(JSON.parse(localStorage.getItem('versionList')!) || []);

    const handleView = (item: any) => {
        Dialog.confirm({
            content: '确定进入选中版本吗？请确认已经保存当前页面版本，此操作会丢失当前页面信息！',
            onOk: () => {
                saveSchema(false);
                project.getCurrentDocument()?.importSchema(item?.versionJson?.componentsTree[0]);
                project.simulatorHost?.rerender();
            }
        })
    }

    const handleMerge = (item: any) => {
        Dialog.confirm({
            content: '确定将当前页面版本与选中版本进行合并吗？请确认已经保存当前页面版本，此操作会丢失当前页面信息！',
            onOk: () => {
                // 代码比对
                // 视图diff
            }
        })
    }

    const handleDelete = (item: any) => {
        Dialog.confirm({
            content: '确定删除选中版本吗？',
            onOk: () => {
                const preVersionList = JSON.parse(window.localStorage.getItem('versionList')!) || [];
                const versionList = preVersionList?.filter((version: any) => version?.id !== item?.id);
                window.localStorage.setItem('versionList', JSON.stringify(versionList));
                setVersionList(versionList);
            }
        })
    }

    return (
        <div className="lowcode-plugin-version-list">
            {
                versionList.map((item: any) => {
                    return (
                        <div className='version-card'>
                            <div className='version-info'>
                                <p className='version-name'>{item?.versionName}</p>
                                <p className='version-description'>描述：{item?.description}</p>
                                <p className='version-createtime'>创建时间：{item?.createTime}</p></div>
                            <div className='version-btn-con'>
                                <Button text onClick={() => handleView(item)}>查看</Button>
                                <Button className='merge-btn' text style={{ color: 'purple' }} onClick={() => handleMerge(item)}>合并</Button>
                                <Button className='delete-btn' text style={{ color: 'red' }} onClick={() => handleDelete(item)}>删除</Button>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    );
};

export default VersionManagement;