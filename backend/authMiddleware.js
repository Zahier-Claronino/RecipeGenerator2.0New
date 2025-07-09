const admin = require('./firebaseAdmin');

async function authMiddleware(req,res,next){
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer')){
        return res.status(401).json({message:'No Token Provided'});
    }

    const token = authHeader.split(' ')[1];

    try{
        const decodedToken = await admin.auth().verifyIdToken(token);

        req.user = decodedToken;
        next();
    } catch (err){
        console.error('Token verification failed: ', err);
        res.status(403).json({message: 'Invalid or expired Token'});
    }
        
}

module.exports = authMiddleware;