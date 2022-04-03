const token = localStorage.getItem('token')
if(!token) {
    alert('You need to log in first')
    window.location.href = '/'
}

window.addEventListener('beforeunload', function (e) {e.returnValue = 'Are you sure you want to leave?'})

let imgUrl

$('#title').on('keyup', () => $('#message').text(''))
$('#content').on('keyup', () => $('#message').text(''))

$('#imageUploaderBack').change(function(){
    const loader = $('<span></span>').attr('id', 'imageLoader').text('Image is loading')
    $(this).after(loader)
    const uploader = document.getElementById('imageUploaderBack')
    const image = uploader.files[0]
    const formData = new FormData()
    formData.append('image', image)
    fetch('/api/upload', {method: 'post', body: formData}).then(response => response.json()).then(result =>
    {
        imgUrl = result.imageData.secure_url
        loader.text('Uploaded')
    }).catch(e => {if(e) console.log(e)})
})

$('#submit').on("click", async (e) => {
    e.preventDefault();
    const title = $('#title').val()
    const content = $('#content').val()
    let hashtags = $('#hashtags').val().split(',').map(hashtag => hashtag.trim().toLowerCase())
    if((hashtags.length === 2 && hashtags[0] === 'enter your hashtags' && hashtags[1] === 'divided by a comma') || !hashtags) {hashtags = []}
    const token = localStorage.getItem('token')
    await fetch('/api/posts', {method: 'post', body: JSON.stringify({title, content, hashtags, token, imgUrl}), headers: {'Content-Type': 'application/json'}})
        .then(result => {
            if (result.ok) {
                alert('Post has been created!')
                window.location.href = '/'
            } else return result.json()
                .then(response => {
                    const message = $('#message')
                    message.text(response.error.map(item => item.msg)[0])
                })
        })
        .catch(e => {if(e) console.log(e)})
})