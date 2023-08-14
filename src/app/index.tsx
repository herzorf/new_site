import styles from './index.module.scss'
import Table, { ColumnsType } from 'antd/es/table';
import { Button, Col, Descriptions, Form, Input, Modal, Row } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useEffect, useLayoutEffect, useState } from 'react';
import http from '../http';
import { checkExpression, textMap, useProductStore } from './state';
import { Select, Space } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { DefaultOptionType } from 'antd/es/select';

import { SelectProps } from 'antd/lib/select';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};
type onChange = Required<SelectProps<string>>['onChange'];
interface DataType {
  productId: Number;
  supplier: string;
  storeNum: number;
  salePrice: number;
  productName: string;
}

interface MoreInfoType {
  label: string;
  value: string;
  key: string;
}

const kindArray = ['小轿车', '越野车（含suv）', '新能源汽车'];


const limits = ["包含", "不包含", "等于", "不等于", "大于", "小于", "大于等于", "小于等于", "为空", "不为空", "开始为", "结束为"]

type kindName = "小轿车" | "越野车（含suv）" | "新能源汽车"




const App: React.FC = () => {
  const { Search } = Input;

  const columns: ColumnsType<DataType> = [
    {
      title: '商品id',
      width: 50,
      dataIndex: 'productId',
      key: 'productId',
    },
    {
      title: '商品名称',
      width: 100,
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 100,
    },
    {
      title: '销售价格',
      dataIndex: 'salePrice',
      key: 'salePrice',
      width: 50,
    },
    {
      title: '库存数量',
      dataIndex: 'storeNum',
      key: 'storeNum',
      width: 50,
    },
    {
      title: '操作',
      key: 'operation',
      fixed: 'right',
      width: 100,
      render: (text, record, index) => {
        return (<div style={{ textAlign: "center" }}>
          <Button type="primary" onClick={() => deleteInfo(record.productId)} danger>
            删除
          </Button>
          &nbsp;&nbsp;
          &nbsp;&nbsp;
          &nbsp;&nbsp;
          <Button type="primary" onClick={() => {
            setEditId(record.productId)
            setOpen(true)
          }}>
            编辑
          </Button>
          &nbsp;&nbsp;
          &nbsp;&nbsp;
          &nbsp;&nbsp;
          <Button onClick={() => showMoreInfo(record.productId)} >
            查看详情
          </Button>

        </div>)
      }
    },
  ];
  const [kind, setKind] = useState<kindName>("小轿车")
  const [editId, setEditId] = useState<Number | null | string>(null)
  const [moreInfo, setMoreInfo] = useState<MoreInfoType[]>()
  const [valueArray, setValueArray] = useState<Array<any>>([])
  const [value, setValue] = useState<string>(valueArray[0])
  const [open, setOpen] = useState(false);
  const [searchToggle, setSearchToggle] = useState(false)
  const [form] = Form.useForm();
  const [moreInfoToggle, setMoreInfoToggle] = useState(false)
  const [attributeArray, setAttributeArray] = useState<Array<any>>();
  const [attribute, setAttribute] = useState<string>();
  const [limitsValue, setLimitsValue] = useState<string>(limits[0]);
  const [searchCondition, setSearchCondition] = useState<string>("");

  const productList = useProductStore(state => state.productList)
  const getProductList = useProductStore(state => state.getProductList)
  const deleteInfo = (productId: Number) => {
    http(`/system/product/${productId}`, { method: "delete" }).then((res) => {
      res.data.code === 200 && getProductList()
    })
  }
  const showMoreInfo = (productId: Number) => {
    setMoreInfoToggle(true)
    http(`/system/product/${productId}`, { params: { productId } }).then(res => {
      const result = res.data.data
      const temp = []
      for (let key in result) {
        if (result[key] !== null) {
          const obj = {
            label: textMap[key as keyof typeof textMap],
            value: result[key] as string,
            key: key
          }
          temp.push(obj)
        }
      }
      setMoreInfo(temp)
    })
  }

  useEffect(() => {
    if (editId !== null) {
      http(`/system/product/${editId}`).then((res) => {
        form.setFieldsValue(res.data.data)
      })
    } else {
      form.resetFields()
    }
  }, [editId])

  useLayoutEffect(() => {
    getProductList()
  }, [])


  const handleKindChange = (value: string) => {
    http("/system/attribute/list", { params: { kind: value } }).then(res => {
      setAttributeArray(res.data.rows)
    })
  };
  useEffect(() => {
    handleKindChange(kind)
  }, [])
  useEffect(() => {
    setAttribute(attributeArray?.[0].attributeName)
    onAttributeChange(attributeArray?.[0].attributeName, { value: attributeArray?.[0].attributeId })
  }, [attributeArray])

  const onAttributeChange = (value: string, options: any) => {
    http("/system/value/list", { params: { attributeId: options.value } }).then(res => {
      if (res.data.code === 200) {
        console.log(res.data.rows[0])
        setValue(res.data.rows[0]?.attributeValue)
        setValueArray(res.data.rows)
      }
    })
  };

  const addSearchCondition = (value: string, flag: boolean) => {
    // true 代表只添加逻辑运算符
    if (flag) {
      setSearchCondition(searchCondition + value + "\n")
    } else {
      setSearchCondition(searchCondition + attribute + " " + limitsValue + " " + value + "\n");
    }
    console.log(searchCondition)
  }

  useEffect(() => {
    console.log(checkExpression(searchCondition))
  }, [searchCondition])

  const onFinish = (values: any) => {
    // 判断表单的校验是否通过
    form.validateFields().then(() => {
      // 校验通过
      http("/system/product", {
        method: editId === null ? "post" : "put",
        data: {
          productId: editId, ...form.getFieldsValue()
        }
      }).then((res) => {
        res.data.code === 200 && getProductList()
      })
      setOpen(false)
    }).catch((errorInfo) => {
      console.log(errorInfo);
    })

  }
  const onSearch = (value: string) => {
    http("/system/product/list", { params: { productName: value } }).then((res) => {
      useProductStore.setState({ productList: res.data.rows })
    })
  }

  return (
    <div className={styles.app}>
      <div className="operate">
        <Button type="primary" size='large' onClick={() => {
          setEditId(null)
          setOpen(true)
        }} icon={<PlusOutlined />}>
          添加
        </Button>
        &nbsp;&nbsp;
        &nbsp;&nbsp;
        <Search placeholder="输入商品名称进行查询" size='large' onSearch={onSearch} enterButton />
        <Button
          style={{ marginLeft: "200px" }}
          icon={<SearchOutlined />}
          size='large'
          onClick={() => setSearchToggle(true)}
        >搜索</Button>
      </div>

      <Table columns={columns} dataSource={productList} bordered size='small' scroll={{ x: 1500, y: 600 }} />
      <Modal
        title={editId === null ? '添加车辆信息' : '编辑车辆信息'}
        centered
        open={open}
        onOk={onFinish}
        onCancel={() => setOpen(false)}
        width={800}
        bodyStyle={{ display: "flex", justifyContent: "center" }}
        okText="确认"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="horizontal"
          {...layout}
          style={{ width: '80%' }}
          name="form_in_modal"
        >
          <Form.Item
            name="productName"
            label="商品名称"
            rules={[{ required: true, message: '不允许为空' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="supplier"
            label="供应商"
            rules={[{ required: true, message: '不允许为空' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="salePrice"
            label="销售价格"
            rules={[{
              required: true,
              type: "number",
              transform: (value: string) => Number(value),
              message: '不允许为空且必须为数字'
            }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="storeNum"
            label="库存数量"
            rules={[{
              required: true,
              type: "number",
              transform: (value: string) => Number(value),
              message: '不允许为空且必须为数字'
            }]}
          >
            <Input />
          </Form.Item>

        </Form>

      </Modal>

      <Modal
        title={"更多信息"}
        centered
        open={moreInfoToggle}
        onOk={onFinish}
        onCancel={() => setMoreInfoToggle(false)}
        width={800}
        bodyStyle={{ display: "flex", justifyContent: "center" }}
        footer={null}
      >
        <Descriptions bordered>
          {moreInfo?.map((item) => {
            return <Descriptions.Item label={item.label} key={item.key}>{item.value}</Descriptions.Item>

          })}
        </Descriptions>

      </Modal>
      <Modal
        title="搜索条件"
        centered
        open={searchToggle}
        onOk={() => setSearchToggle(false)}
        onCancel={() => setSearchToggle(false)}
        width={1000}
        okText="搜索"
        footer={[
          <Button danger key="reset" onClick={() => setSearchCondition("")}>
            清空
          </Button>,
          <Button key="submit" type="primary" onClick={() => setOpen(false)}>
            搜索
          </Button>,
        ]}
      >
        <br />
        <Row>
          <Col span={8}>
            <Select
              defaultValue={kind[0] as kindName}
              style={{ width: 300 }}
              value={kind}
              onChange={handleKindChange}
              options={kindArray.map((item) => ({ label: item, value: item }))}
            />
          </Col>
          <Col span={8}>
            <Select
              style={{ width: 300 }}
              value={attribute as kindName}
              onChange={onAttributeChange}
              options={attributeArray?.map((item) => ({ label: item.attributeName, value: item.attributeId }))}
            />
          </Col>

          <Col span={8}>
            <Select
              style={{ width: 300 }}
              value={limitsValue}
              onChange={(value) => { setLimitsValue(value) }}
              options={limits?.map((city) => ({ label: city, value: city }))}
            />
          </Col>
        </Row>
        <br />
        <Row>
          <Col span={20}>
            <Select
              style={{ width: "100%" }}
              value={value}
              onChange={(value) => { setValue(value) }}
              options={valueArray?.map((value) => ({ label: value.attributeValue, value: value.attributeValue }))}
            />
          </Col>
          <Col span={2} offset={1}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => addSearchCondition(value, false)} >添加</Button>
          </Col>
        </Row>
        <br />
        <Space>
          <Button onClick={() => addSearchCondition("并且", true)}>并且</Button>
          <Button onClick={() => addSearchCondition("或者", true)}>或者</Button>
          <Button onClick={() => addSearchCondition("非", true)}>非</Button>
          <Button onClick={() => addSearchCondition("(", true)}>(</Button>
          <Button onClick={() => addSearchCondition(")", true)}>)</Button>
        </Space>
        <br />
        <br />

        <TextArea
          maxLength={1000}
          readOnly
          value={searchCondition}
          style={{ height: 120, resize: 'none' }}
        />
      </Modal>
    </div >
  )

}

export default App;
