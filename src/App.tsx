import {useRef, useState} from 'react';
import {useCallbackRef} from './packages/hook/useCallbackRef';
import {ReactVisualEditor} from './packages/ReactVisualEditor';

function App() {

  const [pos, setPos] = useState({
    left: 0,
    top: 0
  });

  const moveDraggier = (() => {
    const dragData = useRef({
      startTop: 0,
      startLeft: 0,
      startX: 0,
      startY: 0
    });

    const mousedown = useCallbackRef((e: React.MouseEvent<HTMLDivElement>) => {
      document.addEventListener('mousemove', mousemove);
      document.addEventListener('mouseup', mouseup);
      dragData.current = {
        startTop: pos.top,
        startLeft: pos.left,
        startX: e.clientX,
        startY: e.clientY
      };
    });
    const mousemove = useCallbackRef((e: MouseEvent) => {
      const {startX, startY, startLeft, startTop} = dragData.current;
      const durX = e.clientX - startX;
      const durY = e.clientY - startY;
      setPos({
        left: startLeft + durX,
        top: startTop + durY
      });
      console.log(pos);
    });
    const mouseup = useCallbackRef((e: MouseEvent) => {
      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('mouseup', mouseup);
    });
    return {mousedown};
  })();

  return (
    <>
      {/*<div
        style={{
          width: '50px',
          height: '50px',
          position: 'relative',
          background: 'blue',
          left: `${pos.left}px`,
          top: `${pos.top}px`
        }}
        onMouseDown={moveDraggier.mousedown}
      >
      </div>*/}
      <ReactVisualEditor />
    </>
  );
}

export default App;
