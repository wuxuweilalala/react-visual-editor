import './ReactVisualEditor.scss'
import {ReactVisualEditorConfig, ReactVisualEditorValue} from './ReactVisualEditor.utils';

export const ReactVisualEditor: React.FC<{
  value:ReactVisualEditorValue,
  onChange:(val:ReactVisualEditorValue) => void,
  config: ReactVisualEditorConfig
}> = (props) => {
  console.log(props);
  return (
    <div className="react-visual-editor">
      <div className="react-visual-editor-menu">
        {
          props.config.componentArray.map((component,index)=>(
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
      <div className="react-visual-editor-body">body</div>
    </div>
  );
};