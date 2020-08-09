let childrenSymbol = Symbol('children')
class NodeWrapper {
    constructor (type) {
       this.type = type
       this.props = Object.create(null)  // 存attribue
       this[childrenSymbol] = [] // 存child
       this.children = []
    }
    setAttribute (name, value) {
        this.props[name] = value
    }
    appendChild (vchild) {
        this[childrenSymbol].push(vchild)
        this.children.push(vchild.vdom)
    }
    get vdom () {
        return this
    }
    mountTo (range) {
        this.range = range

        let placeholder = document.createComment('placeholder')
        let endRange = document.createRange()
        endRange.setStart(range.endContainer, range.endOffset)
        endRange.setEnd(range.endContainer, range.endOffset)
        endRange.insertNode(placeholder)

        range.deleteContents()
        let ele = document.createElement(this.type)
        // 加入attribute
        for (let name in this.props) {
            let attr = this.props[name]
            if (name.match(/^on([\s\S]+)$/)) {
                let eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase())
                ele.addEventListener(eventName, attr)
            }
            if (name === 'className') {
                name = 'class'
            }
            ele.setAttribute(name, attr)
        }
        // 加入child
        for (let child of this.children) {
            let range = document.createRange() // range就是html从一个节点到另一个节点结束的范围
            if (ele.children.length) {
                range.setStartAfter(ele.lastChild)
                range.setEndAfter(ele.lastChild)
            } else {
                range.setStart(ele, 0)
                range.setEnd(ele, 0)
            }
            child.mountTo(range)
        }
        range.insertNode(ele)
    }
}

class TextWrapper {
    constructor(content) {
        this.children = []
        this.type = "#text"
        this.props = Object.create(null)
        this.root = document.createTextNode(content)
    }
    get vdom () {
        return this
    }
    mountTo(range) {
        this.range = range
        range.deleteContents()
        range.insertNode(this.root)
    }
}

export class Component {
    constructor () {
        this.children = []
        this.props = Object.create(null)
    }
    get type () {
        return this.constructor.name
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
        let vdom = this.vdom
        if (this.oldVdom) {
            console.log('old:new', this.vdom, vdom)
            let sameNode = (node1, node2) => {
                if (node1.type !== node2.type) {
                    return false
                }
                if (Object.keys(node1).length != Object.keys(node2).length) {
                    return false
                }
                for (let name in node1.props) {
                    if (node1.props[name] !== node2.props[name]) {
                        return false
                    }
                }
                return true
            }

            let sameTree = (node1, node2) => {
                if (!sameNode(node1, node2)) {
                    return false
                }
                if (node1.children.length !== node2.children.length) {
                    return false
                }
                for (let i = 0; i < node1.children.length; i++) {
                    if (!sameTree(node1.children[i], node2.children[i])) {
                        return false
                    }
                }
                return true
            }
            
            let replace = (newNode, oldNode) => {
                if (sameTree(newNode, oldNode)) {
                    return
                }
                if (!sameNode(newNode, oldNode)) {
                    newNode.mountTo(oldNode.range)
                    return
                }
                for (let i = 0; i < newNode.children.length; i++) {
                    replace(newNode.children[i], oldNode.children[i])
                }
            }
            replace(vdom, this.oldVdom)
        } else {
            vdom.mountTo(this.range)
        }
        this.oldVdom = vdom
    }
    appendChild (child) {
        this.children.push(child)
    }
    get vdom () {
        return this.render().vdom
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
        // console.log(type, attribute, children)
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
        // console.log('render', vdom, element)
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