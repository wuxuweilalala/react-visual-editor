import {ReactVisualEditorBlock, ReactVisualEditorConfig} from './ReactVisualEditor.utils';
import {useMemo} from 'react';

export const ReactVisualBlock:React.FC<{
  block:ReactVisualEditorBlock,
  config:ReactVisualEditorConfig
}> = (props)=>{
  const styles = useMemo(()=>{
      return {
        left:`${props.block.left}px`,
        top:`${props.block.top}px`,
      }
  },[props.block.top,props.block.left])
  const component = props.config.componentMap[props.block.componentKey];
  let render:any;
  if(!!component) {
    render = component.render()
  }
  return (
    <div className="react-visual-editor-block" style={styles}>
      {render}
    </div>
  )
}