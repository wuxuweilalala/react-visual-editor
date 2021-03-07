import {ReactVisualEditorBlock, ReactVisualEditorConfig} from './ReactVisualEditor.utils';
import {useEffect, useMemo, useRef} from 'react';
import {useUpdate} from './hook/useUpdate';
import classNames from 'classnames';

export const ReactVisualBlock: React.FC<{
  block: ReactVisualEditorBlock,
  config: ReactVisualEditorConfig,
  onMouseDown?:(e:React.MouseEvent<HTMLDivElement>)=>void
}> = (props) => {

  const {forceUpdate} = useUpdate();

  const styles = useMemo(() => {
    return {
      left: `${props.block.left}px`,
      top: `${props.block.top}px`,
      opacity: props.block.adjustPosition ? '0' : '1'
    };
  }, [props.block.top, props.block.left, props.block.adjustPosition]);

  const classes = useMemo(()=>classNames([
    'react-visual-editor-block',
    {
      'react-visual-editor-block-focus':props.block.focus
    }
    ]),[props.block.focus])

  const component = props.config.componentMap[props.block.componentKey];
  let render: any;
  if (!!component) {
    render = component.render();
  }

  const elRef = useRef({} as HTMLDivElement);

  useEffect(() => {
    if (props.block.adjustPosition) {
      const {top, left} = props.block;
      const {height, width} = elRef.current.getBoundingClientRect();
      props.block.adjustPosition = false;
      props.block.top = top - height / 2;
      props.block.left = left - width / 2;
      forceUpdate();
    }
  }, []);


  return (
    <div className={classes}
         ref={elRef}
         style={styles}
         onMouseDown={props.onMouseDown}
    >
      {render}
    </div>
  );
};