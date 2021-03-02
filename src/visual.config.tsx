import {createVisualConfig} from './packages/ReactVisualEditor.utils';
import {Button} from 'antd';

export const visualConfig = createVisualConfig();

visualConfig.registryComponent('text', {
  name: '文本',
  preview: () => <span>预览文本</span>,
  render: () => <span>渲染文本</span>
});

visualConfig.registryComponent('button', {
  name: '按钮',
  preview: () => <Button type="primary">预览按钮</Button>,
  render: () => <Button type="primary">渲染按钮</Button>
});

visualConfig.registryComponent('input', {
  name: '输入框',
  preview: () => <input />,
  render: () => <input />
});
