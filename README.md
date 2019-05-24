![alt text](https://github.com/lpmi-13/touchwords/blob/master/static/assets/images/logo.png 'logo')

A simple visual game to target sensitivity to incorrect overgeneralizations of past tense inflections in verbs. Tap the incorrect forms to gain points, but don't tap the correct forms, or you lose one of your lives. If you lose all three lives, then the game is over.

During the regular round, irregular verbs are worth 10 points, but in the bonus round, correcting the incorrect irregular forms is worth 50 points. Extra points are also given for completing the bonus round with time remaining.

## install and build
`npm install`
then
`gulp`

if you want to build for a particular redirected subdomain (eg,
from netlify), pass the following at build time
`BUILD_TARGET_URL_PATH=PATHHERE`

for example, this game is currently hosted at https://www.grammarbuffet.org/touchwords (which is a redirect from the host), so
the full build command for that would be:
`BUILD_TARGET_URL_PATH=/touchwords/ npm run build-prod`
