import './ReactVisualEditor.scss';
import {ReactVisualEditorConfig, ReactVisualEditorValue} from './ReactVisualEditor.utils';
import {useMemo} from 'react';
import {ReactVisualBlock} from './ReactVisualBlock';

export const ReactVisualEditor: React.FC<{
  value: ReactVisualEditorValue,
  onChange: (val: ReactVisualEditorValue) => void,
  config: ReactVisualEditorConfig
}> = (props) => {

  const containerStyles = useMemo(() => {
    return {
      height: `${props.value.container.height}px`,
      width: `${props.value.container.width}px`,
    };
  }, [props.value.container.width, props.value.container.height]);

  return (
    <div className="react-visual-editor">
      <div className="react-visual-editor-menu">
        {
          props.config.componentArray.map((component, index) => (
            <div className="react-visual-editor-menu-item" key={index}>
              {component.preview()}
              <div className="react-visual-editor-menu-item-name">
                {component.name}
              </div>
            </div>
          ))
        }
      </div>
      <div className="react-visual-editor-head">head</div>
      <div className="react-visual-editor-operator">operator</div>
      <div className="react-visual-editor-body">
        <div className="react-visual-editor-container" style={containerStyles}>
          {
            props.value.blocks.map((block, index) => (
                <ReactVisualBlock
                  block={block}
                  key={index}
                  config={props.config}
                />
              )
            )
          }
        </div>
      </div>
    </div>
  );
};