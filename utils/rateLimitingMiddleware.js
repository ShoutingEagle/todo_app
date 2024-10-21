const rateLimitingModel = require('../schemas/rateLimitingSchema')

module.exports = rateLimitingMiddleware = async (req,res,next) => {
    const sessionId = req.session.id
    

            try {
                const rateLimiting= await rateLimitingModel.findOne({sessionId})
                if(!rateLimiting){
                    const rateLimitingObj= new rateLimitingModel({
                        sessionId,
                        timeStamp: Date.now()
                    })
                    rateLimitingObj.save()
                }
                const timeStampData = Date.now() - rateLimiting.timeStamp

                if(timeStampData >= 60000){
                    await rateLimitingModel.updateOne({timeStamp: Date.now()})
                    console.log('first');
                    
                    next()
                }else{
                    res.send({message: 'too many requests, please try after sometimes',status: 'failed'})
                }
                
            } catch (error) {
                return res.send({
                    status: 500,
                    message: 'internal error',
                    error: error
                })
            }
}