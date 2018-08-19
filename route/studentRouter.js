//导入express
const express=require("express")
//导入art-template
const template = require('art-template');
//获取自己封装的数据
const helper=require("../tools/helper")
//导入自己封装的工具\
const managerRouter=require("./managerRouter")
//导入path 生成路径
const path=require("path")
//获取路由对象
let router=express.Router()

//注册一个自定义的中间件,判断登录状态
router.use((req,res,next)=>{
    //console.log(req.url);
    //除了登录,都要判断登录状态
    // if(req.url!="/logout"){
    //     if(req.session.userName){
    //         next()
    //     }else{
    //         //打回登录页面
    //         helper.tips(res,"请登录","/manager/login")
    //     }
    // }else{
    //    //登出页面
    //    next()
    // }
    next()
})

//4注册路由
//4.1首页的路由
router.get("/index", (req, res) => {
    // res.sendFile(path.join(__dirname,"../template/index.html"))
    //判读是否查询数据
    //查询的条件
    let obj={}
    if(req.query.search){
        obj={
            userName:{
                $regex:req.query.search
            }
        }
    }else{

    }
    helper.find("student", obj, (result) => {
        // 读取首页,渲染数据
        var html = template(path.join(__dirname, "../template/index.html"), {
            userName: req.session.userName,
            result,
            keyword:req.query.search //  有值 就是传递的值 没有值 就是 undefined
        });
        res.send(html)

    })

})

//4.2退出
router.get("/logout",(req,res)=>{
    //删除seesion里的userName
    delete req.session.userName
    //打回到登录页面
    res.redirect("/manager/login")
})

//4.3直接渲染新增页面
router.get("/insert",(req,res)=>{
    //查询数据,渲染数据
    //填充模板
    var html = template(path.join(__dirname, "../template/add.html"), {
        userName:req.session.userName
      });
      res.send(html)
})

//4.4新增页面
router.post("/insert",(req,res)=>{
    console.log(req.body);
    helper.insertOne("student",req.body,(result)=>{
        if(result.n==1){
            helper.tips(res,"新增成功","/student/index")
        }
    })
    
})

//4.5 删除数据
router.get("/delete/:id",(req,res)=>{
    //接受数据,删除数据,返回首页
    let _id=req.params.id
    helper.deleteOne("student",{_id:helper.ObjectId(_id)},(result)=>{
        if(result.n==1){
            helper.tips(res,"删除成功","/student/index")
        }
    })
})

//4.6编辑页面
router.get('/edit/:id', (req, res) => {
    // 接收id
    let _id = req.params.id
    // 根据id查询数据
    helper.find("student", { _id: helper.ObjectId(_id) }, (result) => {
        let html = template(path.join(__dirname, '../template/edit.html'), {
            userInfo: result[0],
            userName:req.session.userName
        })
        // 返回结果
        res.send(html);
    })
})
// 保存编辑数据
router.post('/edit', (req, res) => {
    // res.send(req.body);
    // 接收数据 浏览器看到的 _id两边的 \" 是插件自动添加的 数据中并没有
    let _id = req.body._id;

    _id = _id.replace('"','');
    _id = _id.replace('"','');
    console.log(_id);
    delete req.body._id;
    // console.log(req.body);
    // 修改数据
    helper.updateOne('student',{_id:helper.ObjectId(_id)},{$set:req.body},(result)=>{
        // res.send(result);
        if(result.n==1){
            helper.tips(res,'修改成功','/student/index');
        }
    } )
    // 根据结果
    // 提示用户
    // 去首页
})
//暴露出去
module.exports=router