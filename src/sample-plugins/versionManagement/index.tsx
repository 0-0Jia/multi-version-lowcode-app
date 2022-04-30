import React, { useEffect, useState, version } from 'react';
import './index.scss';
import { PluginProps, ProjectSchema } from '@alilc/lowcode-types';
import { Button, Dialog, Tab } from '@alifd/next';
import { material, project } from '@alilc/lowcode-engine';
import { saveSchema } from 'src/universal/utils';
import CodeDiff from 'react-code-diff-lite';
import { schema2CssCode, schema2JsCode } from './schema-to-code';
//@ts-ignore
import { isEqual, omit } from 'loadsh'

export interface IProps {

}

export const addNewAddStyle = (node: any, flag?: boolean) => {
    const backgroundStyle = flag !== false ? "lightseagreen" : undefined;
    if(node?.props) {
        if(node.props?.style) {
            node.props.style["background"] = backgroundStyle;
        }
        node.props["style"] = {
            "background": backgroundStyle
        };
    }else {
        node['props'] = {
            "style": {
                "background": backgroundStyle
            }
        }
    }
    if(flag !== false) {
        node['conflictStyle'] = 'true';
    }else {
        delete node.conflictStyle;
    }
    return node;
}

export const addChangeStyle = (node: any, flag?: boolean) => {
    const backgroundStyle = flag !== false ? "rgba(104, 0, 104, 0.6)" : undefined;
    if(node?.props) {
        if(node.props?.style) {
            node.props.style["background"] = backgroundStyle;
        }
        node.props["style"] = {
            "background": backgroundStyle
        };
    }else {
        node['props'] = {
            "style": {
                "background": backgroundStyle
            }
        }
    }
    if(flag !== false) {
        node['conflictStyle'] = 'true';
    }else {
        delete node.conflictStyle;
    }
    return node;
}

const VersionManagement: React.FC<IProps & PluginProps> = (props): React.ReactElement => {
    const [versionList, setVersionList] = useState(JSON.parse(localStorage.getItem('versionList')!) || []);
    const [showCodeDiff, setShowCodeDiff] = useState(false);
    const [mergingVersionName, setMergingVersionName] = useState('');
    const [curSchema, setCurSchema] = useState({} as ProjectSchema);
    const [mergingSchema, setMergingSchema] = useState({} as ProjectSchema);

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

    const createImg = () => {
        const img = new Image();
        img.src = 'http://m.qpic.cn/psc?/V12yxLiq4eIARf/ruAMsa53pVQWN7FLK88i5mz9rbD0ERDCEHeinWm1oOvaFyloKHljB4l5KAWq5TVBX7.ehoDx6XR6Kd4xSZ23tjVxVhoUDVFlkzoFlLnfooY!/b&bo=yADIAAAAAAADByI!&rf=viewer_4';
        return img;
    }

    const flatten = (components?: any) => {
        if(!components) return [];
        var res: any = [];
        const handleFlatten = (arr: any[]) => {
            arr?.forEach((item) => {
                res?.unshift(item);
                if(Array.isArray(item?.children)) {
                    handleFlatten(item?.children);
                }
            })
        }
        if(Array.isArray(components)) handleFlatten(components);
        return res;
    }

    const filterAddComponentIds = (components1: any[], components2: any[]) => {
        const components1Ids = components1.map(item => item?.id);
        return components2.filter(item => !components1Ids.includes(item?.id))?.map(item => item?.id);
    }

    const filterDeleteComponentIds = (components1: any[], components2: any[]) => {
        const components2Ids = components2.map(item => item?.id);
        return components1.filter(item => !components2Ids.includes(item?.id)).map(item => item?.id);
    }

    const addConflictStyle = (components?: any, prevComps?: any, newAddIds?: string[], delIds?: string[]) => {
        for(let i = 0; i < components?.length; i++) {
            const item = components[i];
            const preItem = (Array.isArray(prevComps) && prevComps[i]) ? prevComps[i] : {};
            if(newAddIds?.includes(item.id)) {
                components[i] = addNewAddStyle(item);
            }else if(!delIds?.includes(item?.id) && !isEqual(omit(item, 'children'), omit(preItem, 'children'))) {
                components[i] = addChangeStyle(item);
            }
            if(Array.isArray(item?.children)) {
                addConflictStyle(item?.children, preItem?.children, newAddIds, delIds);
            }
        }
        return components;
    }

    const addDelStyle = (dom: any, name: string, values: string[]) => {
        const tagList = dom?.getElementsByTagName("*");
        for(let i = 0; i < tagList.length; i++) {
            if(values.includes(tagList[i].getAttribute(name))) {
                tagList[i].style.background = 'red';
            }
        }
}

    const handleMerge = (item: any) => {
        Dialog.confirm({
            content: '确定将当前页面版本与选中版本进行合并吗？请确认已经保存当前页面版本，此操作会丢失当前页面信息！',
            onOk: () => {
                // 代码比对
                setShowCodeDiff(true);
                const currentSchema = project.exportSchema();
                setCurSchema(currentSchema);
                setMergingSchema(item?.versionJson);
                setMergingVersionName(item?.versionName);

                // 视图比对
                const iframe1 = document.getElementsByTagName('iframe')[0];
                iframe1.style.width = '50%';
                let cloneIframe1 = iframe1.cloneNode(true);
                let cloneHTML1 = iframe1?.contentDocument?.getElementsByTagName('html')[0].cloneNode(true);
                iframe1.parentElement?.appendChild(cloneIframe1);
                const iframe2 = document.getElementsByTagName('iframe')[1];
                iframe2.style.opacity = '0.4';
                iframe2.contentDocument?.body.appendChild(cloneHTML1!);
                const canvasList = document.getElementsByTagName('iframe')[1].contentDocument?.body.getElementsByTagName('canvas') || [];
                for(let i = 0; i < canvasList.length; i++) {
                    canvasList[i].parentNode?.replaceChild(createImg(), canvasList[i]);
                }
                // 添加merging样式
                const flattenCurComponents = flatten(currentSchema?.componentsTree[0]?.children);
                const flattenMergingComponents = flatten(item?.versionJson?.componentsTree[0]?.children);
                const delComponentIds = filterDeleteComponentIds(flattenCurComponents, flattenMergingComponents);
                addDelStyle(document.getElementsByTagName('iframe')[1].contentDocument?.body, 'componentid', delComponentIds);
                const addComponentIds = filterAddComponentIds(flattenCurComponents, flattenMergingComponents);
                const addStyleChildren = addConflictStyle(item.versionJson?.componentsTree[0]?.children, currentSchema?.componentsTree[0]?.children, addComponentIds, delComponentIds);

                // 渲染merging版本
                project.getCurrentDocument()?.importSchema({...(item.versionJson?.componentsTree[0]), children: addStyleChildren});
                project.simulatorHost?.rerender();
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
            !showCodeDiff ?
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
                }) :
                <div>
                <Tab>
                    <Tab.Item title='js' key="0">
                        <CodeDiff oldStr={schema2JsCode(curSchema)} newStr={schema2JsCode(mergingSchema)} context={10} />
                    </Tab.Item>
                    <Tab.Item title='css' key="1"> 
                        <CodeDiff oldStr={schema2CssCode(curSchema)} newStr={schema2CssCode(mergingSchema)} context={10} />
                    </Tab.Item>
                </Tab>
                <div style={{margin: '10px'}}>当前合并版本：{mergingVersionName}</div>
                </div>
            }
        </div>
    );
};

export default VersionManagement;