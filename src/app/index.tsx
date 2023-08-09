import styles from './index.module.scss'
import Table, { ColumnsType } from 'antd/es/table';
import { Button, Descriptions, Form, Input, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useLayoutEffect, useState } from 'react';
import http from '../http';
import { textMap, useProductStore } from './state';

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
  const [editId, setEditId] = useState<Number | null | string>(null)
  const [moreInfo, setMoreInfo] = useState<MoreInfoType[]>()
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

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [moreInfoToggle, setMoreInfoToggle] = useState(false)
  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 },
  };

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
    </div >
  )

}

export default App
