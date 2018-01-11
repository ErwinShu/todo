var fs = require('fs')
var express = require('express')
var bodyParse = require('body-parser')

var app = express()

var data = 'data.json';
var todoList = JSON.parse(fs.readFileSync(data, 'utf8'))

app.use(express.static('static'))
app.use(bodyParse.json())

var sendHtml = function(path, response) {
    var options = {
        encoding: 'utf-8'
    }
    fs.readFile(path, options, function(err, data){
        console.log(`读取的html文件 ${path} 内容是`, data)
        response.send(data)
    })
}

var save = function(value) {
    var stringData = JSON.stringify(value)
    fs.writeFile(data, stringData, (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log('保存成功')
        }
    })
}

app.get('/', function(request, response) {
    var path = 'index.html'
    var options = {
        encoding: 'utf-8'
    }
    fs.readFile(path, options, function(err, data){
        response.send(data)
    })
})

var todoAdd = function(todo) {
    if(todoList.length === 0) {
        todo.id = 1
    } else {
        todo.id = todoList[todoList.length-1].id + 1
    }
    todoList.push(todo)
    save(todoList)
    return todo
}

var todoUpdate = function(todo) {
    var id = todo.id
    for(var i = 0; i < todoList.length; i++) {
        var t = todoList[i]
        if(t.id == id) {
            t.task = todo.task
            return t
        }
    }
    save(todoList)
    return todo
}

var todoDelete = function (id) {
    id = Number(id)
    var index = -1
    for(var i = 0; i < todoList.length; i++) {
        var t = todoList[i]
        if(t.id == id) {
            index = i
            break
        }
    }
    if(index > -1) {
        var todo = todoList.splice(index, 1)
        save(todo)
        return todo[0]
    } else {
        return null
    }
}

var sendJSON = function (response, object) {
    var data = JSON.stringify(object)
    response.send(data)
}

// 获取所有 todo 的路由
app.get('/todo/all', function(request, response) {
    var r = JSON.stringify(todoList, null, 2)
    response.send(r)
})

// 添加 todo 的路由
app.post('/todo/add', function(request, response) {
    // request.body
    var todo = request.body
    var t = todoAdd(todo)
    sendJSON(response, t)
})

app.post('/todo/update/:id', function(request, response) {
    var id = request.params.id
    console.log('update', id, typeof id)
    var todo = request.body
    var t = todoUpdate(todo)
    sendJSON(response, t)
})

// 删除 todo 的路由
app.get('/todo/delete/:id', function(request, response) {
    var id = request.params.id
    var t = todoDelete(id)
    sendJSON(response, t)
})

var server = app.listen(8081, function () {
  var host = server.address().address
  var port = server.address().port
})
