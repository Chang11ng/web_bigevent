$(function() {
    var layer = layui.layer
    var form = layui.form
    var laypage = layui.laypage

    //定义美化时间过滤器
    template.defaults.imports.dateFormat = function(date) {
            const dt = new Date(date)
            var y = dt.getFullYear()
            var m = padZero(dt.getMonth() + 1)
            var d = padZero(dt.getDate())

            var hh = padZero(dt.getHours())
            var mm = padZero(dt.getMinutes())
            var ss = padZero(dt.getSeconds())

            return y + '-' + m + '-' + d + '' + hh + ':' + mm + ':' + ss
        }
        // 定义补0函数
    function padZero(n) {
        return n > 9 ? n : '0' + n
    }

    var q = {
        pagenum: 1,
        pagesize: 2,
        cate_id: '',
        state: ''
    }

    initTable()
    initCate()

    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function(res) {
                console.log(res);
                if (res.status !== 0) {
                    return layer.msg('获取文章列表失败!')
                }
                //使用模板引擎渲染
                var htmlStr = template('tpl-table', res)
                $('tbody').html(htmlStr)
                renderPage(res.total)
            }
        })
    }

    // 初始化文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('获取分类数据失败!')
                }
                // 调用模板引擎渲染分类的可选项
                var htmlStr = template('tpl-cate', res)
                $('[name=cate_id]').html(htmlStr)
                form.render()
            }
        })
    }

    // 为筛选表单绑定submit事件
    $('#form-search').on('submit', function(e) {
        e.preventDefault()
        var cate_id = $('[name=cate_id]').val()
        var state = $('[name=state]').val()
        q.cate_id = cate_id
        q.state = state
        initTable()
    })

    // 定义渲染分页的方法
    function renderPage(total) {
        laypage.render({
            elem: 'pageBox',
            count: total,
            limit: q.pagesize,
            limits: [2, 3, 5, 10],
            curr: q.pagenum,
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            jump: function(obj, frist) {
                q.pagenum = obj.curr
                q.pagesize = obj.limit
                if (!frist) {
                    initTable()
                }
            }
        })
    }

    $('tbody').on('click', '.btn-delete', function() {
        var len = $('.btn-delete').length
        var id = $(this).attr('data-id')
        layer.confirm('确认删除?', { icon: 3, title: '提示' }, function(index) {
            $.ajax({
                method: 'GET',
                url: '/my/article/delete/' + id,
                success: function(res) {
                    if (res.status !== 0) {
                        return layer.msg('删除文章失败!')
                    }
                    layer.msg('删除文章成功!')

                    if (len == 1) {
                        q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1
                    }
                    layer.close(index)
                    initTable()
                }
            })
        })
    })
})