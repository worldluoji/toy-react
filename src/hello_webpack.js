import _ from 'lodash'

function component() {
  var element = document.createElement('div')

  // 这是Lodash（javascript的一个工具库）中的一个方法, 用于将Hello和webpack连接到一起
  element.innerHTML = _.join(['Hello', 'webpack'], ' ')

  return element
}
  
document.body.appendChild(component())
