import {VisualEditorBlock, VisualEditorModelValue, VisualEditorOption} from "./editor.utils";
import {useEffect, useState} from "react";
import deepcopy from 'deepcopy';
import {VisualEditorProp, VisualEditorPropType} from "./editor.props";
import {Alert, Button, Checkbox, Form, Input, InputNumber, Select} from "antd";

import {SketchPicker} from 'react-color'
import {TablePropEditor} from "./components/TablePropEditor/TablePropEditor";
import {useModel} from "./utils/useModel";

export interface ReactVisualEditorOperatorInstance {
    reset: () => void,
    apply: () => void,
}

export const ReactVisualEditorOperator: React.FC<{
    value: VisualEditorModelValue,
    selectBlock: VisualEditorBlock | null,
    option: VisualEditorOption,

    onChange: (val: VisualEditorModelValue) => void,
    onBlockChange: (newBlock: VisualEditorBlock, oldBlock: VisualEditorBlock) => void,
    onRef?: (ins: ReactVisualEditorOperatorInstance) => void,
}> = (props) => {

    const dataModel = useModel(null as null | any, undefined, {autoEmit: false, autoWatch: false})
    const [form] = Form.useForm()

    const methods = {
        apply: () => {
            !props.selectBlock ?
                props.onChange({
                    ...props.value,
                    container: dataModel.value,
                })
                :
                props.onBlockChange(dataModel.value, props.selectBlock)
        },
        reset: () => {
            if (!!props.selectBlock) {
                const editData = deepcopy(props.selectBlock)
                if (!editData.props) {
                    editData.props = {}
                }
                if (!editData.model) {
                    editData.model = {}
                }
                dataModel.value = editData
                form.resetFields()
                form.setFieldsValue(editData)
            } else {
                const editData = deepcopy(props.value.container)
                dataModel.value = editData
                form.resetFields()
                form.setFieldsValue(editData)
            }
        },
        onFormValuesChange: (changeValues: any, values: any) => {
            dataModel.value = {
                ...dataModel.value,
                ...values,
            }
        },
    }
    !!props.onRef && props.onRef(methods)

    useEffect(() => {
        methods.reset()
    }, [props.selectBlock])

    let EditProp: any
    let EditModel: any

    if (!dataModel.value) {
        return null
    }

    if (!props.selectBlock) {
        EditProp = <>
            <Form.Item label="容器宽度" name="width" key="width">
                <InputNumber step={100} min={0} precision={0}/>
            </Form.Item>
            <Form.Item label="容器高度" name="height" key="height">
                <InputNumber step={100} precision={0}/>
            </Form.Item>
        </>
    } else {
        const Component = props.option.componentMap[props.selectBlock.componentKey]
        if (!!Component) {
            if (!!dataModel.value.props) {
                EditProp = Object.entries(Component.props || {})
                    .map(([propName, propConfig], index) => renderEditor({
                        propName,
                        config: propConfig,
                        key: `props_${index}`,
                        editData: dataModel.value,
                        apply: methods.apply,
                    }))
            }
            if (!!Component.model) {
                EditModel = Object.entries(Component.model)
                    .map(([modifier, config], index) => renderEditor({
                        propName: modifier,
                        config,
                        key: `model_${index}`,
                        editData: dataModel.value,
                        apply: methods.apply,
                    }))
            }
        }
    }

    return (
        <div className="vue-visual-operator">
            <div>
                {!!props.selectBlock ? '组件设置' : '容器设置'}
            </div>
            <Form layout="vertical" form={form} onValuesChange={methods.onFormValuesChange}>
                {!!props.selectBlock && (
                    <Form.Item label="组件标识" name="slotName" key="slotName">
                        <Input/>
                    </Form.Item>
                )}
                {EditModel}
                {EditProp}
                <Form.Item>
                    <Button type="primary" onClick={methods.apply} style={{marginRight: '8px'}}>应用</Button>
                    <Button onClick={methods.reset}>重置</Button>
                </Form.Item>
            </Form>
        </div>
    )
}

function renderEditor({editData, key, config, propName, apply}: {
    editData: any,
    key: string,
    config: VisualEditorProp,
    propName: string,
    apply: () => void,
}) {
    switch (config.type) {
        case VisualEditorPropType.text:
            return (
                <Form.Item label={config.label} name={['props', propName]} key={key}>
                    <Input/>
                </Form.Item>
            )
        case VisualEditorPropType.color:
            return (
                <Form.Item label={config.label} key={key} name={['props', propName]} valuePropName="color">
                    <SketchPicker/>
                </Form.Item>
            )
        case VisualEditorPropType.select:
            return (
                <Form.Item label={config.label} name={['props', propName]} key={key}>
                    <Select>
                        {config.options!.map((opt, index) => (
                            <Select.Option value={opt.val} key={index}>
                                {opt.label}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            )
        case VisualEditorPropType.model:
            return (
                <Form.Item label={config.label} name={['model', propName]} key={key}>
                    <Input/>
                </Form.Item>
            )
        case VisualEditorPropType.boolean:
            return (
                <Form.Item label={config.label} name={['props', propName]} key={key} valuePropName="checked">
                    <Checkbox>
                        {editData.props[propName] ? '是' : '否'}
                    </Checkbox>
                </Form.Item>
            )
        case VisualEditorPropType.table:
            return (
                <Form.Item label={config.label} key={key} name={['props', propName]}>
                    <TablePropEditor config={config} onChange={apply}/>
                </Form.Item>
            )
        default:
            return <Alert message={`${config.type} is not exist!`} type="error" showIcon/>
    }
}