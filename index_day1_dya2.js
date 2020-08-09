import {ToyReact, Component} from './Toy-React.js'

class MyComponent extends Component {
    render () {
        return <div>
            <span>123</span>
            <span>456</span>
            <span>789</span>
            <div> 
                { this.children }
                { true }
                {/* 这种情况child就是一个数组 */}
            </div>  
        </div>
    }
}

//jsx语法, 让dom可以作为右值，实际调用了createElement,又是在pragma中指定的createElement
// let a = <MyComponent name="a" id="fid">
//     <div>000</div>
// </MyComponent>
// console.log('a is :', a)
// // 把a放在body上
// ToyReact.render(
//     a,
//     document.body
// )

// let a = <div id="first-div-id" name="a">
//     <span>123</span>
//     <span>456</span>
//     <span>789</span>
// </div>
// console.log(a)
// document.body.appendChild(a)
class Square extends Component {
    constructor (props) {
        super(props)
        this.state = {
            value : ''
        }
    }
    render () {
      return (
        <button className="square" onClick={() => this.setState({value: 'X'})}>
            { this.state.value }
        </button>
      )
    }
}

class Board extends Component {
    renderSquare (i) {
      return (
        <Square value={i} />
      )
    }
    render () {
        return (
          <div>
            <div className="board-row">
              {this.renderSquare(0)}
              {this.renderSquare(1)}
              {this.renderSquare(2)}
            </div>
            <div className="board-row">
              {this.renderSquare(3)}
              {this.renderSquare(4)}
              {this.renderSquare(5)}
            </div>
            <div className="board-row">
              {this.renderSquare(6)}
              {this.renderSquare(7)}
              {this.renderSquare(8)}
            </div>
          </div>
        )
    }
}

let board = <Board/>
console.log(board)
ToyReact.render(
    board,
    document.body
)