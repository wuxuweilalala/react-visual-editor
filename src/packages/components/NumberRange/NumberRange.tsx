import {useModel} from "../../utils/useModel";
import './NumberRange.scss'

export const NumberRange: React.FC<{
    start?: number,
    end?: number,
    onStartChange?: (val?: number) => void,
    onEndChange?: (val?: number) => void,
    width?: number
}> = (props) => {

    const startModel = useModel(props.start, props.onStartChange)
    const endModel = useModel(props.end, props.onEndChange)

    return (
        <div className="number-range" style={{width: `${props.width || 225}px`}}>
            <input type="text" defaultValue={startModel.value} onChange={startModel.onChange}/>
            <i>~</i>
            <input type="text" defaultValue={endModel.value} onChange={endModel.onChange}/>
        </div>
    )
}