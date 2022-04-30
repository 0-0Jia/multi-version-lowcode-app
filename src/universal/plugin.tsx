import React from 'react';
import {
  ILowCodePluginContext,
  plugins,
  skeleton,
  project,
  setters,
} from '@alilc/lowcode-engine';
import AliLowCodeEngineExt from '@alilc/lowcode-engine-ext';
import { Button } from '@alifd/next';
import UndoRedoPlugin from '@alilc/lowcode-plugin-undo-redo';
import ComponentsPane from '@alilc/lowcode-plugin-components-pane';
import ZhEnPlugin from '@alilc/lowcode-plugin-zh-en';
import CodeGenPlugin from '@alilc/lowcode-plugin-code-generator';
import DataSourcePanePlugin from '@alilc/lowcode-plugin-datasource-pane';
import SchemaPlugin from '@alilc/lowcode-plugin-schema';
import CodeEditor from "@alilc/lowcode-plugin-code-editor";
import ManualPlugin from "@alilc/lowcode-plugin-manual";
import Inject, { injectAssets } from '@alilc/lowcode-plugin-inject';
import SimulatorResizer from '@alilc/lowcode-plugin-simulator-select';

// 注册到引擎
import TitleSetter from '@alilc/lowcode-setter-title';
import BehaviorSetter from '../setters/behavior-setter';
import CustomSetter from '../setters/custom-setter';

import {
  loadIncrementalAssets,
  getPageSchema,
  saveSchema,
  resetSchema,
  preview,
} from './utils';
import assets from './assets.json'
import VersionManagement from 'src/sample-plugins/versionManagement';
import UserContainer from 'src/sample-plugins/userContainer';
import saveVersionModal from 'src/sample-plugins/saveVersioModal';

