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

export function checkExpression(string: string) {
    let msg = "校验通过";
    // 剔除空白符
    string = string.replace(/\s/g, "");

    // 错误情况，空字符串
    if (string === "") {
        msg = "请输入条件表达式";
        return msg;
    }

    // 错误情况，括号不配对
    const stack = [];
    for (let i = 0, item; i < string.length; i++) {
        item = string.charAt(i);
        if ("(" === item) {
            stack.push("(");
        } else if (")" === item) {
            if (stack.length > 0) {
                stack.pop();
            } else {
                stack.push(")");
            }
        }
    }
    if (stack.length !== 0) {
        msg = "括号不匹配";
        return msg;
    }

    // 空括号
    if (/\(\)/.test(string)) {
        msg = "存在空括号";
        return msg;
    }

    //错误情况，并且,或者不能在首位，且不能存在 \( (并且|或者) (并且|或者)\)
    const matchResult = string.match(/^(并且|或者)|(\((并且|或者))|((并且|或者)\))/g);
    if (matchResult) {
        msg =
            "条件运算符【" +
            (matchResult[0].includes("并且") ? "并且" : "或者") +
            "】只能用来连接两个完整的条件";
        return msg;
    }

    // 错误情况，运算符连续
    if (/(并且|或者){2,}/.test(string)) {
        msg = "运算符连续";
        return msg;
    }

    // 错误情况，非运算符前不能跟 ) 和条件
    if (/[\\)]非/.test(string)) {
        msg = "非运算符前需要有条件运算符";
        return msg;
    }

    // 错误情况，非运算符后不能跟 ) 并且, 或者
    if (new RegExp("非(\\)|并且|或者)").test(string)) {
        msg = "非运算符后需要紧跟条件";
        return msg;
    }

    // 错误情况，不能以运算符结尾
    if (/(并且|或者|非)$/.test(string)) {
        msg = "条件表达式不完整";
        return msg;
    }

    // 错误情况，(后面是运算符
    if (/\(["并且","或者"]/.test(string)) {
        return msg;
    }

    // 错误情况，)前面是运算符
    if (/["并且","或者"]\)/.test(string)) {
        return msg;
    }

    return msg;
}
