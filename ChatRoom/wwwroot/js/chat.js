"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

connection.start().then(function () {
    $(".btnLogin").prop("disabled", false)
}).catch(function (err) {
    return console.error(err.toString());
});

connection.on("Online", function (data) {
    write(data);
});

connection.on("Receive", function (data) {
    write(data,"me");
});

write({ "info": "聊天室热词 #匿名# #分享# #聊天#" });


var HtmlUtil = {
    /*1.用浏览器内部转换器实现html转码*/
    htmlEncode: function (html) {
        //1.首先动态创建一个容器标签元素，如DIV
        var temp = document.createElement("div");
        //2.然后将要转换的字符串设置为这个元素的innerText(ie支持)或者textContent(火狐，google支持)
        (temp.textContent != undefined) ? (temp.textContent = html) : (temp.innerText = html);
        //3.最后返回这个元素的innerHTML，即得到经过HTML编码转换的字符串了
        var output = temp.innerHTML;
        temp = null;
        return output;

    },
    /*2.用浏览器内部转换器实现html解码*/
    htmlDecode: function (text) {
        //1.首先动态创建一个容器标签元素，如DIV
        var temp = document.createElement("div");
        //2.然后将要转换的字符串设置为这个元素的innerHTML(ie，火狐，google都支持)
        temp.innerHTML = text;
        //3.最后返回这个元素的innerText(ie支持)或者textContent(火狐，google支持)，即得到经过HTML解码的字符串了。
        var output = temp.innerText || temp.textContent;
        temp = null;
        return output;

    }
};

//输入
function write(data, eleClass) {
    var $output = $("#output");

    //系统消息
    if (data.info) {
        $output.append("<div class='msgBlockInfo'>【系统】" + data.info + "</div>");
        $output.scrollTop($output[0].scrollHeight);
        return;
    }

    if (data.time) {
        $output.append("<div class='msgBlockTime'>" + moment(data.time).format("YYYY-MM-DD HH:mm:ss"), + "</div>");
    }
    var gender = data.gender === "男" ? "♂" : "♀";
    $output.append("<div class='msgBlockContent'><span class=" + eleClass + ">" + HtmlUtil.htmlEncode(data.userName) + "(" + gender + ")：</span><span class='msgContent'>" + HtmlUtil.htmlEncode(data.message) + "</span></div>");
    $output.scrollTop($output[0].scrollHeight);
}

//登录上下（连接）
function login() {
    var userName = HtmlUtil.htmlEncode($(".userName").val());
    if (!userName) {
        write({ "info": "起个帅气的名字吧" });
        return;
    }
    $(".btnLogin").prop("disabled", true)
        .css("background-color", "#BFBFBF")
        .text("登录中...");
    var data = {
        "message": $("#sendInput").val() || "抖一下~~",
        "time": new Date(),
        "userName": $(".userName").val() || "匿名",
        "gender": $(":radio:checked").val(),
        "info": userName + "进入聊天室"
    };
    connection.invoke("Login", data).then(function () {
        $(".logout").removeClass("displayNone");
        $(".login").addClass("displayNone");
    }).catch(function (err) {
        return console.error(err.toString());
    });

    //TODO：异常机制处理
}

//回车发送消息
$("#sendInput").keydown(function (e) {
    if (e.keyCode === 13) {
        send();
    }
});

//回车登录
$(".userName").keydown(function (e) {
    if (e.keyCode === 13) {
        login();
    }
});

//发送消息
function send() {
    if (!$("#sendInput").val()) {
        return;
    }
    var data = {
        "message": $("#sendInput").val() || "抖一下~~~~",
        "time": new Date(),
        "userName": $(".userName").val() || "匿名",
        "gender": $(":radio:checked").val(),
    };
    connection.invoke("Send", data).then(function () {
        $("#sendInput").val("");
    }).catch(function (err) {
        return console.error(err.toString());
    });
    
}

//下线（关闭连接）
function logout() {
    var userName = HtmlUtil.htmlEncode($(".userName").val());
    var data = {
        "info": userName + "离开聊天室"
    };
    connection.invoke("Logout", data).then(function () {
        $(".logout").addClass("displayNone");
        $(".login").removeClass("displayNone");
        $(".btnLogin").prop("disabled", false)
            .css("background-color", "#fff")
            .text("登录");
    }).catch(function (err) {
        return console.error(err.toString());
    });
}