export default async function registerPlugins() {
  // 说明书插件
  // await plugins.register(ManualPlugin);

  // 支持注入 插件 ？
  await plugins.register(Inject);

  // schema 插件
  SchemaPlugin.pluginName = 'SchemaPlugin';
  await plugins.register(SchemaPlugin);

  // 模拟器插件：控制屏幕大小
  SimulatorResizer.pluginName = 'SimulatorResizer';
  plugins.register(SimulatorResizer);

  // 页面配置拉取，优先使用缓存，否则拉取本地文件
  const editorInit = (ctx: ILowCodePluginContext) => {
    return {
      name: 'editor-init',
      async init() {
        // 修改面包屑组件的分隔符属性setter
        // const assets = await (
        //   await fetch(
        //     `https://alifd.alicdn.com/npm/@alilc/lowcode-materials/build/lowcode/assets-prod.json`
        //   )
        // ).json();
        // 设置物料描述
        const { material, project } = ctx;

        material.setAssets(await injectAssets(assets));

        const schema = await getPageSchema();

        // 加载 schema
        project.openDocument(schema);
      },
    };
  }
  editorInit.pluginName = 'editorInit';
  await plugins.register(editorInit);

  // 组件面板
  const builtinPluginRegistry = (ctx: ILowCodePluginContext) => {
    return {
      name: 'builtin-plugin-registry',
      async init() {
        const { skeleton } = ctx;
        // 注册组件面板
        const componentsPane = skeleton.add({
          area: 'leftArea',
          type: 'PanelDock',
          name: 'componentsPane',
          content: ComponentsPane,
          contentProps: {},
          props: {
            align: 'top',
            icon: 'zujianku',
            description: '组件库',
          },
        });
        componentsPane?.disable?.();
        project.onSimulatorRendererReady(() => {
          componentsPane?.enable?.();
        })
      },
    };
  }
  builtinPluginRegistry.pluginName = 'builtinPluginRegistry';
  await plugins.register(builtinPluginRegistry);

  // 设置内置 setter 和事件绑定、插件绑定面板
  const setterRegistry = (ctx: ILowCodePluginContext) => {
    const { setterMap, pluginMap } = AliLowCodeEngineExt;
    return {
      name: 'ext-setters-registry',
      async init() {
        const { setters, skeleton } = ctx;
        // 注册setterMap
        setters.registerSetter(setterMap);
        // 注册插件
        // 注册事件绑定面板
        skeleton.add({
          area: 'centerArea',
          type: 'Widget',
          content: pluginMap.EventBindDialog,
          name: 'eventBindDialog',
          props: {},
        });

        // 注册变量绑定面板
        skeleton.add({
          area: 'centerArea',
          type: 'Widget',
          content: pluginMap.VariableBindDialog,
          name: 'variableBindDialog',
          props: {},
        });
      },
    };
  }
  setterRegistry.pluginName = 'setterRegistry';
  await plugins.register(setterRegistry);

  // 注册回退/前进
  await plugins.register(UndoRedoPlugin);

  // 注册中英文切换
  await plugins.register(ZhEnPlugin);

  // 异步加载增量的「资产包」结构，该增量包会与原有的合并
  const loadAssetsSample = (ctx: ILowCodePluginContext) => {
    return {
      name: 'loadAssetsSample',
      async init() {
        const { skeleton } = ctx;

        skeleton.add({
          name: 'loadAssetsSample',
          area: 'topArea',
          type: 'Widget',
          props: {
            align: 'right',
            width: 80,
          },
          content: (
            <Button onClick={loadIncrementalAssets}>
              异步加载资源
            </Button>
          ),
        });
      },
    };
  };
  loadAssetsSample.pluginName = 'loadAssetsSample';
  await plugins.register(loadAssetsSample);

  // 注册保存面板
  const saveSample = (ctx: ILowCodePluginContext) => {
    return {
      name: 'saveSample',
      async init() {
        const { skeleton, hotkey } = ctx;

        skeleton.add({
          name: 'saveSample',
          area: 'topArea',
          type: 'Widget',
          props: {
            align: 'right',
          },
          content: (
            <Button onClick={() => saveSchema(true)}>
              保存到本地
            </Button>
          ),
        });
        skeleton.add({
          name: 'resetSchema',
          area: 'topArea',
          type: 'Widget',
          props: {
            align: 'right',
          },
          content: (
            <Button onClick={resetSchema}>
              重置页面
            </Button>
          ),
        });
        hotkey.bind('command+s', (e) => {
          e.preventDefault();
          saveSchema(true);
        });
      },
    };
  }
  saveSample.pluginName = 'saveSample';
  await plugins.register(saveSample);

  // 数据源插件
  DataSourcePanePlugin.pluginName = 'DataSourcePane';
  await plugins.register(DataSourcePanePlugin);

  // 代码编辑插件
  CodeEditor.pluginName = 'CodeEditor';
  await plugins.register(CodeEditor);

  // 注册出码插件
  CodeGenPlugin.pluginName = 'CodeGenPlugin';
  await plugins.register(CodeGenPlugin);

  // 预览插件
  const previewSample = (ctx: ILowCodePluginContext) => {
    return {
      name: 'previewSample',
      async init() {
        const { skeleton } = ctx;
        skeleton.add({
          name: 'previewSample',
          area: 'topArea',
          type: 'Widget',
          props: {
            align: 'right',
          },
          content: (
            <Button type="primary" onClick={preview}>
              预览
            </Button>
          ),
        });
      },
    };
  };
  previewSample.pluginName = 'previewSample';
  await plugins.register(previewSample);

  // ？？？
  const customSetter = (ctx: ILowCodePluginContext) => {
    return {
      name: '___registerCustomSetter___',
      async init() {
        const { setters } = ctx;

        setters.registerSetter('TitleSetter', TitleSetter);
        setters.registerSetter('BehaviorSetter', BehaviorSetter);
        setters.registerSetter('CustomSetter', CustomSetter);
      },
    };
  }
  customSetter.pluginName = 'customSetter';
  await plugins.register(customSetter);

  // 保存版本
  const saveVersion = (ctx: ILowCodePluginContext) => {
    return {
      name: 'saveVersion',
      async init() {
        const { skeleton } = ctx;
        skeleton.add({
          name: 'saveVersion',
          area: 'topArea',
          type: 'Widget',
          props: {
            align: 'right',
          },
          content: saveVersionModal,
        });
      },
    };
  };
  saveVersion.pluginName = 'saveVersion';
  await plugins.register(saveVersion);

  // 自定义插件：版本管理
  const versionManage = (ctx: ILowCodePluginContext) => {
    return {
      name: 'versionManage',
      async init() {
        const { skeleton } = ctx;
        skeleton.add({
          name: 'versionManage',
          area: 'leftArea',
          type: 'PanelDock',
          props: {
            icon: <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1363"><path d="M512 1024C229.888 1024 0 794.112 0 512S229.888 0 512 0s512 229.888 512 512-229.888 512-512 512z m0-972.8c-253.952 0-460.8 206.848-460.8 460.8s206.848 460.8 460.8 460.8 460.8-206.848 460.8-460.8-206.848-460.8-460.8-460.8z" fill="currentColor" p-id="1364"></path><path d="M512 870.4c-28.16 0-51.2-23.04-51.2-51.2V409.6c0-28.16 23.04-51.2 51.2-51.2s51.2 23.04 51.2 51.2v409.6c0 28.16-23.04 51.2-51.2 51.2z" fill="currentColor" p-id="1365"></path><path d="M512 256m-51.2 0a51.2 51.2 0 1 0 102.4 0 51.2 51.2 0 1 0-102.4 0Z" fill="currentColor" p-id="1366"></path></svg>,
            description: '版本管理'
          },
          panelProps: {
            width: '600px',
            title: '版本管理',
            keepVisibleWhileDragging: true,
          },
          content: VersionManagement
        })
      },
    };
  }
  versionManage.pluginName = 'versionManage';
  await plugins.register(versionManage);

  // 自定义插件：版本管理
  const userPlugin = (ctx: ILowCodePluginContext) => {
    return {
      name: 'userPlugin',
      async init() {
        const { skeleton } = ctx;
        skeleton.add({
          name: 'userPlugin',
          area: 'topArea',
          type: 'Widget',
          props: {
            align: 'left',
          },
          content: UserContainer
        })
      },
    };
  }
  userPlugin.pluginName = 'userPlugin';
  await plugins.register(userPlugin);
};