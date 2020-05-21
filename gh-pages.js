const ghpages = require('gh-pages');

ghpages.publish('dist', {
    message: 'GitHub Pages Auto-deploy.'
}, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('Successfully deployed to GitHub Pages.')
    }
})