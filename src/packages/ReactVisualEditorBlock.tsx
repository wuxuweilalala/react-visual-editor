import {VisualEditorBlock, VisualEditorOption} from "./editor.utils";
import {useContext, useEffect, useMemo, useRef} from "react";
import deepcopy from 'deepcopy'
import classnames from 'classnames'
import {Alert} from "antd";
import {VisualDragEvent} from "./ReactVisualEditor";
import {useModel} from "./utils/useModel";

export const VisualEventContext = React.createContext<VisualDragEvent>({} as any)
export type VisualSlotRenderData = { block: VisualEditorBlock, props: Record<string, any>, custom: Record<string, any>, model: any }
export type VisualSlot = Record<string, (data: VisualSlotRenderData) => JSX.Element>

export const VisualEditorBlockRender: React.FC<{
    data: VisualEditorBlock,
    option: VisualEditorOption,
    formData: Record<string, any>,
    preview?: boolean,
    editSlots?: VisualSlot,
    customBlockProps?: Record<string, (() => Record<string, any>) | Record<string, any>>,

    onUpdateFormData: (val: Record<string, any>) => void,
    onMousedown?: (e: React.MouseEvent<HTMLDivElement>) => void,
    onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void,
    onAdjustPosition?: (newBlock: VisualEditorBlock, oldBlock: VisualEditorBlock) => void,
}> = (props) => {

    const data = useModel(props.data)
    const el = useRef({} as HTMLDivElement)
    const updater = useModel(0, undefined, {autoEmit: false, autoWatch: false})

    useEffect(() => {
        const {offsetWidth, offsetHeight} = el.current;
        const data = deepcopy(props.data);

        if (!data.width) data.width = offsetWidth
        if (!data.height) data.height = offsetHeight

        if (props.data.adjustPosition) {
            data.left = props.data.left - offsetWidth / 2;
            data.top = props.data.top - offsetHeight / 2;
            data.adjustPosition = false
            !!props.onAdjustPosition && props.onAdjustPosition(data, props.data)
        }
    }, [])

    const {option} = props
    const renderProps = {
        block: {
            style: {
                top: `${data.value.top}px`,
                left: `${data.value.left}px`,
                zIndex: data.value.zIndex,
            } as any,
        }
    }
    const Component = option.componentMap[data.value.componentKey]
    // console.log(Component, option.componentMap, data.componentKey)

    let Render: any = null
    if (!!Component) {

        const custom = (() => {
            if (!(!!props.customBlockProps && !!data.value.slotName && !!props.customBlockProps[data.value.slotName])) {
                return {}
            }
            const c = props.customBlockProps[data.value.slotName]
            return typeof c === "function" ? c() : c
        })();

        const renderData = {
            block: data.value,
            props: data.value.props || {},
            custom,
            model: (() => {
                const models = Object.entries(Component.model || {})
                if (models.length === 0) return {}
                const formData = props.formData as Record<string, any>
                return models.reduce((prev, [modifier]) => {
                    const bindField = !data.value.model ? null : data.value.model[modifier]
                    prev[modifier] = {
                        value: !bindField ? '' : formData[bindField],
                        onChange: (() => {
                            return (val: any) => {
                                /*
                                *  再取一次 bindField，很奇怪的bug
                                */
                                const bindField = !data.value.model ? null : data.value.model[modifier]
                                if (!bindField) return
                                if (!!val && typeof val === "object" && 'target' in val) {
                                    formData[bindField] = val.target.value
                                } else {
                                    formData[bindField] = val
                                }
                                props.onUpdateFormData({...formData});
                                !!custom.onChange && custom.onChange(val)
                            }
                        })(),
                    }
                    return prev
                }, {} as Record<string, Record<string, any>>)
            })(),
        }
        if (!!data.value.slotName && props.editSlots && !!props.editSlots[data.value.slotName]) {
            Render = props.editSlots[data.value.slotName](renderData)
        } else {
            Render = Component.render(renderData)
        }
    } else {
        Render = <Alert message={`${data.value.componentKey} is not exist!`} type="error" showIcon/>
    }

    return (
        <div className={classnames(['vue-visual-block', {'vue-visual-block-focus': data.value.focus,}])}
             {...renderProps.block}
             ref={el}
             onMouseDown={props.onMousedown}
             onContextMenu={props.onContextMenu}
        >
            {Render}
            {!props.preview && !!Component && !!Component.resize && data.value.focus && (
                <VisualEditorBlockResizer updater={updater} resize={Component.resize} block={data.value}/>
            )}
        </div>
    )
}

