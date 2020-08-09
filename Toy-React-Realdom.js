class NodeWrapper {
    constructor (type) {
        this.root = document.createElement(type)
    }
    setAttribute (name, value) {
        // \s表示空白，\S表示非空格，\s\S就表示所有字符
        if (name.match(/^on([\s\S]+)$/)) {
            let eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase())
            console.log(RegExp.$1, eventName)
            this.root.addEventListener(eventName, value)
        }
        if (name === 'className') {
            name = 'class'
        }
        this.root.setAttribute(name, value)
    } 
    appendChild (vchild) {
        let range = document.createRange() // range就是html从一个节点到另一个节点结束的范围
        if (this.root.children.length) {
            range.setStartAfter(this.root.lastChild)
            range.setEndAfter(this.root.lastChild)
        } else {
            range.setStart(this.root, 0)
            range.setEnd(this.root, 0)
        }
        vchild.mountTo(range)
    }
    mountTo (range) {
        range.deleteContents()
        range.insertNode(this.root)
    }
}

class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content)
    }
    mountTo(range) {
        range.deleteContents()
        range.insertNode(this.root)
    }
}

export class Component {
    constructor () {
        this.children = []
        this.props = Object.create(null)
    }
    setAttribute (name, value) {
        this.props[name] = value
        this[name] = value
    }
    mountTo (range) {
        this.range = range
        this.update()
    }
    update () {
         // 删除会改变range,先插入一个注释占位，再删除，否则会影响后面位置
        let placeholder = document.createComment('placeholder')
        let range = document.createRange()
        range.setStart(this.range.endContainer, this.range.endOffset)
        range.setEnd(this.range.endContainer, this.range.endOffset)
        range.insertNode(placeholder)

        this.range.deleteContents() 
        let vdom = this.render()
        vdom.mountTo(this.range) // 再渲染
    }
    appendChild (child) {
        this.children.push(child)
    }
    setState (state) {
        let merge = (oldState, newState) => {
            for (let p in newState) {
                if (typeof newState[p] === 'object' && newState[p]) {
                    if (typeof oldState[p] !== 'object') {
                        if (newState[p] instanceof Array) {
                            oldState[p] = []
                        } else {
                            oldState[p] = {}
                        }
                    }
                    merge(oldState[p], newState[p])
                } else {
                    oldState[p] = newState[p]
                }
            }
        }
        if (!this.state && state) {
            this.state = {}
        }
        merge(this.state, state)
        console.log(this.state)
        this.update()
    }
}
export let ToyReact = {
    createElement (type, attribute, ...children) {
        // debugger
        // console.log(arguments)
        console.log(type, attribute, children)
        /* 用实dom的写法Start*/
        // let ele = document.createElement(type)
        /* 用实dom的写法End */
        /* 使用虚dom */
        let ele
        if (typeof type === 'string') {
            ele = new NodeWrapper(type)
        } else {
            ele = new type
        }
        for (let name in attribute) {
            ele.setAttribute(name, attribute[name])
        }
        let insertChildren = (children) => {
            for (let child of children) {
                if (typeof child === 'object' && child instanceof Array) {
                    insertChildren(child)
                } else {
                    if (!child) {
                        child = ''
                    }
                    if (!(child instanceof Component) 
                    && !(child instanceof NodeWrapper)
                    && !(child instanceof TextWrapper)) {
                        child = String(child);
                    }
                    if (typeof child === 'string') {
                        child = new TextWrapper(child)
                    } 
                    ele.appendChild(child)
                }
            }
        }
        insertChildren(children)
        return ele
    },
    render(vdom, element) {
        // 实dom直接添加，虚dom不能这么做
        // element.appendChild(vdom)
        // 虚dom需要实现一个mountTo方法
        console.log('render', vdom, element)
        let range = document.createRange() // range就是html从一个节点到另一个节点结束的范围
        if (element.children.length) {
            range.setStartAfter(element.lastChild)
            range.setEndAfter(element.lastChild)
        } else {
            range.setStart(element, 0)
            range.setEnd(element, 0)
        }
        vdom.mountTo(range)
    }
}