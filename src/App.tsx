import JsonData from './edit-data.json'
import {ReactVisualEditor} from "./packages/ReactVisualEditor";
import './app.scss'
import {useState} from "react";
import {visualEditorBaseOption} from "./visual.config";
import {Input, notification} from 'antd'

function App() {

    const [formData, setFormData] = useState({
        username: 'hello world',
        maxLevel: 200,
        minLevel: 100,
    } as any)
    const [customProps] = useState({
        submitButton: {
            onClick: () => {
                notification.info({message: '执行提交表单逻辑'})
            }
        },
        changeField: {
            onChange: (e: any) => {
                notification.info({message: e.target.value})
            }
        },
    })

    return (
        <div className="app">
            <ReactVisualEditor formData={formData}
                               option={visualEditorBaseOption}
                               value={JsonData as any}
                               customBlockProps={customProps}
                               onUpdateFormData={setFormData}>
                {{
                    editUsername: ({model}) => {
                        return (
                            formData.food !== 'dangao' ?
                                <input type="text" {...model.modelValue}/> :
                                <Input {...model.modelValue}/>
                        )
                    }
                }}
            </ReactVisualEditor>
            <div style={{textAlign: 'center'}}>
                {JSON.stringify(formData)}
            </div>
        </div>
    )
}

export default App
