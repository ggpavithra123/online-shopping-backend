const sendToken = (user, statusCode, res) => {

    const token = user.getJwtToken();

    const options = {
        expires: new Date(
            Date.now() +
            process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,

        // ⭐ REQUIRED FOR localhost React + Express
        sameSite: "lax",
        secure: false,
    };

    res
        .status(statusCode)
        .cookie("token", token, options)
        .json({
            success: true,
            token,
            user
        });
};

module.exports = sendToken;
