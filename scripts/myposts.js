let postsString = '<%-postsString%>'

const token = localStorage.getItem('token')
if(!token) {
    alert('You need to log in first')
    window.location.href = '/'
}

const addDelete = () => {
    $('.mainDeleteButton').click(function (e) {
        e.stopPropagation()
        const id = $(this).attr('id').substring(2)
        fetch('/api/posts', {
            method: 'delete',
            body: JSON.stringify({id}),
            headers: {'Content-Type': 'application/json'}
        })
            .then(response => {
                if (response.ok) return response.json()
            }).then(result => {
                location.reload()
            }
        )
    })
}

const addUpdate = () => {
    $('.mainEditButton').click(function (e) {
        if ($(this).text() === 'Edit') {
            $('.mainDeleteButton').css('display', 'none')
            const originalHashtagsParagraph = $(this).parent().parent().next().children().eq(0)
            const originalContentParagraph = $(this).parent().parent().next().children().eq(1)
            const originalHashtags = []
            for (let i = 0; i < $(this).parent().parent().siblings().eq(0).children().eq(0).children().length; i++) {
                originalHashtags.push($(this).parent().parent().siblings().eq(0).children().eq(0).children().eq(i).text())
            }
            const originalContent = $(this).parent().parent().siblings().eq(0).children().eq(1).text()
            const newHashtagsInput = $(`<textarea placeholder="enter hashtags, separated by comma" id='eht_${$(this).attr('id').substring(3)}'>${originalHashtags.join(', ')}</textarea>`)
            const newContentInput = $(`<textarea id='ec_${$(this).attr('id').substring(3)}'>${originalContent}</textarea>`)
            originalContentParagraph.remove()
            originalHashtagsParagraph.remove()
            $(this).parent().parent().siblings().eq(0).children().eq(0).before(newHashtagsInput)
            $(this).parent().parent().siblings().eq(0).children().eq(0).before(newContentInput)
            let newValueContent = originalContent
            let newValueHashtags = originalHashtags.join(', ')
            $($(this).parent().parent().next().children().eq(1)).keyup(function () {
                newValueHashtags = $(this).val()
            })
            $($(this).parent().parent().next().children().eq(0)).keyup(function () {
                newValueContent = $(this).val()
            })
            const editHeader = $(`#eh_${$(this).attr('id').substring(3)}`)
            const headerId = 'h_' + editHeader.attr('id').substring(3)
            const temp = $(this)
            const tempId = 'ei_' + $(this).attr('id').substring(3)
            $(temp).before(`<input value='${$('#' + headerId).text()}' type='text' id='${tempId}'></input>`)
            $('#' + tempId).click(function (e) {
                e.stopPropagation()
            })
            $(this).text('Save')
            $('#' + headerId).remove()
            let newValue = $(this).prev().val()
            $(this).prev().keyup(function () {
                newValue = $(this).val()
            }) //SAVE VALUES TO THE VARIABLE VALUE
            $(this).click(function () {
                const newTitle = newValue
                const id = $(this).attr('id').substring(3)
                fetch('/api/posts', {
                    method: 'put',
                    body: JSON.stringify({
                        id,
                        title: newTitle,
                        content: newValueContent,
                        hashtags: newValueHashtags.split(',').map(hashtag => hashtag.trim())
                    }),
                    headers: {'Content-Type': 'application/json'}
                })
                    .then(response => {
                        if (response.ok) return response.json()
                    }).then(result => {
                    if (result.error) $(this).after($('<span></span>').addClass('errorHeader').text(result.error))
                    else {
                        $('.error').text('')
                        location.reload()
                    }
                })
            })
        } else {
            if (!$('.errorHeader').text().length) return
            const tempId = 'ei_' + $(this).attr('id').substring(3)
            const editInput = $('#' + tempId)
            const newElementId = 'h_' + $(this).attr('id').substring(3)
            $(editInput).before(`<h3 class='header' id=${newElementId}>${$(this).attr('id').substring(3).split('_').join(' ')}</h3>`)
            $('#' + tempId).remove()
            $(this).text('Edit')
        }
    })
}

const addClick = () => {
    $('.firstRow').click(function(){
        if($(this).children().eq(1).text() === 'Save') $(this).next().css('display', 'block')
        else $(this).next().toggle(500)
    })
}

const getPosts = () => {
    const loading = $('<span></span>').addClass('loader').text('Loading...')
    $('.mainAllPostsContainer').append(loading)
    const token = localStorage.getItem('token')
    fetch('/api/myposts', {method: "post", body: JSON.stringify({token}), headers: {'Content-Type': 'application/json'}})
        .then(response => response.json()).then(result => {
        const arr = result.reverse().map(post => {
            const mapping = (post) => post.hashtags.map(hashtag => `<span class='hashtag'>${hashtag}</span>`)
            return (
                `<div class="mainOnePostContainer">
                        <div class="firstRow" style="background-image: url(${post.imgUrl}); background-position: center; background-size: cover";>
                        <h3 id='h_${post._id}' class="header">${post.title}</h3>
                        <div><button id="eh_${post._id}" class="mainEditButton">Edit</button><button id="d_${post._id}" class="mainDeleteButton">Delete</button></div>
                        </div>
                        <div class='secondRow' style="display: none">
                    <p id="ht_${post._id}" class="hashtags">${post.hashtags.length ? mapping(post).join('') : 'No hashtags defined'}</p>
                    <p id='c_${post._id}' class="content">${post.content}<br/></p>
                    <p class="date">Created at: ${post.date.toString().split('T')[0]}</p>
                    <button style="visibility: hidden"></button>     </div>
                    </div>`
            )
        })
        $('.loader').remove()
        !arr.length ? $('.mainAllPostsContainer').html(`<h3>Looks like you haven't posted anything yet :( <br/> <a href="/create">Wanna create your first post?</a></h3>`) :
        arr.forEach(item => $('.mainAllPostsContainer').append(item))
        addClick()
        addUpdate()
        addDelete()
    })
}
getPosts()