import { material, project } from '@alilc/lowcode-engine';
import { filterPackages } from '@alilc/lowcode-plugin-inject'
import { Message, Dialog } from '@alifd/next';
import { addChangeStyle, addNewAddStyle } from 'src/sample-plugins/versionManagement';

export const loadIncrementalAssets = () => {
  material?.onChangeAssets(() => {
    Message.success('[MCBreadcrumb] 物料加载成功');
  });

  material.loadIncrementalAssets({
    packages: [
      {
        title: 'MCBreadcrumb',
        package: 'mc-breadcrumb',
        version: '1.0.0',
        urls: [
          'https://unpkg.alibaba-inc.com/mc-breadcrumb@1.0.0/dist/MCBreadcrumb.js',
          'https://unpkg.alibaba-inc.com/mc-breadcrumb@1.0.0/dist/MCBreadcrumb.css',
        ],
        library: 'MCBreadcrumb',
      },
    ],
    components: [
      {
        componentName: 'MCBreadcrumb',
        title: 'MCBreadcrumb',
        docUrl: '',
        screenshot: '',
        npm: {
          package: 'mc-breadcrumb',
          version: '1.0.0',
          exportName: 'MCBreadcrumb',
          main: 'lib/index.js',
          destructuring: false,
          subName: '',
        },
        props: [
          {
            name: 'prefix',
            propType: 'string',
            description: '样式类名的品牌前缀',
            defaultValue: 'next-',
          },
          {
            name: 'title',
            propType: 'string',
            description: '标题',
            defaultValue: 'next-',
          },
          {
            name: 'rtl',
            propType: 'bool',
          },
          {
            name: 'children',
            propType: {
              type: 'instanceOf',
              value: 'node',
            },
            description: '面包屑子节点，需传入 Breadcrumb.Item',
          },
          {
            name: 'maxNode',
            propType: {
              type: 'oneOfType',
              value: [
                'number',
                {
                  type: 'oneOf',
                  value: ['auto'],
                },
              ],
            },
            description:
              '面包屑最多显示个数，超出部分会被隐藏, 设置为 auto 会自动根据父元素的宽度适配。',
            defaultValue: 100,
          },
          {
            name: 'separator',
            propType: {
              type: 'instanceOf',
              value: 'node',
            },
            description: '分隔符，可以是文本或 Icon',
          },
          {
            name: 'component',
            propType: {
              type: 'oneOfType',
              value: ['string', 'func'],
            },
            description: '设置标签类型',
            defaultValue: 'nav',
          },
          {
            name: 'className',
            propType: 'any',
          },
          {
            name: 'style',
            propType: 'object',
          },
        ],
        configure: {
          component: {
            isContainer: true,
            isModel: true,
            rootSelector: 'div.MCBreadcrumb',
          },
        },
      },
    ],

    componentList: [
      {
        title: '常用',
        icon: '',
        children: [
          {
            componentName: 'MCBreadcrumb',
            title: 'MC面包屑',
            icon: '',
            package: 'mc-breadcrumb',
            library: 'MCBreadcrumb',
            snippets: [
              {
                title: 'MC面包屑',
                screenshot:
                  'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_breadcrumb.png',
                schema: {
                  componentName: 'MCBreadcrumb',
                  props: {
                    title: '物料中心',
                    prefix: 'next-',
                    maxNode: 100,
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  });
};

export const preview = () => {
  saveSchema(true, true);
  setTimeout(() => {
    window.open(`./preview.html${location.search}`);
  }, 500);
};

export const saveSchema = async (showMessage?: boolean, ifRemoveConflictStyle?: boolean) => {
  const projectSchema = project.exportSchema();
  const removeStyleChildren = ifRemoveConflictStyle ? { ...projectSchema, children: removeConflictStyle(projectSchema?.componentsTree[0]?.children)} : projectSchema;
  window.localStorage.setItem(
    'projectSchema',
    JSON.stringify(removeStyleChildren)
  );
  const packages = await filterPackages(material.getAssets().packages);
  window.localStorage.setItem(
    'packages',
    JSON.stringify(packages)
  );
  if(showMessage) {Message.success('成功保存到本地');}
};

export const resetSchema = async () => {
  try {
    await new Promise<void>((resolve, reject) => {
      Dialog.confirm({
        content: '确定要重置吗？您所有的修改都将消失！',
        onOk: () => {
          resolve();
        },
        onCancel: () => {
          reject()
        },
      })
    })
  } catch(err) {
    return
  }

  let schema
  try {
    schema = await request('./schema.json')
  } catch(err) {
    schema = {
      componentName: 'Page',
      fileName: 'sample',
    }
  }

  window.localStorage.setItem(
    'projectSchema',
    JSON.stringify({
      componentsTree: [schema],
      componentsMap: material.componentsMap,
      version: '1.0.0',
      i18n: {},
    })
  );

  project.getCurrentDocument()?.importSchema(schema);
  project.simulatorHost?.rerender();
  Message.success('成功重置页面');
}

export const getPageSchema = async () => {
  const schema = JSON.parse(
    window.localStorage.getItem('projectSchema') || '{}'
  );

  const pageSchema = schema?.componentsTree?.[0];

  if (pageSchema) {
    return pageSchema;
  }
  return await request('./schema.json');
};

function request(
  dataAPI: string,
  method = 'GET',
  data?: object | string,
  headers?: object,
  otherProps?: any,
): Promise<any> {
  return new Promise((resolve, reject): void => {
    if (otherProps && otherProps.timeout) {
      setTimeout((): void => {
        reject(new Error('timeout'));
      }, otherProps.timeout);
    }
    fetch(dataAPI, {
      method,
      credentials: 'include',
      headers,
      body: data,
      ...otherProps,
    })
      .then((response: Response): any => {
        switch (response.status) {
          case 200:
          case 201:
          case 202:
            return response.json();
          case 204:
            if (method === 'DELETE') {
              return {
                success: true,
              };
            } else {
              return {
                __success: false,
                code: response.status,
              };
            }
          case 400:
          case 401:
          case 403:
          case 404:
          case 406:
          case 410:
          case 422:
          case 500:
            return response
              .json()
              .then((res: object): any => {
                return {
                  __success: false,
                  code: response.status,
                  data: res,
                };
              })
              .catch((): object => {
                return {
                  __success: false,
                  code: response.status,
                };
              });
          default:
            return null;
        }
      })
      .then((json: any): void => {
        if (json && json.__success !== false) {
          resolve(json);
        } else {
          delete json.__success;
          reject(json);
        }
      })
      .catch((err: Error): void => {
        reject(err);
      });
  });
}

export const removeConflictStyle = (components?: any) => {
  for(let i = 0; i < components?.length; i++) {
      const item = components[i];
      if(item['conflictStyle'] === 'true') {
          components[i] = addNewAddStyle(item, false);
          components[i] = addChangeStyle(item, false);
      }
      if(Array.isArray(item?.children)) {
          removeConflictStyle(item?.children);
      }
  }
  console.log(components, 'removecomps')
  return components;
}