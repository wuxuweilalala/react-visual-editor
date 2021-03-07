import './ReactVisualEditor.scss';
import {
  createVisualBlock,
  createVisualConfig, ReactVisualEditorBlock,
  ReactVisualEditorComponent,
  ReactVisualEditorConfig,
  ReactVisualEditorValue
} from './ReactVisualEditor.utils';
import {useMemo, useRef} from 'react';
import {ReactVisualBlock} from './ReactVisualBlock';
import {useCallbackRef} from './hook/useCallbackRef';

export const ReactVisualEditor: React.FC<{
  value: ReactVisualEditorValue,
  onChange: (val: ReactVisualEditorValue) => void,
  config: ReactVisualEditorConfig
}> = (props) => {

    /**
      * container dom对象的引用
      * @author 邬绪威
      * @date 2021/3/7 16:57
      */
  const containerRef = useRef({} as HTMLDivElement);


    /**
      * container dom对象的样式
      * @author 邬绪威
      * @date 2021/3/7 17:10
      */
  const containerStyles = useMemo(() => {
    return {
      height: `${props.value.container.height}px`,
      width: `${props.value.container.width}px`,
    };
  }, [props.value.container.width, props.value.container.height]);

    /**
      * 计算当前数据中，哪些block是选中的，哪些是未选中的
      * @author 邬绪威
      * @date 2021/3/7 17:36
      */
    const focusData = useMemo(()=>{
      const focus:ReactVisualEditorBlock[] = [];
      const unFocus:ReactVisualEditorBlock[] = [];
      props.value.blocks.forEach(block=>{(block.focus?focus:unFocus).push(block)})
      return {focus,unFocus}
    },[props.value.blocks])

    /**
      * 对外暴露的方法
      * @author 邬绪威
      * @date 2021/3/7 17:31
      */

    const methods = {
        /**
          * 更新blocks，触发重新渲染
          * @author 邬绪威
          * @date 2021/3/7 17:40
          */
      updateBlocks:(blocks:ReactVisualEditorBlock[])=>{props.onChange({...props.value,blocks:[...blocks]})},
        /**
          * 清空选中的元素
          * @author 邬绪威
          * @date 2021/3/7 17:40
          */
      clearFocus:(external?:ReactVisualEditorBlock)=> {
        (!!external ? focusData.focus.filter(item=>item!==external) : focusData.focus).forEach(block=>block.focus=false)
          methods.updateBlocks(props.value.blocks)
      }
    }


  /**
    * 拖拽处理逻辑， 处理从menu菜单中拖拽预定义的组件到容器中
    * @author 邬绪威
    * @date 2021/3/7 17:10
    */
  const menuDraggier = (() => {

    const dragData = useRef({
      dragComponent: null as null | ReactVisualEditorComponent
    });

    const block = {
      dragstart: useCallbackRef((e: React.DragEvent<HTMLDivElement>, dragComponent: ReactVisualEditorComponent) => {
        containerRef.current.addEventListener('dragenter', container.dragenter);
        containerRef.current.addEventListener('dragover', container.dragover);
        containerRef.current.addEventListener('dragleave', container.dragleave);
        containerRef.current.addEventListener('drop', container.drop);
        dragData.current.dragComponent = dragComponent;
      }),
      dragend: useCallbackRef((e: React.DragEvent<HTMLDivElement>) => {
        containerRef.current.removeEventListener('dragenter', container.dragenter);
        containerRef.current.removeEventListener('dragover', container.dragover);
        containerRef.current.removeEventListener('dragleave', container.dragleave);
        containerRef.current.removeEventListener('drop', container.drop);
      })
    };

    const container = {
      dragenter: useCallbackRef((e: DragEvent) => {e.dataTransfer!.dropEffect = 'move';}),
      dragover: useCallbackRef((e: DragEvent) => {
        e.preventDefault();
      }),
      dragleave: useCallbackRef((e: DragEvent) => {
        e.dataTransfer!.dropEffect = 'none';
      }),
      drop: useCallbackRef((e: DragEvent) => {
        props.onChange({
          ...props.value,
          blocks: [...props.value.blocks, createVisualBlock({
            top: e.offsetY,
            left: e.offsetX,
            component: dragData.current.dragComponent!
          })
          ],
        });
      }),
    };
    return block;

  })();
    /**
      * 处理 block 元素的选中逻辑
      * @author 邬绪威
      * @date 2021/3/7 17:12
      */
  const focusHandler = (()=>{
    const block = (e:React.MouseEvent<HTMLDivElement>,block:ReactVisualEditorBlock) => {
      if(e.shiftKey) {
        /*如果摁住了shift键，如果此时没有选中的block，就选中这个block，否则令这个block的选中状态取反*/
        if(focusData.focus.length <=1 ) {
          block.focus = true
        }else {
          block.focus = !block.focus
        }
        methods.updateBlocks(props.value.blocks)
      }else {
        /*如果点击的这个block没有被选中，才清空其他选中的block。否则不做任何事情。*/
        if(!block.focus) {
          block.focus = true
          methods.clearFocus(block)
        }
      }
    }

    const container = (e:React.MouseEvent<HTMLDivElement>) => {
      if(e.target !== e.currentTarget) {return}
      if(!e.shiftKey) {methods.clearFocus()}
      console.log('container 点击了');
    }
    return {block,container}

  })();

  return (
    <div className="react-visual-editor">
      <div className="react-visual-editor-menu">
        {
          props.config.componentArray.map((component, index) => (
            <div className="react-visual-editor-menu-item" key={index}
                 draggable
                 onDragStart={e => menuDraggier.dragstart(e, component)}
                 onDragEnd={menuDraggier.dragend}
            >
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
        <div className="react-visual-editor-container"
             style={containerStyles}
             ref={containerRef}
             onMouseDown={focusHandler.container}
        >
          {
            props.value.blocks.map((block, index) => (
                <ReactVisualBlock
                  block={block}
                  key={index}
                  onMouseDown={e=>focusHandler.block(e,block)}
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