enum Direction {
    start = 'start',
    center = 'center',
    end = 'end',
}

export const VisualEditorBlockResizer: React.FC<{
    resize: { width?: boolean, height?: boolean },
    block: VisualEditorBlock,
    updater: { value: number }
}> = (props) => {

    const event = useContext(VisualEventContext)
    const draggier = useMemo(() => {
        let data = {
            startBlock: props.block,
            startX: 0,
            startY: 0,
            direction: {vertical: Direction.start, horizontal: Direction.start},
            dragging: false,
        }

        const onMousedown = (e: React.MouseEvent<HTMLDivElement>, direction: { vertical: Direction, horizontal: Direction }) => {
            e.stopPropagation()
            data = {
                startBlock: deepcopy(props.block),
                startX: e.clientX,
                startY: e.clientY,
                direction,
                dragging: false,
            }
            document.addEventListener('mousemove', onMousemove)
            document.addEventListener('mouseup', onMouseup)
        }
        const onMouseup = () => {
            document.removeEventListener('mousemove', onMousemove)
            document.removeEventListener('mouseup', onMouseup)
            if (data.dragging) {
                event.emit.dragend()
            }
        }
        const onMousemove = (e: MouseEvent) => {
            const {clientX: moveX, clientY: moveY} = e
            const {startX, startY, direction, dragging, startBlock: {width, height, top, left}} = data
            const block = props.block as VisualEditorBlock
            if (!dragging) {
                event.emit.dragstart()
                data.dragging = true
            }
            let durX = direction.horizontal === Direction.center ? 0 : (moveX - startX)
            let durY = direction.vertical === Direction.center ? 0 : (moveY - startY)

            if (direction.horizontal === Direction.start) {
                durX = -durX
                block.left = left - durX
            }
            if (direction.vertical === Direction.start) {
                durY = -durY
                block.top = top - durY
            }

            block.width = width + durX
            block.height = height + durY
            props.updater.value++
        }
        return {
            onMousedown,
        }
    }, [props.resize, props.block])

    return <>
        {!!props.resize.height && <>
            <div className="visual-block-resize  visual-block-resize-top" onMouseDown={e => draggier.onMousedown(e, {vertical: Direction.start, horizontal: Direction.center})}/>
            <div className="visual-block-resize  visual-block-resize-bottom" onMouseDown={e => draggier.onMousedown(e, {vertical: Direction.end, horizontal: Direction.center})}/>
        </>}
        {!!props.resize.width && <>
            <div className="visual-block-resize  visual-block-resize-left" onMouseDown={e => draggier.onMousedown(e, {vertical: Direction.center, horizontal: Direction.start})}/>
            <div className="visual-block-resize  visual-block-resize-right" onMouseDown={e => draggier.onMousedown(e, {vertical: Direction.center, horizontal: Direction.end})}/>
        </>}
        {!!props.resize.height && !!props.resize.width && <>
            <div className="visual-block-resize  visual-block-resize-top-left" onMouseDown={e => draggier.onMousedown(e, {vertical: Direction.start, horizontal: Direction.start})}/>
            <div className="visual-block-resize  visual-block-resize-top-right" onMouseDown={e => draggier.onMousedown(e, {vertical: Direction.start, horizontal: Direction.end})}/>
            <div className="visual-block-resize  visual-block-resize-bottom-left" onMouseDown={e => draggier.onMousedown(e, {vertical: Direction.end, horizontal: Direction.start})}/>
            <div className="visual-block-resize  visual-block-resize-bottom-right" onMouseDown={e => draggier.onMousedown(e, {vertical: Direction.end, horizontal: Direction.end})}/>
        </>}
    </>
}