

function refreshTokenCookieOptions(expires_ms){
    let cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        expires: new Date(expires_ms),
        maxAge: expires_ms ? undefined : 0
    }
    return cookieOptions;
}

const isGoogleProvider = async(currentUser) => {
    return !!currentUser.googleId;
}

// function accessTokenCookieOptions(expires_ms){
//     let cookieOptions = {
//         secure: true,
//         sameSite: 'strict',
//         path: '/',
//         expires: new Date(expires_ms),
//         maxAge: expires_ms ? undefined : 0
//     }
//     return cookieOptions;
// }

module.exports = { refreshTokenCookieOptions, isGoogleProvider }