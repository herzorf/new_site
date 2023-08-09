import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import http from '../../http'

interface productState {
    productList: any
    getProductList: () => void
}

export const useProductStore = create<productState>()(
    (set) => ({
        productList: 0,
        getProductList: async () => {
            http("/system/product/list", {}).then((res) => {
                const result = res.data.rows
                result.forEach((item: any) => {
                    item.key = item.productId
                })
                set({ productList: result })
            })
        }
    }),
)

export const textMap = {
    createBy: "创建人",
    createTime: "创建时间",
    updateBy: "更新人",
    updateTime: "更新时间",
    remark: "备注",
    productId: '商品ID',
    productName: '商品名称',
    supplier: '供应商',
    salePrice: '销售价格',
    storeNum: '库存数量',
}